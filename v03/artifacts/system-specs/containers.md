<!--
VibeLoom template: containers
Tier: system-specs (full modes only)
Purpose: global runtime/deployment topology; inter-container communication paths as structured content.
Entities: CONT-####.
Derivation rules (per §5.1):
- CONT derives from BC, NFR, SNFR

Communication paths between containers are structured content within this artifact (NOT graph entities). Every communication path references valid container endpoints.

Generator guidance:
- Every container appears in the topology.
- Each CONT derives from at least one BC (semantic home) plus optionally NFR or SNFR.
- Communication paths describe how containers talk to each other (event, HTTP, RPC, etc.). They are table content, not items with IDs in the Contract Graph.
- Do not list components here — components are inventoried in each container.md.
- Hosting/runtime choices can be noted in the notes column or a separate prose section.
-->

---
artifact_id: containers
artifact_type: containers
tier: system-specs
approval_unit: system-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Containers

<!-- One-paragraph statement of the system's runtime topology. -->

## Container inventory

<!-- Each CONT is a runtime/deployment unit. Each derives from BC (semantic home) + optional NFR/SNFR. -->

| id | slug | description | runtime | deployment_unit | derives_from | notes |
|---|---|---|---|---|---|---|
| CONT-0001 | | | | | | |

## Inter-container communication paths

<!-- Structured content, not graph entities. Describes how containers talk to each other. Each row references valid container endpoints or external systems. -->

| from | to | protocol | purpose | notes |
|---|---|---|---|---|
| CONT-0001 | | | | |

## Deployment and runtime choices

<!-- Prose notes on hosting, packaging, scaling, and runtime decisions. -->
