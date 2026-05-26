#!/usr/bin/env python3
"""
extract-templates.py — Extract templates/ tree from vibeloom-templates.md.

Source of truth: vibeloom-templates.md contains every template body inside fenced
blocks tagged with their destination path. The outer fence uses **four** backticks
so that ordinary 3-backtick fences inside the template body (e.g. ```yaml) do
not prematurely close it:

    ````template:tasks/init.md
    # Initialize

    ```yaml
    inputs: ...
    ```
    ````

The block opens with four backticks immediately followed by `template:` and a
relative path. The block closes with a line of exactly four backticks (no
language tag, no other characters). Everything between the markers (verbatim,
no trimming) is written to `templates/<path>`. Directories are created as
needed.

Usage
-----
    python3 vibeloom-dev/scripts/extract-templates.py \
      --source vNN/canon/vibeloom-templates.md \
      --dest vNN/skill/

    python3 vibeloom-dev/scripts/extract-templates.py --check \
      --source vNN/canon/vibeloom-templates.md \
      --dest vNN/skill/

Both modes are idempotent. --check reads the source, builds the would-be tree
in memory, and diffs against the on-disk tree without writing anything.

The destination is always explicit. This script lives in `vibeloom-dev/`, while
the template source and destination belong to a specific version tree.
"""

from __future__ import annotations

import argparse
import hashlib
import re
import sys
from pathlib import Path

# Regex anchors: a line that is exactly ```template:<path> opens a block; the
# next line that is exactly ``` (no language tag, no trailing chars) closes it.
# Using line-anchored matching avoids confusion with fenced blocks INSIDE a
# template body — e.g. a template that itself contains a ```yaml fence — as
# long as the inner fence isn't a ```template: tag (which it shouldn't be).
OPEN_RE  = re.compile(r"^````template:(?P<path>\S+)\s*$")
CLOSE_RE = re.compile(r"^````\s*$")


def parse_templates_md(source: Path) -> dict[str, str]:
    """Return a mapping of relative-path -> body-text parsed from source."""
    if not source.exists():
        die(f"templates source not found: {source}")

    out: dict[str, str] = {}
    state = "outside"          # outside | inside
    current_path: str | None = None
    current_lines: list[str] = []
    open_line = -1

    for lineno, raw_line in enumerate(source.read_text().splitlines(keepends=True), start=1):
        line_no_eol = raw_line.rstrip("\n")

        if state == "outside":
            m = OPEN_RE.match(line_no_eol)
            if m:
                current_path = m.group("path")
                if current_path in out:
                    die(f"duplicate template block for path '{current_path}' (second definition at line {lineno})")
                current_lines = []
                open_line = lineno
                state = "inside"
            continue

        # state == "inside"
        if CLOSE_RE.match(line_no_eol):
            # Close: emit and reset.
            assert current_path is not None
            out[current_path] = "".join(current_lines)
            current_path = None
            current_lines = []
            state = "outside"
            continue

        # Inside-body: collect verbatim, including the EOL.
        current_lines.append(raw_line)

    if state == "inside":
        die(f"unclosed template block opened at line {open_line} (path: {current_path})")

    if not out:
        die("no template blocks found in source")

    return out


def write_tree(blocks: dict[str, str], dest_root: Path) -> tuple[int, int]:
    """Write each block to dest_root/<path>. Returns (written, unchanged)."""
    written = 0
    unchanged = 0
    for rel_path, body in blocks.items():
        dest = dest_root / rel_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and dest.read_text() == body:
            unchanged += 1
            continue
        dest.write_text(body)
        written += 1
    return written, unchanged


def check_tree(blocks: dict[str, str], dest_root: Path) -> list[str]:
    """Return a list of human-readable drift descriptions (empty if no drift)."""
    drift: list[str] = []

    # Source-vs-disk: every source block must exist on disk and match.
    for rel_path, body in blocks.items():
        dest = dest_root / rel_path
        if not dest.exists():
            drift.append(f"missing on disk: {rel_path}")
            continue
        on_disk = dest.read_text()
        if on_disk != body:
            src_hash = hashlib.sha256(body.encode()).hexdigest()[:12]
            disk_hash = hashlib.sha256(on_disk.encode()).hexdigest()[:12]
            drift.append(f"differs: {rel_path}  source={src_hash}  disk={disk_hash}")

    # Disk-vs-source: every disk file under the dest tree should be sourced.
    expected = set(blocks.keys())
    if dest_root.exists():
        for path in dest_root.rglob("*"):
            if not path.is_file():
                continue
            rel = str(path.relative_to(dest_root))
            if rel in {".DS_Store"}:
                continue
            if rel not in expected:
                drift.append(f"orphan on disk (not in source): {rel}")

    return drift


def die(message: str) -> None:
    print(f"extract-templates: error: {message}", file=sys.stderr)
    sys.exit(2)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--source",
        type=Path,
        required=True,
        help="path to the versioned vibeloom-templates.md source",
    )
    parser.add_argument(
        "--dest",
        type=Path,
        required=True,
        help="destination root for extracted templates",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="drift check: do not write; exit non-zero if templates/ differs from source",
    )
    args = parser.parse_args()

    blocks = parse_templates_md(args.source)

    if args.check:
        drift = check_tree(blocks, args.dest)
        if drift:
            print(f"DRIFT detected ({len(drift)} item{'s' if len(drift) != 1 else ''}):", file=sys.stderr)
            for line in drift:
                print(f"  - {line}", file=sys.stderr)
            return 1
        print(f"OK: {len(blocks)} templates match disk")
        return 0

    written, unchanged = write_tree(blocks, args.dest)
    print(f"extracted {len(blocks)} templates -> {args.dest} ({written} written, {unchanged} unchanged)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
