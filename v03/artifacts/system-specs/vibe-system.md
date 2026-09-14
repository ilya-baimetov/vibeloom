<!--
VibeLoom template: system (vibe mode)
Tier: system-specs (vibe only)
Purpose: all-inclusive summary "technical" spec. Flat covering system context, containers, components, and structured local content.
Entities: CONT-#### and CMP-#### only (per methodology ## Modes ### Vibe Mode).

Note on scope: vibe keeps the public Contract Graph unmaterialized. EXT/TB/SNFR/interfaces/dependencies/behaviors appear as structured content in this one file rather than as distinct user-reviewed artifacts. The engine may derive private scaffolding from them. Upgrade to pm/dev/ux/expert expands this into system + containers + per-container + per-component.

Generator guidance:
- Keep this tight. Vibe is a compromise between ceremony and structure.
- Each CONT derives from CAP (root entity type in vibe) or CST; each CMP derives from CONT + optional CAP.
- Inter-container communication paths and component-level interfaces/behaviors appear as tables but not as graph entities.
- Do not introduce BC, AGG, ENT, VO, INV, TERM, FR, NFR, EPIC, FLOW, STORY, ACC here — those only exist in full modes.
-->

---
artifact_id: system
artifact_type: system
tier: system-specs
approval_unit: system-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# System (vibe)

<!-- One-paragraph system context: purpose, users, and what it interacts with. -->

## External actors and systems

<!-- Structured content in vibe — not public graph entities. Kept here for orientation. -->

| name | kind | relationship |
|---|---|---|
| | | |

## Container inventory

<!-- Each CONT derives from CAP or CST in intent (root entity types in vibe). -->

| id | slug | description | runtime | derives_from | notes |
|---|---|---|---|---|---|
| CONT-0001 | | | | | |

## Inter-container communication paths

<!-- Structured content, not graph entities. Describes how containers talk. -->

| from | to | protocol | purpose |
|---|---|---|---|
| | | | |

## Component inventory

<!-- Each CMP derives from its CONT plus optional CAP. -->

| id | slug | container_id | description | derives_from | notes |
|---|---|---|---|---|---|
| CMP-0001 | | | | | |

## Interfaces, dependencies, behaviors

<!-- Structured content per component. Not graph entities. -->

| id | component | kind | description | notes |
|---|---|---|---|---|
| | | | | |
