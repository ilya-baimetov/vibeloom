#!/usr/bin/env python3
"""
VibeLoom site static integrity checker (SITE-10 mitigation).

Validates:
  - Internal local links resolve (relative file paths and absolute /paths under site root).
  - Fragment links (#anchor) target existing id="anchor" or name="anchor" attributes.
  - Each public HTML page declares <link rel="canonical">.
  - sitemap.xml URLs each map to an existing page on disk.
  - llms.txt is not empty and mentions a current-version anchor (`v0.3` / `v03`).
  - No duplicate <title> across distinct public pages.

Exit code:
  0 = clean
  1 = defects found (printed to stderr)

Usage:
  python3 site/scripts/check_site.py [--root site/public]
"""

from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote


# ---------------------------- HTML parsing ---------------------------- #


class IdTitleCollector(HTMLParser):
    """Collects element ids, name attributes, anchor hrefs, and the <title> text."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: set[str] = set()
        self.hrefs: list[str] = []
        self.srcs: list[str] = []
        self.has_canonical: bool = False
        self.title: str | None = None
        self._in_title: bool = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_dict = {k: (v or "") for k, v in attrs}
        if "id" in attr_dict:
            self.ids.add(attr_dict["id"])
        if "name" in attr_dict and tag == "a":
            self.ids.add(attr_dict["name"])
        if tag == "a" and "href" in attr_dict:
            self.hrefs.append(attr_dict["href"])
        if tag in {"link", "script", "img", "source"} and "href" in attr_dict and tag == "link":
            rel = attr_dict.get("rel", "").lower()
            if "canonical" in rel.split():
                self.has_canonical = True
        if "src" in attr_dict:
            self.srcs.append(attr_dict["src"])
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title = (self.title or "") + data


def parse_page(path: Path) -> IdTitleCollector:
    parser = IdTitleCollector()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    return parser


# ---------------------------- link resolution ---------------------------- #


def is_external(url: str) -> bool:
    parts = urlsplit(url)
    return bool(parts.scheme) or url.startswith("mailto:") or url.startswith("tel:")


def resolve_local(root: Path, page: Path, ref: str) -> Path | None:
    """Resolve `ref` (relative or absolute `/path`) to a file under `root`."""
    ref_clean = unquote(ref.split("#", 1)[0].split("?", 1)[0])
    if not ref_clean:
        return None  # pure fragment, handled by caller
    if ref_clean.startswith("/"):
        target = root / ref_clean.lstrip("/")
    else:
        target = (page.parent / ref_clean).resolve()
    return target


def page_for_path(root: Path, target: Path) -> Path | None:
    """Map a resolved path to the page file on disk.

    Handles: existing file, directory -> index.html, no-extension URL -> <name>.html.
    """
    if target.is_file():
        return target
    if target.is_dir():
        idx = target / "index.html"
        if idx.is_file():
            return idx
        return None
    html_candidate = target.with_suffix(".html")
    if html_candidate.is_file():
        return html_candidate
    # encoded /codæ-manifesto often arrives as the literal unicode path
    return None


# ---------------------------- checks ---------------------------- #


def check_site(root: Path) -> list[str]:
    defects: list[str] = []

    html_pages = sorted(root.glob("*.html"))
    if not html_pages:
        return [f"No HTML pages found under {root}"]

    parsed: dict[Path, IdTitleCollector] = {p: parse_page(p) for p in html_pages}

    # Canonical tags
    for page, p in parsed.items():
        if not p.has_canonical:
            defects.append(f"{page.name}: missing <link rel=\"canonical\">")

    # Duplicate titles
    title_to_pages: dict[str, list[str]] = {}
    for page, p in parsed.items():
        title = (p.title or "").strip()
        if not title:
            defects.append(f"{page.name}: empty or missing <title>")
            continue
        title_to_pages.setdefault(title, []).append(page.name)
    for title, pages in title_to_pages.items():
        if len(pages) > 1:
            defects.append(f"Duplicate <title> {title!r} across: {', '.join(pages)}")

    # Local link resolution
    for page, p in parsed.items():
        for ref in p.hrefs + p.srcs:
            if not ref or is_external(ref):
                continue
            if ref.startswith("#"):
                frag = ref[1:]
                if frag and frag not in p.ids:
                    defects.append(f"{page.name}: fragment #{frag} not found on same page")
                continue
            target = resolve_local(root, page, ref)
            if target is None:
                continue
            target_page = page_for_path(root, target)
            if target_page is None:
                # tolerate non-html resources (css, js, images) if file exists at the resolved path
                if not target.exists():
                    defects.append(f"{page.name}: broken link {ref!r} -> {target}")
                continue
            # Fragment validation
            if "#" in ref:
                frag = unquote(ref.split("#", 1)[1])
                target_parser = parsed.get(target_page) or parse_page(target_page)
                parsed[target_page] = target_parser
                if frag and frag not in target_parser.ids:
                    defects.append(
                        f"{page.name}: link {ref!r} points to missing fragment #{frag} on {target_page.name}"
                    )

    # sitemap coverage
    sitemap = root / "sitemap.xml"
    if not sitemap.is_file():
        defects.append("sitemap.xml: missing")
    else:
        loc_re = re.compile(r"<loc>([^<]+)</loc>")
        for match in loc_re.finditer(sitemap.read_text(encoding="utf-8")):
            url = match.group(1).strip()
            parts = urlsplit(url)
            path = unquote(parts.path.lstrip("/"))
            if not path:
                continue
            target = root / path
            target_page = page_for_path(root, target)
            if target_page is None:
                defects.append(f"sitemap.xml: <loc>{url}</loc> does not map to a page on disk")

    # llms.txt freshness
    llms = root / "llms.txt"
    if not llms.is_file():
        defects.append("llms.txt: missing")
    else:
        text = llms.read_text(encoding="utf-8")
        if not text.strip():
            defects.append("llms.txt: empty")
        elif not re.search(r"v0?\.?3", text):
            defects.append("llms.txt: no v0.3 / v03 anchor — possibly stale")

    return defects


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--root",
        default=str(Path(__file__).resolve().parent.parent / "public"),
        help="Site root (default: ../public relative to this script)",
    )
    args = ap.parse_args()
    root = Path(args.root).resolve()
    if not root.is_dir():
        print(f"Site root does not exist: {root}", file=sys.stderr)
        return 1
    defects = check_site(root)
    if defects:
        print(f"Site check FAILED with {len(defects)} defect(s):", file=sys.stderr)
        for d in defects:
            print(f"  - {d}", file=sys.stderr)
        return 1
    print(f"Site check OK ({root})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
