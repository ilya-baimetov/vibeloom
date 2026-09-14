#!/usr/bin/env python3
"""
check-links.py — decidable link-integrity check for the VibeLoom skill surface.

Every relative markdown link in the skill surface must resolve to a file that
exists. This is the *decidable* rung of the verification ladder applied to the
skill's own artifacts: no judgement, no heuristics, boolean per link.

It exists because the v0.3.0 bundle shipped a SKILL.md whose first instruction
was "always consult these" followed by three links that resolved to nothing --
the tarball flattened the tree without rewriting the paths. The repo layout and
the bundle layout are now identical precisely so that one check covers both.

Usage
-----
    python3 check-links.py                 # check the version root (repo layout)
    python3 check-links.py --root DIR      # check an unpacked bundle
    python3 check-links.py --quiet         # only report failures

Exit codes: 0 = all links resolve, 1 = dangling link(s) found, 2 = bad invocation.

Checked: relative inline markdown links `[text](target)` in the surface files.
Skipped: absolute URLs (http/https/mailto), pure in-page anchors (#frag), and
protocol-relative links -- none of those are resolvable against the filesystem.
A `#fragment` suffix on a file path is stripped before the existence test; the
fragment itself is not validated (that would need heading extraction, which is
a separate, weaker check).
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# Inline markdown links: [label](target). Excludes image syntax deliberately --
# the surface has no images, and adding them later shouldn't silently pass.
LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")

SKIP_PREFIXES = ("http://", "https://", "mailto:", "//", "data:")

# The files that make up the skill surface, relative to the root being checked.
SURFACE_GLOBS = (
    "SKILL.md",
    "subagent-prompt.md",
    "SKILL-README.md",
    "references/*.md",
    "tasks/*.md",
    "artifacts/**/*.md",
    "examples/*.md",
)


def surface_files(root: Path) -> list[Path]:
    found: list[Path] = []
    for pattern in SURFACE_GLOBS:
        found.extend(sorted(root.glob(pattern)))
    return [p for p in found if p.is_file()]


def check(root: Path, quiet: bool = False) -> int:
    files = surface_files(root)
    if not files:
        print(f"check-links: error: no surface files found under {root}", file=sys.stderr)
        return 2

    total = 0
    dangling: list[tuple[Path, str, Path]] = []

    for path in files:
        text = path.read_text(encoding="utf-8")
        for target in LINK_RE.findall(text):
            if target.startswith(SKIP_PREFIXES) or target.startswith("#"):
                continue
            total += 1
            # Strip any #fragment; resolve relative to the linking file's dir.
            bare = target.split("#", 1)[0]
            if not bare:
                continue
            resolved = (path.parent / bare).resolve()
            if not resolved.exists():
                dangling.append((path.relative_to(root), target, resolved))

    if dangling:
        print(f"DANGLING LINKS ({len(dangling)} of {total} checked):", file=sys.stderr)
        for src, target, resolved in dangling:
            print(f"  - {src}: {target}", file=sys.stderr)
            print(f"      -> {resolved}", file=sys.stderr)
        return 1

    if not quiet:
        print(f"OK: {total} relative links across {len(files)} surface files all resolve")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).parent,
        help="root of the skill surface to check (default: alongside this script)",
    )
    parser.add_argument("--quiet", action="store_true", help="only print on failure")
    args = parser.parse_args()

    if not args.root.is_dir():
        print(f"check-links: error: not a directory: {args.root}", file=sys.stderr)
        return 2
    return check(args.root, args.quiet)


if __name__ == "__main__":
    sys.exit(main())
