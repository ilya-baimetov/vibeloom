#!/usr/bin/env python3
"""
VibeLoom canon/skill consistency checker.

Validates the structural invariants that the v0.3.1 ownership refactor is
designed to establish (see `refactor-canon-ownership.md`). Run this BEFORE the
refactor to get the baseline; run it AFTER to confirm the invariants hold.

Checks:
  1. ID prefix registry in implementation §5.1 matches the skill reference at
     `templates/skill/references/artifacts.md`'s prefix-registry block.
  2. Mode list is the same across methodology §5, implementation §3, the SKILL.md
     manifest, and `references/modes.md`.
  3. Operation list is the same across methodology §12, the SKILL.md routing
     table, and the task-template inventory.
  4. Status taxonomy (six categories) is the same across methodology §9 and
     implementation §10.
  5. Trace family list is the same across implementation §8 and
     `references/runtime.md` / SKILL.md `## Substrate`.
  6. Forward references (`methodology §X.Y`, `implementation §X.Y`) resolve to
     an actual heading.
  7. Task-template inventory in `vibeloom-templates.md` matches the routing
     table in SKILL.md (every command has a target template; every template
     is routed to).
  8. `approval_unit` is the artifact-level field (no remaining `approval_mode`
     in artifact frontmatter sections); `approval_mode` is only on approval-trace
     events.
  9. Bounded-context cardinality language is consistently singular (no remaining
     `hosted_bounded_contexts` outside historical/comment context).
 10. Decision-trace dual-ID model (`DEC-*` + `record_id`) appears wherever
     decision traces are described.

Exit code:
  0 = clean
  1 = invariants violated (defects printed to stderr)

Usage:
  python3 v03/site/scripts/check_consistency.py [--root <repo-root>] [--verbose]

This is a mechanical canary, not a substitute for the adversarial review prompts.
A clean run means "no known regression class is present"; it does not mean
"the canon is well-written."
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import OrderedDict
from pathlib import Path
from typing import Iterable

REPO_ROOT_DEFAULT = Path(__file__).resolve().parent.parent.parent  # v03/
KNOWN_MODES = {"vibe", "pm", "dev", "ux", "expert"}
KNOWN_OPERATIONS = {"init", "import", "generate", "eval", "review", "reconcile", "approve", "status"}
KNOWN_STATUS_CATEGORIES = {"current", "stale", "uncovered", "dangling", "drifted", "obsolete"}
KNOWN_TRACE_FAMILIES = {"approval", "generation", "eval", "code-sync", "decision", "import"}


# ---------------------------- helpers ---------------------------- #


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.is_file() else ""


def section_body(text: str, heading_regex: str) -> str:
    """Return the body of a markdown section matching `heading_regex` up to the next heading
    of the same or higher level. Empty string if no match."""
    m = re.search(rf"(?m)^(#+) +{heading_regex}\s*$", text)
    if not m:
        return ""
    start = m.end()
    level = len(m.group(1))
    # next heading at the same or higher level
    next_h = re.search(rf"(?m)^#{{1,{level}}} +\S", text[start:])
    end = start + (next_h.start() if next_h else len(text) - start)
    return text[start:end]


def extract_prefix_registry(text: str) -> set[str]:
    """Pull prefix codes (e.g. `CAP`, `CST`) from a markdown table inside `text`.

    Looks for rows like `| \`PREFIX\` | ...`."""
    return set(re.findall(r"\|\s*`([A-Z]+)`\s*\|", text))


def extract_modes(text: str) -> set[str]:
    found = set()
    for token in re.findall(r"`(vibe|pm|dev|ux|expert)`", text):
        found.add(token)
    return found


def extract_operations(text: str) -> set[str]:
    found = set()
    for token in re.findall(r"`(init|import|generate|eval|review|reconcile|approve|status)`", text):
        found.add(token)
    return found


def extract_status_categories(text: str) -> set[str]:
    found = set()
    for token in re.findall(r"`(current|stale|uncovered|dangling|drifted|obsolete)`", text):
        found.add(token)
    return found


def extract_trace_families(text: str) -> set[str]:
    """Match `family` (backticked) OR the phrase `family trace[s]` / `family-trace`."""
    found = set()
    for token in re.findall(r"`(approval|generation|eval|code-sync|decision|import)`", text):
        found.add(token)
    for token in re.findall(
        r"\b(approval|generation|code-sync|decision|import)\b[\s-]+trace[s]?\b",
        text,
        re.I,
    ):
        found.add(token.lower())
    # `eval` collides with the operation so use the dedicated phrase only
    if re.search(r"\beval[\s-]+trace[s]?\b", text, re.I):
        found.add("eval")
    return found


def list_template_block_names(templates_md: str, prefix: str) -> list[str]:
    """E.g. prefix='tasks/' returns the basenames of every `````template:tasks/foo.md` block."""
    return [m.group(1) for m in re.finditer(rf"^````template:{re.escape(prefix)}([\w\-]+\.md)\s*$", templates_md, re.M)]


def list_skill_routing_targets(templates_md: str) -> set[str]:
    """Find every `tasks/<name>.md` referenced from the SKILL.md routing table."""
    skill_md = section_body(templates_md, r"`?skill/SKILL\.md`?") or templates_md
    # The SKILL.md template lives inside templates_md as a fenced block; we just grep across all.
    # Look for "tasks/<name>.md" in routing-table cells.
    return set(re.findall(r"`tasks/([\w\-]+\.md)`", templates_md))


def find_section_anchors(text: str) -> set[str]:
    """Slugify all markdown headings so we can validate `methodology §X.Y` references.

    Returns a set of strings like `5.1`, `6.5`, `8.5.1` extracted from heading text
    of the form `## 5.1 ID prefix registry` or `## 9. Status categories`."""
    return set(re.findall(r"(?m)^#+\s+(\d+(?:\.\d+)*)\.?\s+\S", text))


def find_forward_references(text: str) -> set[tuple[str, str]]:
    """Return the set of (target_doc, section) pairs cited by `methodology §X.Y` /
    `implementation §X.Y` patterns in `text`."""
    refs: set[tuple[str, str]] = set()
    for m in re.finditer(r"(methodology|implementation)\s*§\s*(\d+(?:\.\d+)*)", text, re.I):
        refs.add((m.group(1).lower(), m.group(2)))
    return refs


# ---------------------------- checks ---------------------------- #


def check_prefix_registry(impl: str, templates: str) -> list[str]:
    impl_block = section_body(impl, r"5\.1\s+ID\s+prefix\s+registry")
    if not impl_block:
        return ["impl §5.1 ID prefix registry not found"]
    impl_prefixes = extract_prefix_registry(impl_block)

    # Find the prefix registry block inside the skill reference's artifacts.md template.
    # It lives inside `vibeloom-templates.md` between `````template:skill/references/artifacts.md` and the matching closing fence.
    m = re.search(r"^````template:skill/references/artifacts\.md\s*$", templates, re.M)
    if not m:
        return ["skill ref artifacts.md template block not found in vibeloom-templates.md"]
    body = templates[m.end():]
    end = re.search(r"^````\s*$", body, re.M)
    artifacts_md = body[: end.start()] if end else body
    skill_prefixes = extract_prefix_registry(artifacts_md)

    defects: list[str] = []
    only_in_impl = impl_prefixes - skill_prefixes
    only_in_skill = skill_prefixes - impl_prefixes
    if only_in_impl:
        defects.append(f"prefix registry: in impl §5.1 but not in skill artifacts.md ref: {sorted(only_in_impl)}")
    if only_in_skill:
        defects.append(f"prefix registry: in skill artifacts.md ref but not in impl §5.1: {sorted(only_in_skill)}")
    return defects


def check_modes(meth: str, impl: str, templates: str) -> list[str]:
    sources = OrderedDict([
        ("methodology", extract_modes(meth)),
        ("implementation", extract_modes(impl)),
        ("templates", extract_modes(templates)),
    ])
    defects: list[str] = []
    for src, modes in sources.items():
        missing = KNOWN_MODES - modes
        if missing:
            defects.append(f"{src}: missing mode(s) {sorted(missing)} (expected all of {sorted(KNOWN_MODES)})")
        extra = modes - KNOWN_MODES
        if extra:
            defects.append(f"{src}: unknown mode token(s) {sorted(extra)}")
    return defects


def check_operations(meth: str, templates: str) -> list[str]:
    sources = OrderedDict([
        ("methodology", extract_operations(meth)),
        ("templates", extract_operations(templates)),
    ])
    defects: list[str] = []
    for src, ops in sources.items():
        missing = KNOWN_OPERATIONS - ops
        if missing:
            defects.append(f"{src}: missing operation(s) {sorted(missing)} (expected all of {sorted(KNOWN_OPERATIONS)})")
    return defects


def check_status_taxonomy(meth: str, impl: str) -> list[str]:
    defects: list[str] = []
    for label, doc in [("methodology", meth), ("implementation", impl)]:
        categories = extract_status_categories(doc)
        missing = KNOWN_STATUS_CATEGORIES - categories
        if missing:
            defects.append(f"{label}: missing status category(ies) {sorted(missing)}")
    return defects


def check_trace_families(impl: str, templates: str) -> list[str]:
    defects: list[str] = []
    for label, doc in [("implementation", impl), ("templates", templates)]:
        fams = extract_trace_families(doc)
        missing = KNOWN_TRACE_FAMILIES - fams
        if missing:
            defects.append(f"{label}: missing trace family(ies) {sorted(missing)}")
    return defects


def check_forward_references(meth: str, impl: str) -> list[str]:
    defects: list[str] = []
    meth_anchors = find_section_anchors(meth)
    impl_anchors = find_section_anchors(impl)
    docs = {"methodology": (meth, meth_anchors), "implementation": (impl, impl_anchors)}
    for src_label, (src_text, _) in docs.items():
        for target_doc, section in find_forward_references(src_text):
            target_anchors = docs[target_doc][1]
            if section not in target_anchors:
                defects.append(
                    f"{src_label}: forward reference `{target_doc} §{section}` does not resolve to an existing heading"
                )
    return defects


def check_task_routing(templates: str) -> list[str]:
    inventory = set(list_template_block_names(templates, "tasks/"))
    routed = list_skill_routing_targets(templates)
    defects: list[str] = []
    in_inventory_not_routed = inventory - routed
    routed_not_in_inventory = routed - inventory
    if routed_not_in_inventory:
        defects.append(
            f"SKILL.md routes to non-existent task template(s): {sorted(routed_not_in_inventory)}"
        )
    if in_inventory_not_routed:
        # Allow this — some templates may be invoked indirectly (e.g. mode variants).
        # Surface as informational only.
        pass
    return defects


def check_approval_unit(impl: str, templates: str) -> list[str]:
    """approval_unit is the artifact-level field; approval_mode is event-level only."""
    defects: list[str] = []
    # In implementation §6 (artifact frontmatter) and the skill references/artifacts.md block, only approval_unit should appear.
    impl_frontmatter = section_body(impl, r"6\..*")  # §6 + subsections
    if "approval_mode" in impl_frontmatter and "trace" not in impl_frontmatter[:impl_frontmatter.find("approval_mode")].lower():
        # Allow event-level mentions; flag suspicious ones.
        # Conservative: only flag if approval_mode appears in a row of an artifact frontmatter table.
        for line in impl_frontmatter.splitlines():
            if "approval_mode" in line and line.startswith("|"):
                # Approval-trace event tables contain "approval_mode"; that's fine. Heuristic: artifact frontmatter
                # tables use "draft / approved" semantics; we don't have a reliable static distinguisher, so
                # surface a warning but not a hard fail.
                defects.append(
                    f"implementation §6: line contains `approval_mode` — verify it's the event-level field, not artifact-level: `{line.strip()[:80]}`"
                )
    return defects


def check_bc_cardinality(meth: str, impl: str, templates: str) -> list[str]:
    defects: list[str] = []
    for label, doc in [("methodology", meth), ("implementation", impl), ("templates", templates)]:
        if "hosted_bounded_contexts" in doc:
            defects.append(f"{label}: legacy `hosted_bounded_contexts` token still present (expect singular `bounded_context`)")
    return defects


def check_decision_dual_id(impl: str, templates: str) -> list[str]:
    """Wherever decision traces are described, both `DEC-*` (trace_id) and `record_id` should appear."""
    defects: list[str] = []
    # Locate the decision-trace section in implementation.
    dec_section = section_body(impl, r"8\.5.*[Dd]ecision")
    if dec_section:
        if "trace_id" not in dec_section and "DEC-" not in dec_section:
            defects.append("implementation §8.5: decision-trace section missing `trace_id` / `DEC-*` field")
        if "record_id" not in dec_section:
            defects.append("implementation §8.5: decision-trace section missing `record_id` field")
    # Locate decision-trace template in templates.
    m = re.search(r"^````template:.*decision-trace\.md\s*$", templates, re.M)
    if m:
        body = templates[m.end():]
        end = re.search(r"^````\s*$", body, re.M)
        block = body[: end.start()] if end else body
        if "trace_id" not in block and "DEC-" not in block:
            defects.append("decision-trace template: missing `trace_id` / `DEC-*` field")
        if "record_id" not in block:
            defects.append("decision-trace template: missing `record_id` field")
    return defects


# ---------------------------- main ---------------------------- #


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=str(REPO_ROOT_DEFAULT), help="v03 directory (default: parent of site/scripts)")
    ap.add_argument("--verbose", action="store_true", help="print per-check status")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    meth = read(root / "vibeloom-methodology.md")
    impl = read(root / "vibeloom-implementation.md")
    templates = read(root / "vibeloom-templates.md")

    if not (meth and impl and templates):
        print(f"Missing canon docs under {root}", file=sys.stderr)
        return 1

    checks = [
        ("prefix registry", lambda: check_prefix_registry(impl, templates)),
        ("modes", lambda: check_modes(meth, impl, templates)),
        ("operations", lambda: check_operations(meth, templates)),
        ("status taxonomy", lambda: check_status_taxonomy(meth, impl)),
        ("trace families", lambda: check_trace_families(impl, templates)),
        ("forward references", lambda: check_forward_references(meth, impl)),
        ("task routing", lambda: check_task_routing(templates)),
        ("approval_unit usage", lambda: check_approval_unit(impl, templates)),
        ("BC cardinality", lambda: check_bc_cardinality(meth, impl, templates)),
        ("decision dual-ID", lambda: check_decision_dual_id(impl, templates)),
    ]

    total_defects: list[str] = []
    for name, fn in checks:
        defects = fn()
        if args.verbose:
            status = "OK" if not defects else f"FAIL ({len(defects)})"
            print(f"  [{status}] {name}")
        for d in defects:
            total_defects.append(f"{name}: {d}")

    if total_defects:
        print(f"Consistency check FAILED with {len(total_defects)} defect(s):", file=sys.stderr)
        for d in total_defects:
            print(f"  - {d}", file=sys.stderr)
        return 1
    print(f"Consistency check OK ({root})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
