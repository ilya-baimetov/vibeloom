<!--
VibeLoom template: usm
Tier: product-specs (full modes only)
Purpose: delivery structure — epics, flows, stories, acceptance criteria, milestones.
Entities: EPIC-####, FLOW-####, STORY-####, ACC-####, MS-####.
Derivation rules (per §5.1):
- EPIC derives from FR
- FLOW derives from FR
- STORY derives from FR
- ACC derives from FR, NFR, STORY
- MS derives from STORY, EPIC

Generator guidance:
- Every story traces to at least one functional requirement.
- Every epic has at least one flow; every flow has at least one story.
- Acceptance framing stays behavior-focused — observable pass/fail conditions.
- Milestones group stories/epics into delivery checkpoints.
-->

---
artifact_id: usm
artifact_type: usm
tier: product-specs
approval_unit: product-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# User Story Map

<!-- One-paragraph summary of the delivery narrative. -->

## Epics

<!-- Coarse delivery groupings. Each EPIC derives from one or more FR. -->

| id | description | derives_from | notes |
|---|---|---|---|
| EPIC-0001 | | | |

## Flows

<!-- User journeys or workflows. Each FLOW derives from one or more FR. -->

| id | description | derives_from | notes |
|---|---|---|---|
| FLOW-0001 | | | |

## Stories

<!-- Smallest deliverable behavior units. Each STORY derives from one or more FR. -->

| id | description | derives_from | notes |
|---|---|---|---|
| STORY-0001 | | | |

## Acceptance criteria

<!-- Observable pass/fail conditions. Each ACC derives from FR, NFR, or STORY. -->

| id | description | derives_from | notes |
|---|---|---|---|
| ACC-0001 | | | |

## Milestones

<!-- Delivery checkpoints grouping stories/flows/epics into larger product increments. Each MS derives from STORY or EPIC. -->

| id | description | derives_from | notes |
|---|---|---|---|
| MS-0001 | | | |
