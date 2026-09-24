<!--
VibeLoom v04 intent — the intent.md governs what v04 is and is not.

This is a hand-authored artifact (intent is never generated). It sits at the version
root (NOT under canon/), per file-layout.md §6. It is the sibling-input to the
manifesto; both seed methodology (vibeloom-dev/references/layering.md).

Author note: this file was seeded as a skeleton in Cowork for brainstorming.
Once content is locked here, the canon files (manifesto + methodology + implementation
+ templates) are migrated and brought into alignment via `vibeloom-dev` in Claude Code:
  1. `vibeloom-dev init --from v03 --version v04 --force` (force because v04/intent.md
     pre-exists from this brainstorm; the init must preserve it)
  2. `vibeloom-dev eval canon` to detect intent↔manifesto drift
  3. `vibeloom-dev reconcile canon` to resolve drift interactively
  4. `vibeloom-dev generate methodology` → `generate implementation` → `generate skill` → `generate site`

Generator guidance (from v03/templates/artifacts/intent-specs/intent.md):
- Keep prose first. Structured entries are a side effect of the prose, not the primary output.
- Every CAP is an observable user-facing outcome.
- Every CST is a hard requirement or binding preference.
- Intent is a root artifact; CAP and CST carry no derives_from.
- Free prose stays un-IDed — only entries that downstream tiers must reference need IDs.
-->

---
artifact_id: intent
artifact_type: intent
tier: intent-specs
approval_unit: intent-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "2026-05-25T00:00:00Z"
derives_from: []
---

# Intent

<!-- One-paragraph statement of what v04 of VibeLoom is, for whom, and why it should exist.
     This is THE highest-leverage sentence in the entire version. Every downstream artifact
     inherits its framing. Draft it cold, in your own voice, before letting Claude touch it. -->

## Vision

<!-- 2-5 sentence vision. What does shipping v04 make true that v03 did not? -->

## Context and motivation

<!-- What changed since v03 (May 2026) that motivates v04?
     - State of the engine (v03 is spec-only; v02 is the runnable substrate)
     - State of the field (Tessl, Spec Kit, Kiro, BMAD movements)
     - User adoption / feedback signal
     - Internal pain with the v03 spec itself
     The honest answer here drives feature prioritization. -->

## Capabilities

<!-- Observable user-facing outcomes v04 delivers that v03 does not.
     Candidates already drafted in v03/roadmap.md (re-evaluate, don't auto-accept):
       - A1 generate --dry-run
       - A2 contract REPL / scratchpad
       - A3 contract debugger
       - A4 cognitive-surface instrumentation
       - B1 contract pattern library
       - C0 contract→context graph promotion (CGKG-B)
       - C0a cross-layer interaction graph + stack-aware codegen
       - C1 ContractDelta as first-class artifact
       - C2 DDD context maps
       - C3 compliance mode
       - D1 late-fetch → context proposal
       - D2 repeated reconcile choice → load-bearing decision proposal
       - D3 repeated validation failure → task-template change
       - D4 repeated uncovered UX → product/UX synthesis improvement
     v04 should pick 2-3, not 12. Name explicit non-goals below. -->

| id | description | notes |
|---|---|---|
| CAP-0001 | | |

## Constraints

<!-- Hard requirements or binding preferences for v04. Examples to consider:
       - Engine must catch up to v03 + v04 deltas (or explicit non-goal: spec-only release)
       - No breaking changes to v03 artifact schemas without a migration tool
       - All new toolchain surface must work in vibe mode (not just expert)
       - Adoption surface (skill loader contract) cannot break existing installs
     Drop the constraints that don't apply. Add ones from your own thinking. -->

| id | description | notes |
|---|---|---|
| CST-0001 | | |

## Out of scope

<!-- What v04 explicitly does NOT do. Naming non-goals is half the value of intent.md.
     Pre-committing to non-goals here prevents scope creep downstream.
     Strong candidates for v04 non-goals:
       - Dark factory (manifesto says 2-3 year trajectory, not v0.3-or-v0.4 promise)
       - codæ for non-code artifacts (E4 — natural extension but not v04)
       - Cross-organization contract sharing (E5)
     -->

## Open assumptions and risks

<!-- Optional prose. Assumptions v04 is betting on that could turn out wrong;
     risks the canon will need to address. These feed future review/eval cycles. -->
</content>
</invoke>