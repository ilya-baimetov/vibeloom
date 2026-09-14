<!--
VibeLoom template: intent (vibe mode)
Tier: intent-specs (vibe only)
Purpose: all-inclusive "intent + product" spec. Prose description plus a product summary section that seeds a full product-specs stack on upgrade.
Entities: CAP-####, CST-#### only. Product-level detail is prose, not structured entities.
Downstream: drives compact system (vibe-system.md) and is the primary product-level input for system-specs generation.

Generator guidance:
- Prose-first. Capabilities and constraints are IDed only if downstream work must reference them.
- Product summary is free prose — user journeys, domain concepts, acceptance criteria expressed in narrative. Do not introduce FR-####, STORY-####, BC-####, etc. here.
- On upgrade (init --upgrade --mode pm|dev|ux|expert), the product summary seeds the generation of prd + usm + dm (and ux-specs in `ux` mode).
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

<!-- What is the surrounding problem, environment, or opportunity? -->

## Capabilities

<!-- Observable user-facing outcomes. Each capability is a functional promise the system makes to the user. -->

| id | description | notes |
|---|---|---|
| CAP-0001 | | |

## Constraints

<!-- Hard requirements or binding preferences. Repo-wide always-on constraints also appear in defaults.md. -->

| id | description | notes |
|---|---|---|
| CST-0001 | | |

---

## Product summary

<!--
Narrative summary that captures what would normally live in prd + usm + dm. Write it as prose; do not introduce FR-####, STORY-####, BC-####, etc. This section seeds full product-specs on upgrade.

Cover three areas:
-->

### Key requirements

<!-- Functional and non-functional requirements in narrative form. What must the product do? Any critical performance, security, or availability expectations? -->

### User workflows

<!-- Primary user journeys, happy paths, and key decision points. -->

### Domain concepts

<!-- Core domain terms, their relationships, and important invariants. -->
