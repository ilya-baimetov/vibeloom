<!--
VibeLoom template: defaults
Tier: intent-specs (all modes)
Purpose: minimal repo-wide constitution — binding global rules, technology stack baseline (per DDD layer), quality guardrails.
Entities: `default` items carried as DEF-#### (also accepted as CST-#### depending on origin).
Rules: only always-on, globally binding constraints. Downstream tiers treat `defaults` as binding.

Generator guidance:
- Keep this short. Defaults are the narrow set of rules every downstream tier must respect.
- Each default derives from exactly one `constraint` or `capability` in intent — every DEF-#### row here must have a derives_from pointing at an intent CST-#### or CAP-####.
- Do not duplicate the prose of the source constraint. State the binding rule crisply.
- If a rule is optional, situational, or tactical, it belongs in intent or in a config artifact, not in defaults.
- The Tech Stack section is organized per DDD architectural layer (presentation / application / domain / infrastructure). Empty fields signal "agent decides reasonably given other constraints"; filled fields are binding for all containers in the matching layer.
- Stack choices made here are inherited by containers in the matching layer; per-container overrides are allowed and tracked as decision traces with record_type=ADR.
-->

---
artifact_id: defaults
artifact_type: defaults
tier: intent-specs
approval_unit: intent-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Defaults

Repo-wide constitution. Binding globally and always.

## Rules

<!-- Each rule is a `default` item. It derives from a `constraint` or `capability` in intent. -->

| id | rule | derives_from | notes |
|---|---|---|---|
| DEF-0001 | | | |

## Tech stack

<!--
Per DDD architectural layer. Empty fields signal "agent decides reasonably given other constraints"; filled fields are binding.
Each filled choice should carry a DEF-#### id with derives_from link to the originating intent constraint, if any. The tech stack inheritance hierarchy: defaults.md → container.md (per layer) → component.md (rare per-component override).
-->

### Presentation

| field | choice | DEF id | derives_from |
|---|---|---|---|
| Framework | | | |
| Meta-framework | | | |
| Styling | | | |
| State management | | | |
| Component library | | | |
| Build tooling | | | |

### Application

| field | choice | DEF id | derives_from |
|---|---|---|---|
| API style (REST / GraphQL / tRPC / RPC) | | | |
| Backend framework | | | |
| Auth pattern | | | |
| Validation / schemas | | | |
| Persistence layer | | | |

### Domain

| field | choice | DEF id | derives_from |
|---|---|---|---|
| Language | | | |
| Decomposition (monolith / multi-service) | | | |
| Aggregate pattern (CRUD / event-sourced / hybrid) | | | |
| Domain event style | | | |

### Infrastructure

| field | choice | DEF id | derives_from |
|---|---|---|---|
| Cloud platform | | | |
| Database | | | |
| Cache | | | |
| Queue / messaging | | | |
| Storage | | | |
| Compute pattern | | | |

## Quality guardrails

<!-- Testing, invariant enforcement, reconciliation discipline. Each still carries a DEF-#### id and a derives_from link. -->

| id | rule | derives_from | notes |
|---|---|---|---|
