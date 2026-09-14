<!--
VibeLoom template: prd
Tier: product-specs (full modes only)
Purpose: product requirements — objectives, key results, metrics, functional and non-functional requirements.
Entities: OBJ-####, KR-####, MET-####, FR-####, NFR-####.
Derivation rules:
- OBJ derives from CAP, CST (intent)
- KR derives from OBJ
- MET derives from KR
- FR derives from OBJ, CAP
- NFR derives from OBJ, CAP, CST
Scope notes, assumptions, risks, and open questions appear as prose here but are not first-class graph entities.

Generator guidance:
- Every functional requirement traces to at least one objective or capability (in derives_from).
- Every objective traces to at least one capability or constraint.
- Keep scope notes, assumptions, risks, open questions as prose. No IDs for these.
- Do not introduce story, flow, or domain-model entities here — those live in usm and dm.
-->

---
artifact_id: prd
artifact_type: prd
tier: product-specs
approval_unit: product-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Product Requirements

<!-- One-paragraph summary of what this product does and who it serves. -->

## Objectives

<!-- Business goals the system serves. Each OBJ derives from one or more CAP or CST in intent. -->

| id | description | derives_from | notes |
|---|---|---|---|
| OBJ-0001 | | | |

## Key results

<!-- Measurable outcomes for each objective. Each KR derives from exactly one OBJ. -->

| id | description | derives_from | notes |
|---|---|---|---|
| KR-0001 | | | |

## Metrics

<!-- Quantitative measures for key results. Each MET derives from a KR. -->

| id | description | measure | target | derives_from |
|---|---|---|---|---|
| MET-0001 | | | | |

## Functional requirements

<!-- Testable behaviors the system must exhibit. Each FR derives from at least one OBJ or CAP. Priority is template-local. -->

| id | description | priority | derives_from | notes |
|---|---|---|---|---|
| FR-0001 | | | | |

## Non-functional requirements

<!-- Quality, performance, security boundaries. Each NFR derives from OBJ, CAP, or CST. `measure` and `target` are canonical NFR columns. -->

| id | description | measure | target | derives_from | notes |
|---|---|---|---|---|---|
| NFR-0001 | | | | | |

---

## Scope notes (prose)

<!-- In-scope highlights, boundaries, and rationale. Free prose — no IDs. -->

## Out of scope (prose)

<!-- What this PRD explicitly does not cover. Free prose — no IDs. -->

## Assumptions (prose)

<!-- Working assumptions that frame the requirements. Free prose — no IDs. -->

## Risks (prose)

<!-- Known risks and tensions. Free prose — no IDs. -->

## Open questions (prose)

<!-- Items needing further exploration. Free prose — no IDs. -->
