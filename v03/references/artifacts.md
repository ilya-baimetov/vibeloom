# Artifacts Reference

Artifact layout, frontmatter shapes, ID schema, and derivation rules. Authoritative semantics live in [`vibeloom-implementation.md`](../vibeloom-implementation.md). This file is a load-on-demand condensation.

---

## Governed repo layout

### Full layout (`pm`, `dev`, `ux`, `expert`)

```
/
  intent.md
  defaults.md
  prd.md
  usm.md
  dm.md
  ux.md
  system.md
  containers.md
  AGENTS.md
  CLAUDE.md
  validation-registry.md
  ux-specs/
    mockups/
  decisions/
    idr/   IDR-NNNN-<slug>.md
    pdr/   PDR-NNNN-<slug>.md
    udr/   UDR-NNNN-<slug>.md
    adr/   ADR-NNNN-<slug>.md
    general/   DEC-NNNN-<slug>.md
  <container>/
    container.md          # carries layer field
    AGENTS.md
    CLAUDE.md
    <component>/
      component.md
      AGENTS.md
      CLAUDE.md
      context/
        bdd/
          BDD-####-<behavior-slug>.md
  .vibeloom/
    cache/
      contract-graph.json
      status.json
    traces/
      approvals.jsonl
      generations.jsonl
      evals.jsonl
      code-sync.jsonl
      decisions.jsonl
      imports.jsonl
    state/
      id-registry.json
    runs/
      RUN-.../
        tasks/TASK-.../
          patch.diff
          summary.yaml
          files/
```

### Compact layout (`vibe`)

```
/
  intent.md
  defaults.md
  system.md
  AGENTS.md
  CLAUDE.md
  .vibeloom/
    traces/
      approvals.jsonl
      generations.jsonl
      decisions.jsonl
    state/
      id-registry.json
```

No user-facing graph, per-item status, or component-spec ceremony. The engine may create private cache, run, or code-sync-like scaffolding under `.vibeloom/` when useful; users do not curate it. Approval, generation, and decision traces remain cheap and enable repair and future upgrade migration.

Filesystem is a navigation aid and consistency check, not the semantic source of truth.

---

## Artifact mapping (full modes)

| Artifact | Output path | Template | Scope |
|---|---|---|---|
| `intent` | `/intent.md` | `templates/artifacts/intent-specs/intent.md` | root |
| `defaults` | `/defaults.md` | `templates/artifacts/intent-specs/defaults.md` | root |
| `prd` | `/prd.md` | `templates/artifacts/product-specs/prd.md` | root |
| `usm` | `/usm.md` | `templates/artifacts/product-specs/usm.md` | root |
| `dm` | `/dm.md` | `templates/artifacts/product-specs/dm.md` | root |
| `ux` | `/ux.md` | `templates/artifacts/ux-specs/ux.md` | root |
| `system` | `/system.md` | `templates/artifacts/system-specs/system.md` | root |
| `containers` | `/containers.md` | `templates/artifacts/system-specs/containers.md` | root |
| `container` | `/<container>/container.md` | `templates/artifacts/system-specs/container.md` | container |
| `component` | `/<container>/<component>/component.md` | `templates/artifacts/system-specs/component.md` | component |
| `validation-registry` | `/validation-registry.md` | `templates/artifacts/validation-registry.md` | root |
| root `config` | `/AGENTS.md`, `/CLAUDE.md` | `templates/artifacts/context/root-config.md` | root |
| container `config` | `/<container>/AGENTS.md`, `/<container>/CLAUDE.md` | `templates/artifacts/context/container-config.md` | container |
| component `config` | `/<container>/<component>/AGENTS.md`, `/<container>/<component>/CLAUDE.md` | `templates/artifacts/context/component-config.md` | component |
| `decision-trace` (per record) | `/decisions/<record_type>/<RECORD>-NNNN-<slug>.md` | `templates/artifacts/decision-trace.md` | root (one file per decision) |
| `bdd` | `/<container>/<component>/context/bdd/BDD-####-<slug>.md` | `templates/artifacts/context/bdd.md` | component |

### Compact mapping (vibe)

| Artifact | Output path | Template | Scope |
|---|---|---|---|
| `intent` | `/intent.md` | `templates/artifacts/intent-specs/vibe-intent.md` | root |
| `defaults` | `/defaults.md` | `templates/artifacts/intent-specs/defaults.md` | root |
| `system` | `/system.md` | `templates/artifacts/system-specs/vibe-system.md` | root |
| root `config` | `/AGENTS.md`, `/CLAUDE.md` | `templates/artifacts/context/root-config.md` | root |

---

## Contract artifact frontmatter

Every contract artifact includes:

| Field | Type | Notes |
|---|---|---|
| `artifact_id` | string | Stable artifact identifier |
| `artifact_type` | enum | `intent` \| `defaults` \| `prd` \| `usm` \| `dm` \| `ux` \| `system` \| `containers` \| `container` \| `component` |
| `tier` | enum | `intent-specs` \| `product-specs` \| `ux-specs` \| `system-specs` |
| `scope_kind` | enum | `root` \| `container` \| `component` |
| `scope_id` | string | `root` or the governing scope slug |
| `status` | enum | `draft` \| `approved` |
| `timestamp` | string | ISO 8601 of the last change |
| `approval_unit` | string | The contract tier this artifact participates in (`intent-specs`, `product-specs`, `ux-specs`, `system-specs`). Identifies the approval unit; advances together. |
| `derives_from` | string[] | Upstream short item IDs that materially constrain this artifact |

Additional required fields:

- **`container.md`**: `container_id` (CONT-####), **`layer` (presentation \| application \| domain \| infrastructure)** — required, drives layer-aware constraints.
- **`component.md`**: `container_id`, `component_id` (CMP-####), `bounded_context` (BC-#### — required for domain-layer components, empty/null for others), `owned_paths`, `owned_interfaces`.

`owned_interfaces` and `owned_paths` in frontmatter are **summary indexes**; the body's `IF-####` table and explicit path declarations are the source of truth. Frontmatter is regenerated from body carriers.

---

## Context artifact frontmatter

Every context artifact includes:

| Field | Type | Notes |
|---|---|---|
| `artifact_id` | string | Stable artifact identifier |
| `artifact_type` | enum | `config` \| `bdd` |
| `tier` | enum | Always `context` |
| `scope_kind` | enum | `root` \| `container` \| `component` |
| `scope_id` | string | `root` or the governing scope slug |
| `timestamp` | string | ISO 8601 of the last change |
| `derives_from` | string[] | Upstream short item IDs that constrain this artifact |

Extras:

- **`config`** artifacts: `assistant` (e.g., `claude`, `codex`)

Context artifacts do **not** carry `status` or `approval_unit`.

---

## Decision-trace frontmatter

Decision traces are persisted in the append-only stream at `.vibeloom/traces/decisions.jsonl`. Per-record markdown files in `decisions/<record_type>/` are the human-readable rendering. Frontmatter uses the **dual-ID model**: `trace_id` (event identity, uniform `DEC-*`, replay key) and `record_id` (rendered-record identity, `<ADR|PDR|UDR|IDR>-*`, human label). See implementation §8.5 for the rationale.

| Field | Type | Notes |
|---|---|---|
| `trace_id` | string | `DEC-<YYYYMMDD>-<NNNN>` (e.g. `DEC-20260512-0007`). Event identity in the unified decision trace family. |
| `record_id` | string | `<RECORD>-<NNNN>` (e.g. `ADR-0007`, `IDR-0003`). Sequence-only per `record_type`; ecosystem-compatible filename (adr-tools convention). Absent for `record_type: general`. |
| `kind` | string | Always `decision` |
| `record_type` | enum | `IDR` \| `PDR` \| `UDR` \| `ADR` \| `general` (default `general`) |
| `load_bearing` | bool | Whether decision still informs future generation. Default `false`. |
| `affects` | string[] | Contract item IDs constrained by this decision (recommended). Empty for `general`. |
| `topic` | string | Short slug or title |
| `author` | string | email or handle |
| `timestamp` | string | ISO 8601 |

---

## Stable ID schema

Visible item IDs use short typed references: `PREFIX-####` (fixed-width 4-digit). Globally unique by type across the repo, append-only within each family, deleted IDs never reused.

### Prefix registry

Canonical source: [implementation §5.1](../vibeloom-implementation.md#51-id-prefix-registry). Reproduced here for runtime load-on-demand; if any row disagrees, the implementation doc wins.

| Prefix | Name | Tier | Source artifact | Scope | Notes (constraints, derivation) |
|---|---|---|---|---|---|
| `CAP` | capability | intent-specs | `intent.md` | root | Root entity; no upstream basis. |
| `CST` | hard constraint | intent-specs | `intent.md` or `defaults.md` | root | Root entity; no upstream basis. |
| `DEF` | repo-wide default | intent-specs | `defaults.md` | root | Derives from `CAP`/`CST` (normalized from intent). Universally binding once derived; downstream may reference without an explicit typed edge. Tech Stack entries also use `DEF`. |
| `OBJ` | objective | product-specs | `prd.md` | root | Derives from `CAP`. |
| `KR` | key result | product-specs | `prd.md` | root | Derives from `OBJ`. |
| `MET` | metric | product-specs | `prd.md` | root | Derives from `KR`, `FR`, or `NFR`. |
| `FR` | functional requirement | product-specs | `prd.md` | root | Derives from `CAP`; optionally from `OBJ`/`STORY`. EARS allowed as structured field. |
| `NFR` | non-functional requirement | product-specs | `prd.md` | root | Derives from `CST` or `OBJ`. EARS allowed. |
| `EPIC` | epic | product-specs | `usm.md` | root | Derives from `CAP`/`OBJ`. |
| `FLOW` | workflow / journey | product-specs | `usm.md` | root | Derives from `EPIC`. |
| `STORY` | story | product-specs | `usm.md` | root | Derives from `EPIC`/`FLOW`. |
| `ACC` | acceptance criterion | product-specs | `usm.md` | per-`STORY` | Derives from `STORY`. EARS allowed. |
| `MS` | milestone | product-specs | `usm.md` | root | Derives from `STORY` (and optionally `OBJ`). Groups `STORY`s for delivery. |
| `TERM` | ubiquitous-language term | product-specs | `dm.md` | root | Derives from `CAP` (or `STORY`). Domain vocabulary; consumed by `BC`/`AGG`/`ENT`. |
| `BC` | bounded context | product-specs | `dm.md` | root | **Hosted only by `domain`-layer components.** Derives from `CAP`/`STORY`. |
| `AGG` | aggregate | product-specs | `dm.md` | per-`BC` | Lives inside one `BC`. |
| `ENT` | entity | product-specs | `dm.md` | per-`AGG` | Lives inside one `AGG`. |
| `VO` | value object | product-specs | `dm.md` | per-`AGG` | Lives inside one `AGG`. |
| `INV` | invariant | product-specs | `dm.md` | per-`AGG` | Domain rule scoped to an `AGG`. |
| `VIEW` | UX view | ux-specs | `ux.md` | root | Derives from `CAP` and/or `STORY`/`FLOW`. May cite `MOCK` as evidence. |
| `INT` | UX interaction | ux-specs | `ux.md` | per-`VIEW` | Derives from `VIEW` (structural) and `STORY`/`ACC` (semantic basis). |
| `UXC` | UX constraint | ux-specs | `ux.md` | root | Derives from `CST` and/or `DEF`. Cross-view design constraint. |
| `MOCK` | mockup reference | ux-specs | `ux.md` | root | Derives from `CAP` and/or `CST` (the intent area it serves). Pointer to file under `ux-specs/mockups/`. May be cited by `VIEW`/`INT`/`UXC`/`STORY`/`ACC` as evidence (`evidence_for`). |
| `EXT` | external actor / system | system-specs | `system.md` | root | Derives from `CAP` and/or `FR` (the capabilities and requirements that involve this external actor). System context; outside trust boundaries. |
| `TB` | trust boundary | system-specs | `system.md` | root | Derives from `CST`, `SNFR`, or `NFR`. Crosses one or more `CONT`s. |
| `SNFR` | system-wide NFR boundary | system-specs | `system.md` | root | Derives from `NFR` or `CST`. Global cross-cutting NFR. |
| `CONT` | container | system-specs | `containers.md` (inventory) + per-container `container.md` | root + per-container | Derives from `FR`/`STORY`/`CAP` (capabilities and requirements driving container choice). Carries required `layer` field (`presentation` / `application` / `domain` / `infrastructure`). |
| `CMP` | component | system-specs | `container.md` (inventory) + per-component `component.md` | per-`CONT` | Belongs to exactly one `CONT`. Layer inherited from parent `CONT`. |
| `IF` | owned interface | system-specs (body carrier) | `component.md` | per-`CMP` | Structured content; not an independent graph node in v0.3. |
| `DEP` | component dependency | system-specs (body carrier) | `component.md` | per-`CMP` | Structured content. |
| `BEH` | local technical behavior | system-specs (body carrier) | `component.md` | per-`CMP` | Structured content. |
| `NOTE` | local test/runtime note | system-specs (body carrier) | `component.md` | per-`CMP` | Structured content. |
| `BDD` | behavioral-scenario artifact | context | `bdd.md` (one file per behavior) | per-`CMP` | One file per behavior; lives under `<container>/<component>/context/bdd/`. |
| `SCN` | Gherkin scenario | context | `bdd.md` body | per-`BDD` | Inside a `BDD` artifact. |
| `RUN` | run | runtime | `.vibeloom/runs/RUN-.../` | per-invocation | Append-only ID family; one per `generate`/`reconcile` invocation. |
| `TASK` | subagent task | runtime | `.vibeloom/runs/RUN-.../tasks/TASK-.../` | per-task | Append-only. |
| `PLAN` | dispatch plan | runtime | `.vibeloom/runs/RUN-.../plan.yaml` | per-`RUN` | Append-only. |
| `APPROVAL` | approval trace | trace | `.vibeloom/traces/approvals.jsonl` | append-only | One entry per `approval_unit` flip from `draft` → `approved`. |
| `SYNC` | code-sync trace | trace | `.vibeloom/traces/code-sync.jsonl` | append-only | Source-map-shaped. |
| `GEN` | generation trace | trace | `.vibeloom/traces/generations.jsonl` | append-only | One per task result (success or failure). |
| `EVAL` | eval trace | trace | `.vibeloom/traces/evals.jsonl` | append-only | Per-eval-run. |
| `DEC` | decision trace | trace | `.vibeloom/traces/decisions.jsonl` | append-only | Carries `record_type` (`IDR` / `PDR` / `UDR` / `ADR` / `general`). |
| `IMP` | import trace | trace | `.vibeloom/traces/imports.jsonl` | append-only | One per `import` invocation. |

`IDR`, `PDR`, `UDR`, `ADR` are **not** independent ID prefixes — they are `record_type` values inside the unified `DEC-` family.

### Artifact IDs

| Artifact | ID shape |
|---|---|
| root contract | fixed name: `intent`, `defaults`, `prd`, `usm`, `dm`, `ux`, `system`, `containers` |
| `container.md` | `container.<container-slug>` |
| `component.md` | `component.<container-slug>.<component-slug>` |
| root config | `config.root.<assistant-slug>` (e.g., `config.root.claude`) |
| container config | `config.container.<container-slug>.<assistant-slug>` |
| component config | `config.component.<container-slug>.<component-slug>.<assistant-slug>` |
| validation-registry | `validation-registry` |
| `bdd` | `BDD-####` |
| decision trace event | `trace_id: DEC-<YYYYMMDD>-<NNNN>` (e.g. `DEC-20260512-0007`) — event identity, replay key |
| decision trace record | `record_id: <RECORD>-<NNNN>` (e.g. `ADR-0007`) — human-facing rendered-record identity, sequence-only per record_type; absent for `general` decisions |

---

## Layer-aware constraints

Containers carry a required `layer` field. The layer drives:

- **Bounded contexts**: ONLY allowed in `domain`-layer containers.
- **Components**: presentation/application/infrastructure components have empty `bounded_context`; domain components have a required `bounded_context`.
- **Tech stack inheritance**: each container inherits the matching layer's section from `defaults.md` Tech Stack.
- **Deployment target**: each container's deployment pattern is layer-typical (presentation → static bundle on Cloudflare/Vercel/etc.; application → BFF on Lambda/Cloud Run/Workers; domain → service workload on ECS/Cloud Run/EKS; infrastructure → IaC declarations).

---

## Derivation rules

- The canonical relation is `derives_from`.
- Every non-root entity must derive from one or more upstream entities allowed by the methodology's Contract Graph (§8).
- Visible `derives_from` references use short item IDs only.
- Artifact frontmatter records the smallest useful constraining set of upstream item IDs.
- Item-level derivation lives in body carriers per the template.
- `capability` and `constraint` are the only root entity types.
- `default` (DEF) becomes universally binding once derived; it may be referenced by any downstream entity without requiring an additional typed edge.

See [`vibeloom-methodology.md`](../vibeloom-methodology.md) §8 for the full edge table.

---

## Ownership mapping (scope)

- **Repo-scoped:** `intent`, `defaults`, `prd`, `usm`, `dm`, `ux`, `system`, `containers`, `validation-registry`, decision-trace records (per record_type sub-folder)
- **Container-scoped:** `container`, container-level `config`
- **Component-scoped:** `component`, component-level `config`, `bdd`

Scope is the governance boundary: **repo** (global), **container** (one runtime unit), or **component** (one technical boundary).

---

## Table column conventions

Canonical column names across templates:

| Column | Meaning | Used in |
|---|---|---|
| `id` | short typed item ID | all tables with addressable items |
| `derives_from` | upstream short item IDs | all contract tiers, decision trace, bdd |
| `description` | what the item is or does | intent, prd, usm, dm, ux, system, containers, container, component |
| `notes` | additional context or rationale | any table |
| `priority` | relative importance | prd (FR, scope) |
| `measure` / `target` | NFR/SNFR quantitative spec | prd (NFR), system (SNFR) |

Domain-specific columns (e.g., `kind`, `runtime`, `rule`, `mockup_refs`) are template-local.
