<!--
VibeLoom template: dm
Tier: product-specs (full modes only)
Purpose: domain model — bounded contexts, aggregates, entities, value objects, invariants, ubiquitous language.
Entities: TERM-####, BC-####, AGG-####, ENT-####, VO-####, INV-####.
Derivation rules (per §5.1):
- TERM derives from CAP, FR, STORY
- BC derives from FR, STORY, FLOW, TERM
- AGG derives from STORY, BC
- ENT derives from STORY, BC
- VO derives from ACC, STORY
- INV derives from FR, ACC, BC

`dm` is the semantic source for technical boundary derivation. Components come from domain semantics, not folder shape.

Generator guidance:
- Every entity has a derives_from pointing at valid upstream item IDs per the DAG.
- Invariants are business rules that must always hold.
- Value objects are immutable attribute clusters.
- Aggregates own invariants; entities are identity-bearing.
- Bounded contexts scope semantic homes — components will later map to exactly one BC.
-->

---
artifact_id: dm
artifact_type: dm
tier: product-specs
approval_unit: product-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Domain Model

<!-- One-paragraph summary of the domain and its major concepts. -->

## Ubiquitous language

<!-- Shared vocabulary terms. Each TERM derives from CAP, FR, or STORY. -->

| id | term | definition | derives_from | notes |
|---|---|---|---|---|
| TERM-0001 | | | | |

## Bounded contexts

<!-- Semantic boundaries for domain logic. Each BC derives from FR, STORY, FLOW, or TERM. -->

| id | description | derives_from | notes |
|---|---|---|---|
| BC-0001 | | | |

## Aggregates

<!-- Invariant-owning state clusters. Each AGG derives from STORY or BC and belongs to one BC. -->

| id | description | bounded_context | derives_from | notes |
|---|---|---|---|---|
| AGG-0001 | | | | |

## Entities

<!-- Identity-bearing domain objects. Each ENT derives from STORY or BC and belongs to one BC. -->

| id | description | bounded_context | derives_from | notes |
|---|---|---|---|---|
| ENT-0001 | | | | |

## Value objects

<!-- Immutable attribute clusters. Each VO derives from ACC or STORY. -->

| id | description | derives_from | notes |
|---|---|---|---|
| VO-0001 | | | |

## Invariants

<!-- Business rules that must always hold. Each INV derives from FR, ACC, or BC. -->

| id | rule | derives_from | notes |
|---|---|---|---|
| INV-0001 | | | |
