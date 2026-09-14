<!--
VibeLoom template: container (per-container spec)
Tier: system-specs (full modes only)
Purpose: local runtime boundary; resident bounded contexts (domain-layer only); authoritative component inventory; local dependency edges, local constraints, and deployment target.
Entities: CMP-#### (components owned by this container).

Required frontmatter:
- `layer` field — enum: presentation | application | domain | infrastructure
  Drives generation rules and per-layer constraints. See methodology §6.5.

Layer rules (per methodology):
- presentation: no bounded contexts; components are UI components (pages, layouts, widgets). Inherits Presentation tech stack from defaults.
- application: no bounded contexts; components are API surfaces, orchestration handlers, BFF endpoints. Inherits Application tech stack.
- domain: HOSTS bounded contexts. Components are service-shaped. Decomposition follows the project's monolith vs multi-service choice declared in defaults. Inherits Domain tech stack.
- infrastructure: no internal components — declares consumed platform services as dependencies. Inherits Infrastructure tech stack.

Layer → deployment target (typical patterns):
- presentation → static asset bundle → Cloudflare Pages / Vercel / Netlify / S3+CloudFront
- application → BFF / API surface → AWS Lambda / Cloud Run / Cloudflare Workers / Vercel Functions
- domain → service workload → AWS ECS / Cloud Run / EKS / Lambda (per-aggregate granularity if multi-service)
- infrastructure → declarative cloud config → Terraform / Pulumi / CDK / native templates

Generator guidance:
- Fill `container_id` with the governing CONT-#### from containers.md.
- Set `layer` per the methodology constraints (see above).
- Bounded contexts ONLY in domain-layer containers. List only BCs resident in this container.
- Every CMP references the container and (for domain layer) at least one BC + optional AGG/ENT/FLOW/VO in derives_from.
- Components from the same BC must be co-located in this container.
- For non-domain containers (presentation / application / infrastructure), the "Resident bounded contexts" section stays empty.
- Fill the "Deployment target" section with the concrete platform choice (consistent with infrastructure stack in defaults).
-->

---
artifact_id: container.<container-slug>
artifact_type: container
tier: system-specs
approval_unit: system-specs
scope_kind: container
scope_id: <container-slug>
container_id: <CONT-####>
layer: <presentation | application | domain | infrastructure>
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Container — <container-slug>

<!-- One-paragraph statement of this container's purpose and runtime boundary. Reference the layer it occupies. -->

## Deployment target

<!--
Concrete platform + pattern for this container.
- presentation: e.g. "Cloudflare Pages, static SPA bundle, deployed via wrangler"
- application: e.g. "AWS Lambda + API Gateway, per-endpoint function, Node 20 runtime"
- domain: e.g. "AWS ECS Fargate, one service per BC (multi-service decomposition), Postgres per BC"
- infrastructure: e.g. "Terraform module for the project's RDS Postgres + ElastiCache Redis + SQS queues"
-->

| field | choice |
|---|---|
| Platform | |
| Pattern | |
| Runtime | |
| Notes | |

## Resident bounded contexts

<!--
DOMAIN LAYER ONLY. List BCs whose semantic home is this container.
For non-domain layers, leave this section empty (or remove the table).
Each BC is owned by exactly one container.
-->

| bounded_context | notes |
|---|---|
| BC-0001 | |

## Component inventory

<!--
Authoritative list of components inside this container.
- DOMAIN: each CMP derives from its container (CONT-####), at least one BC, and any relevant AGG/ENT/FLOW/VO.
- PRESENTATION: each CMP derives from container + optional VIEW/INT references.
- APPLICATION: each CMP derives from container + the FLOW or domain CMPs it orchestrates.
- INFRASTRUCTURE: typically zero components (just declared dependencies on platform services). If components exist, derives_from references the platform service.
-->

| id | slug | description | bounded_context | derives_from | notes |
|---|---|---|---|---|---|
| CMP-0001 | | | | | |

## Local dependency edges

<!-- Structured content — how components inside this container relate. Not graph entities. -->

| from | to | kind | notes |
|---|---|---|---|
| CMP-0001 | | | |

## Cross-layer interactions

<!--
How this container talks to containers in other layers (structured cross-layer modeling is a v0.4+ capability). For v0.3 list inter-container dependencies as prose; the per-call interface contracts live on the called component's IF-#### items.

Example:
- presentation/web-app calls application/notes-api (REST) for note CRUD
- application/notes-api calls domain/notes-service (HTTP/gRPC) for note operations
-->

| from container | to container | protocol | notes |
|---|---|---|---|
| | | | |

## Local constraints

<!-- Local NFR/operational constraints specific to this container. Each item is structured content, not a graph entity. -->

| constraint | affects | notes |
|---|---|---|
| | | |
