<!--
VibeLoom template: intent
Tier: intent-specs (full modes: pm, dev, ux, expert)
Purpose: prose-first description of the system; captures user intent as capabilities and hard constraints.
Entities: CAP-####, CST-#### (root entity types — no derives_from).
Downstream: drives prd, usm, dm, system, containers, container, component; constraints graduate to defaults when repo-wide and always-on.

Generator guidance:
- Keep prose first. Structured entries are a side effect of the prose, not the primary output.
- Every CAP is an observable user-facing outcome.
- Every CST is a hard requirement or binding preference. Repo-wide always-on CSTs also appear in defaults.md as `default` items.
- Intent is a root artifact; CAP and CST carry no derives_from (they are root entity types).
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
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Intent

<!-- One-paragraph statement of what the system is, for whom, and why it should exist. -->

## Vision

<!-- 2-5 sentence vision. What does success look like? -->

## Context and motivation

<!-- What is the surrounding problem, environment, or opportunity? What exists today and why is it insufficient? -->

## Capabilities

<!-- Observable user-facing outcomes. Each capability is a functional promise the system makes to the user. -->

| id | description | notes |
|---|---|---|
| CAP-0001 | | |

## Constraints

<!-- Hard requirements or binding preferences. Repo-wide always-on constraints also appear in defaults.md as `default` items. -->

| id | description | notes |
|---|---|---|
| CST-0001 | | |

## Out of scope

<!-- Optional prose: what is explicitly not this project's concern. Free prose, no IDs. -->

## Open assumptions and risks

<!-- Optional prose. No IDs — these are not graph entities in v2. They may feed future review/eval cycles. -->
