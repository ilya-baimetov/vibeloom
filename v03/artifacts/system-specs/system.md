<!--
VibeLoom template: system
Tier: system-specs (full modes only)
Purpose: system context — external actors/systems, trust boundaries, system-wide NFR boundaries.
Entities: EXT-####, TB-####, SNFR-####.
Derivation rules (per §5.1):
- EXT derives from FR, NFR, CAP
- TB derives from NFR
- SNFR derives from NFR

Deployment topology does NOT live here — that is `containers`.

Generator guidance:
- Define system purpose, external actors, trust boundaries, and system-wide NFRs only.
- Do not inventory containers or components. Those are downstream artifacts.
- Every entity carries a derives_from pointing at valid upstream items per the DAG.
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

# System

<!-- One-paragraph statement of what the system is and where it sits in its broader environment. -->

## Context

<!-- Prose description of the system's scope, stakeholders, and surrounding environment. -->

## External actors and systems

<!-- Outside entities the system interacts with. Each EXT derives from FR, NFR, or CAP. -->

| id | description | kind | derives_from | notes |
|---|---|---|---|---|
| EXT-0001 | | | | |

## Trust boundaries

<!-- Security or permission lines. Each TB derives from NFR. -->

| id | description | derives_from | notes |
|---|---|---|---|
| TB-0001 | | | |

## System-wide NFR boundaries

<!-- Global quality constraints. Each SNFR derives from NFR. -->

| id | description | measure | target | derives_from | notes |
|---|---|---|---|---|---|
| SNFR-0001 | | | | | |
