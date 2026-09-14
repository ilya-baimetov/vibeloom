<!--
VibeLoom template: component (per-component spec)
Tier: system-specs (full modes only) — terminal node in the Contract Graph.
Purpose: full contract for one owned technical boundary.
Structured content: IF-####, DEP-####, BEH-####, NOTE-####. These are addressable items but NOT independent graph nodes (per Boundary Principle).

Derivation rules (per §5.1) for the component itself:
- domain-layer component: derives from AGG, ENT, BC, CONT, FLOW, VO
- application-layer component: derives from CONT and any FLOW or domain CMPs it orchestrates
- presentation-layer component: derives from CONT and optional VIEW/INT references
- infrastructure-layer component: derives from CONT and platform service declarations

Layer-aware constraint:
- `bounded_context` (singular, exactly one) applies ONLY to domain-layer components.
- For non-domain components (presentation / application / infrastructure), the `bounded_context` frontmatter field MUST be empty (or set to `null`). The structural eval enforces this.

Generator guidance:
- `container_id`, `component_id` identify the component's ownership.
- `owned_paths` and `owned_interfaces` in frontmatter are SUMMARY INDEXES — the body IF table and explicit path declarations are the source of truth. Frontmatter is regenerated from the body.
- Every component belongs to exactly one container.
- Domain-layer components belong to exactly one bounded context; non-domain components belong to no BC.
- Interfaces, dependencies, behaviors, and notes are structured content, not graph entities. They are not subject to DAG edge validation.
- Each IF-#### is an interface this component provides. Each DEP-#### is a dependency on another component or external system. Each BEH-#### is a local behavior contract. Each NOTE-#### captures a local test or runtime concern.
- The component inherits its container's `layer` (declared in container.md frontmatter). The layer determines which derivation rules apply and whether bounded_context is required.
-->

---
artifact_id: component.<container-slug>.<component-slug>
artifact_type: component
tier: system-specs
approval_unit: system-specs
scope_kind: component
scope_id: <container-slug>.<component-slug>
container_id: <CONT-####>
component_id: <CMP-####>
bounded_context: <BC-####>           # domain layer only; empty/null for other layers
owned_paths: []
owned_interfaces: []
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Component — <component-slug>

<!-- One-paragraph statement of what this component owns and why it exists. -->

## Responsibility

<!-- Clear statement of the component's technical boundary: what it does, what it does not do. -->

## Owned paths

<!-- Filesystem patterns this component owns. The body is source of truth; frontmatter owned_paths is a summary. -->

| path | notes |
|---|---|
| | |

## Owned interfaces

<!-- Interfaces this component provides to other components or external consumers. Each IF-#### is structured content. -->

| id | name | kind | description | notes |
|---|---|---|---|---|
| IF-0001 | | | | |

## Dependencies

<!-- Components or external systems this component consumes. Each DEP-#### references a provider. -->

| id | target | kind | notes |
|---|---|---|---|
| DEP-0001 | | | |

## Behaviors

<!-- Local behavior contracts. Each BEH-#### is a statement about how this component behaves under specific conditions. -->

| id | description | notes |
|---|---|---|
| BEH-0001 | | |

## Notes

<!-- Local test or runtime notes. Each NOTE-#### captures a concern the implementer should remember. -->

| id | kind | note |
|---|---|---|
| NOTE-0001 | | |
