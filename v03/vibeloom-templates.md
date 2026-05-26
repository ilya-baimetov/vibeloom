# VibeLoom Templates Source

Canonical source for every template and skill asset. **Templates do not exist as source files** — this markdown document is the only canonical source. Build-time extraction (see [`extract-templates.py`](extract-templates.py)) materializes the templates into `templates/` (gitignored) on demand.

This file is the source of truth. To change a template, edit it here and re-extract. The on-disk `templates/` tree is a build artifact; it is never committed.

## Extractor protocol

A fenced block opens with **four** backticks immediately followed by `template:<relative-path>` (e.g. ````template:tasks/init.md`). Everything between that opener and the next bare four-backtick line (````) is written verbatim to `<dest>/<relative-path>` (default `templates/<relative-path>`). Four backticks (rather than three) so that ordinary 3-backtick fences inside the template body — `​`​`​`yaml`, `​`​`​`text`, etc. — do not prematurely close the outer block. Directories are created as needed. Idempotent. With `--check`, the extractor diffs and exits non-zero on drift.

Run `python3 extract-templates.py` to materialize. Run `python3 extract-templates.py --check` to assert no drift (suitable for CI).

---

## Contents

- [README and conventions](#readme-and-conventions)
  - [`README.md`](#readmemd)
- [Skill manifest](#skill-manifest)
  - [`skill/SKILL.md`](#skillskillmd)
- [Subagent prompt](#subagent-prompt)
  - [`skill/subagent-prompt.md`](#skillsubagent-promptmd)
- [Skill references](#skill-references)
  - [`skill/references/artifacts.md`](#skillreferencesartifactsmd)
  - [`skill/references/eval.md`](#skillreferencesevalmd)
  - [`skill/references/modes.md`](#skillreferencesmodesmd)
  - [`skill/references/operations.md`](#skillreferencesoperationsmd)
  - [`skill/references/runtime.md`](#skillreferencesruntimemd)
  - [`skill/references/troubleshooting.md`](#skillreferencestroubleshootingmd)
- [Task templates](#task-templates)
  - [`tasks/approve.md`](#tasksapprovemd)
  - [`tasks/eval.md`](#tasksevalmd)
  - [`tasks/generate-code-component.md`](#tasksgenerate-code-componentmd)
  - [`tasks/generate-context.md`](#tasksgenerate-contextmd)
  - [`tasks/generate-intent-specs.md`](#tasksgenerate-intent-specsmd)
  - [`tasks/generate-product-specs-from-ux.md`](#tasksgenerate-product-specs-from-uxmd)
  - [`tasks/generate-product-specs.md`](#tasksgenerate-product-specsmd)
  - [`tasks/generate-system-specs.md`](#tasksgenerate-system-specsmd)
  - [`tasks/generate-ux-specs.md`](#tasksgenerate-ux-specsmd)
  - [`tasks/import.md`](#tasksimportmd)
  - [`tasks/init.md`](#tasksinitmd)
  - [`tasks/reconcile.md`](#tasksreconcilemd)
  - [`tasks/review.md`](#tasksreviewmd)
  - [`tasks/status.md`](#tasksstatusmd)
- [Artifact templates — intent-specs](#artifact-templates--intent-specs)
  - [`artifacts/intent-specs/defaults.md`](#artifactsintent-specsdefaultsmd)
  - [`artifacts/intent-specs/intent.md`](#artifactsintent-specsintentmd)
  - [`artifacts/intent-specs/vibe-intent.md`](#artifactsintent-specsvibe-intentmd)
- [Artifact templates — product-specs](#artifact-templates--product-specs)
  - [`artifacts/product-specs/dm.md`](#artifactsproduct-specsdmmd)
  - [`artifacts/product-specs/prd.md`](#artifactsproduct-specsprdmd)
  - [`artifacts/product-specs/usm.md`](#artifactsproduct-specsusmmd)
- [Artifact templates — ux-specs](#artifact-templates--ux-specs)
  - [`artifacts/ux-specs/ux.md`](#artifactsux-specsuxmd)
- [Artifact templates — system-specs](#artifact-templates--system-specs)
  - [`artifacts/system-specs/component.md`](#artifactssystem-specscomponentmd)
  - [`artifacts/system-specs/container.md`](#artifactssystem-specscontainermd)
  - [`artifacts/system-specs/containers.md`](#artifactssystem-specscontainersmd)
  - [`artifacts/system-specs/system.md`](#artifactssystem-specssystemmd)
  - [`artifacts/system-specs/vibe-system.md`](#artifactssystem-specsvibe-systemmd)
- [Artifact templates — context](#artifact-templates--context)
  - [`artifacts/context/bdd.md`](#artifactscontextbddmd)
  - [`artifacts/context/component-config.md`](#artifactscontextcomponent-configmd)
  - [`artifacts/context/container-config.md`](#artifactscontextcontainer-configmd)
  - [`artifacts/context/root-config.md`](#artifactscontextroot-configmd)
- [Project-level meta artifacts](#project-level-meta-artifacts)
  - [`artifacts/validation-registry.md`](#artifactsvalidation-registrymd)
- [Other](#other)
  - [`artifacts/decision-trace.md`](#artifactsdecision-tracemd)

---

## README and conventions

### `README.md`

````template:README.md
# v03/templates/

Generation-ready templates for v0.3 VibeLoom. The methodology + implementation docs (in `v03/`) define WHAT VibeLoom is and HOW it's built; this directory provides the concrete templates an agent uses to *generate* a working VibeLoom project from those specs.

## Directory layout

```
v03/templates/
├── README.md                          (this file)
├── artifacts/                         per-artifact templates (the contract stack itself)
│   ├── intent-specs/
│   │   ├── intent.md                  full-mode intent
│   │   ├── vibe-intent.md             vibe-mode compact intent
│   │   └── defaults.md                repo-wide defaults + Tech Stack section per DDD layer
│   ├── product-specs/
│   │   ├── prd.md                     OBJ / KR / MET / FR / NFR
│   │   ├── usm.md                     EPIC / FLOW / STORY / ACC / MS
│   │   └── dm.md                      TERM / BC / AGG / ENT / VO / INV
│   ├── ux-specs/
│   │   └── ux.md                      VIEW / INT / UXC / MOCK
│   ├── system-specs/
│   │   ├── system.md                  EXT / TB / SNFR
│   │   ├── vibe-system.md             vibe compact system
│   │   ├── containers.md              CONT inventory
│   │   ├── container.md               per-container; layer field + deployment target
│   │   └── component.md               per-component; layer-aware bounded_context
│   ├── context/
│   │   ├── bdd.md                     SCN per Gherkin scenario
│   │   ├── root-config.md             AGENTS.md / CLAUDE.md at root
│   │   ├── container-config.md        per-container config
│   │   └── component-config.md        per-component config
│   ├── decision-trace.md              single template for IDR / PDR / UDR / ADR / general (renders trace entries; not a context artifact)
│   └── validation-registry.md         project-level meta artifact
├── tasks/                             per-operation task templates (Inputs / Steps / Output / Constraints / Validation)
│   ├── init.md
│   ├── import.md
│   ├── generate-intent-specs.md
│   ├── generate-product-specs.md
│   ├── generate-product-specs-from-ux.md
│   ├── generate-ux-specs.md
│   ├── generate-system-specs.md
│   ├── generate-context.md
│   ├── generate-code-component.md     leaf subagent task
│   ├── eval.md
│   ├── review.md
│   ├── reconcile.md
│   ├── approve.md
│   └── status.md
└── skill/
    ├── SKILL.md                       the loaded-by-Claude-Code/Codex skill manifest
    ├── subagent-prompt.md             body shape wrapping the subagent task header
    └── references/
        ├── artifacts.md               artifact layout, frontmatter, ID schema, derivation rules
        ├── eval.md                    verification ladder + heuristic dimensions
        ├── modes.md                   per-mode behavior (vibe / pm / dev / ux / expert)
        ├── operations.md              per-operation quick reference
        ├── runtime.md                 dispatch plan / wave assembly / parallel semantics / subagent task header
        └── troubleshooting.md         failure modes + recovery
```

## How an agent uses these templates

1. **Skill loads `skill/SKILL.md`** automatically when Claude Code or Codex sees `/vibeloom` or `$vibeloom`. The skill orchestrates everything else.
2. **Skill loads relevant `skill/references/*.md`** on demand per operation (e.g. `runtime.md` for `generate`, `eval.md` for `eval`/`review`).
3. **Skill loads the relevant `tasks/*.md`** for the invoked operation (one task template per operation).
4. **Skill materializes `artifacts/*.md`** when generating new artifacts (one artifact template per file generated).
5. **Subagents receive `skill/subagent-prompt.md`** wrapped around their task header from the dispatch plan.

Authoritative sources (the methodology + implementation specs) live one level up at `../vibeloom-methodology.md` and `../vibeloom-implementation.md`. If a template here disagrees with those specs, the specs win.

## Worked example with real content

For an end-to-end demonstration that the templates produce real, usable artifacts, see [`../examples/greenfield-note-search.md`](../examples/greenfield-note-search.md). It walks through a full vibe-mode session and an upgrade to pm mode, with embedded `intent.md`, `defaults.md`, `system.md`, `container.md` content showing what the templates materialize into.

## Quality conventions enforced across templates

- No count words in headings or sentence-leading positions ("Three forms", "Five modes", etc.). Counts change; copy shouldn't bake them in.
- Layer-aware constraints in container.md (`layer` field) and component.md (`bounded_context` empty for non-domain components).
- Tech Stack section in `defaults.md` organized per DDD layer (presentation / application / domain / infrastructure).
- Decision traces classified by `record_type` (IDR / PDR / UDR / ADR / general); single template, materialized per record into `decisions/<record_type>/<RECORD>-<NNNN>-<slug>.md`.
- No `context/decisions/` folder — decisions are anchored in the `decision` trace family (JSONL, append-only) with `load_bearing` flag; per-record markdown renderings under `/decisions/<record_type>/` are derived views (see implementation §8.5.1).
- All trace schemas designed for future graph promotion (a v0.4+ capability).

## Versioning

Templates follow the v0.3 spec exactly. When the methodology or implementation changes (in a v0.3.x or v0.4 release), templates here update in lockstep. The skill's `template_version` field on every dispatched task records which template version was used, for reproducibility.
````

## Skill manifest

### `skill/SKILL.md`

````template:skill/SKILL.md
---
name: vibeloom
description: Contract-driven agentic engineering for long-lived AI-coded projects. Use when the user wants to bootstrap, import, generate, eval, review, reconcile, or approve artifacts in a project governed by VibeLoom (modes: vibe, pm, dev, ux, expert).
argument-hint: "[init|import|generate|eval|review|reconcile|approve|status] [target]"
---

# VibeLoom

VibeLoom is the reference instantiation of the **codæ** paradigm (contract-driven agentic engineering). It governs long-lived AI-coded projects through a tiered contract: `intent-specs` → `product-specs` ⇄ `ux-specs` → `system-specs` → `context` → `code`. Each tier derives from approved upstream truth; downstream is regenerated, never approved as its own layer. The user retains approval authority at mode-specific gates; subagents do scoped work in parallel waves.

## When to use this skill

Invoke on any `$vibeloom` or `/vibeloom` command, or when the user mentions VibeLoom, codæ, contract-driven engineering, or asks to run any methodology operation: `init`, `import`, `generate`, `eval`, `review`, `reconcile`, `approve`, `status`.

## Authoritative sources

Always consult these before making decisions:

- **[vibeloom-methodology.md](../../vibeloom-methodology.md)** — WHAT (entities, tiers, modes, operations, approval model, Contract Graph, status taxonomy, verification ladder, decision-trace classification). If this skill file conflicts with the methodology, the methodology wins.
- **[vibeloom-implementation.md](../../vibeloom-implementation.md)** — HOW (cache vs traces split, artifact layout, frontmatter shape, ID schema, runtime loop, dispatch plan + wave assembly + subagent task header schema, trace schemas, layer-aware constraints).
- **[codæ-manifesto.html](../../codæ-manifesto.html)** — WHY (the case for contract-driven agentic engineering). Paradigm context; not loaded for runtime decisions, but referenced when explaining the system or onboarding new contributors.

## Runtime references (load on demand)

- **[references/operations.md](references/operations.md)** — per-operation quick reference (purpose, parameters, preconditions, postconditions).
- **[references/modes.md](references/modes.md)** — per-mode behavior (`vibe`, `pm`, `dev`, `ux`, `expert`): tier ownership, auto-advance, public surface.
- **[references/runtime.md](references/runtime.md)** — dispatch mechanics: dispatch plan, wave assembly, parallel semantics, subagent task header, load sets, late-fetch.
- **[references/artifacts.md](references/artifacts.md)** — artifact layout, frontmatter shapes, ID schema, derivation rules, layer-aware constraints.
- **[references/eval.md](references/eval.md)** — verification ladder (decidable / mechanical / heuristic), heuristic dimensions, finding schema, severity classification.
- **[references/troubleshooting.md](references/troubleshooting.md)** — failure modes and recovery (cache corruption, lifecycle drift, breaking changes, partial wave failure, late-fetch overflow).

## Templates

### Artifact templates (under [`../artifacts/`](../artifacts/))

- `intent-specs/`: `intent.md`, `vibe-intent.md`, `defaults.md` (with Tech Stack section per layer)
- `product-specs/`: `prd.md`, `usm.md`, `dm.md`
- `ux-specs/`: `ux.md` (peer to product-specs; mockup-evidence pattern)
- `system-specs/`: `system.md`, `vibe-system.md`, `containers.md`, `container.md` (with `layer` field + per-layer deployment guidance), `component.md` (layer-aware bounded_context constraint)
- `context/`: `bdd.md`, `root-config.md`, `container-config.md`, `component-config.md`
- `decision-trace.md` (single template parameterized by `record_type`; materializes per-record markdown renderings of decision-trace entries — see implementation §8.5.1)
- `validation-registry.md` (project-level meta artifact)

Load one artifact template at a time for the artifact being generated.

### Task templates (under [`../tasks/`](../tasks/))

One task template per operation, following the canonical Design-by-Contract structure: Purpose / Inputs / Preconditions / Steps / Output / Postconditions / Constraints / Invariants / Validation / Failure modes.

- `init.md`, `import.md`
- `generate-intent-specs.md`, `generate-product-specs.md`, `generate-product-specs-from-ux.md`, `generate-ux-specs.md`, `generate-system-specs.md`, `generate-context.md`, `generate-code-component.md`
- `eval.md`, `review.md`, `reconcile.md`, `approve.md`, `status.md`

Load the task template for the operation being invoked.

### Subagent prompt template

[`subagent-prompt.md`](subagent-prompt.md) — the body shape that wraps the canonical subagent task header (per implementation §13.4) into a working prompt. Used by the orchestrator when dispatching subagents within a wave.

## Engine

The engine is a deterministic Python package at the repo root (`engine/`). **Zero install, zero dependencies** beyond Python 3.10+. Invoke via `python -m`:

```bash
PYTHONPATH=<skill-root>/engine python3 -m vibeloom_engine <command> --repo <target-repo>
```

Available commands:

| Engine command | Purpose |
|---|---|
| `parse --repo <path>` | Parse all artifacts; emit JSON inventory |
| `graph --repo <path>` | Build + persist the full-mode `.vibeloom/cache/contract-graph.json` |
| `eval --repo <path> [--target <tier>]` | Run structural checks; non-zero exit on blockers |
| `affected --repo <path> --ids <IDs...>` | Compute affected set from changed item IDs |
| `staleness --repo <path>` | Per-item hash diff vs approval traces; forward DAG walk |
| `detect-edits --repo <path>` | mtime fast-filter + per-item hash confirmation |
| `dispatch --repo <path> --affected <IDs>` | Build dispatch plan with wave assembly |
| `status --repo <path>` | Emit status; full modes may persist cache, vibe emits a one-screen report |

All engine commands emit JSON on stdout. The engine makes NO semantic judgments — it parses, validates structure, computes the graph, plans dispatch, and reports. Semantic judgment and user interaction remain with the skill.

> Optional: `pip install -e engine` puts a shorter `vibeloom-engine` command on `PATH`. Not required.

## Substrate

The cooperating substrate at `.vibeloom/` is a four-part split:

- **`.vibeloom/cache/`** — regenerable derived state (full-mode Contract Graph/status, plus optional private vibe scaffolding). Safe to delete; engine rebuilds.
- **`.vibeloom/traces/`** — durable provenance event streams (append-only JSONL). Never silently regenerated; missing traces require explicit re-baselining.
- **`.vibeloom/state/`** — durable mutable runtime state (id-registry). Read-modify-write JSON; recoverable from traces in principle but never auto-rebuilt.
- **`.vibeloom/runs/`** — per-invocation subagent staging (patches, summaries). Cleaned up after retention window.

Trace families: `approval`, `generation`, `eval`, `code-sync`, `decision`, `import`. See implementation §8 for schemas; implementation §3.3 for state.

Decision traces classify by `record_type`: `IDR` (intent-specs), `PDR` (product-specs), `UDR` (ux-specs), `ADR` (system-specs), or `general` (process / methodology / operational decisions that don't change the contract). The active load-bearing subset is a queried view, not a duplicated folder.

## Command routing

On any operation invocation, load `references/operations.md` first for parameters and preconditions; then load the relevant subset of references and the task template. The routing below is **explicit and exhaustive** — do not infer task names from operation strings:

| Command | First load | Task template | Notes |
|---|---|---|---|
| `init` | `operations.md`, `modes.md` | `tasks/init.md` | Plus initial artifact templates per mode. |
| `import` | `operations.md`, `modes.md` | `tasks/import.md` | Plus initial artifact templates per mode. |
| `generate intent-specs` | `operations.md`, `runtime.md` | `tasks/generate-intent-specs.md` | Plus `intent.md` / `defaults.md` templates. |
| `generate product-specs` | `operations.md`, `runtime.md` | `tasks/generate-product-specs.md` | `pm`/`dev`/`expert` modes. Plus product-specs templates + graph cache. |
| `generate product-specs` (in `ux` mode) | `operations.md`, `runtime.md` | `tasks/generate-product-specs-from-ux.md` | `ux`-mode variant that uses approved ux-specs as evidence. |
| `generate ux-specs` | `operations.md`, `runtime.md` | `tasks/generate-ux-specs.md` | Plus `ux.md` template + graph cache. |
| `generate system-specs` | `operations.md`, `runtime.md` | `tasks/generate-system-specs.md` | Plus system-specs templates + graph cache. |
| `generate context` | `operations.md`, `runtime.md` | `tasks/generate-context.md` | Plus context templates (`AGENTS.md`/`CLAUDE.md`, `bdd.md`). |
| `generate code` | `operations.md`, `runtime.md` | `tasks/generate-code-component.md` | Full modes: one subagent per affected component. Vibe: user-visible command is root-scoped; orchestrator may derive private component scopes internally. |
| `eval <target>` | `operations.md`, `runtime.md`, `eval.md` | `tasks/eval.md` | Plus target artifacts. |
| `review <target>` | `operations.md`, `runtime.md`, `eval.md` | `tasks/review.md` | Plus target artifacts. |
| `reconcile <target>` | `operations.md`, `runtime.md`, `eval.md` | `tasks/reconcile.md` | Plus downstream artifacts + graph + traces. |
| `approve <target>` | `operations.md`, `modes.md`, `eval.md` | `tasks/approve.md` | Plus target artifacts. |
| `status` | `artifacts.md` | `tasks/status.md` | Branches on mode: full modes expose graph-backed status; vibe reads compact artifacts + traces and may use private scaffolding. |

Decision-record rendering (`render-decisions` or equivalent) is an engine-side concern; the skill does not own a separate task template for it. Rendered `.md` decision records are materialized by the engine from `decisions.jsonl` traces per implementation §8.5.1.

**Failure recovery:** load `references/troubleshooting.md` reactively when any of its covered failure modes appears — cache corruption, lifecycle drift, breaking change, partial wave failure, late-fetch overflow. Do not pre-load it on every operation.

## Getting started

If the repo has no VibeLoom governance yet, start with:

- `init --mode <vibe|pm|dev|ux|expert>` (new project), or
- `import --mode <mode>` (existing codebase).

Consult `references/modes.md` to help the user pick a mode. Default recommendation: start in `vibe` for prototypes; one-way upgrade to `pm` / `dev` / `ux` / `expert` when the project earns the ceremony.

## Guardrails

- **Approval gates**: never bypass. When a contract tier is a user stop in the current mode, halt and surface findings.
- **Methodology authoritative**: if this skill file disagrees with the methodology, follow the methodology and flag the drift.
- **No invented schema**: don't introduce entity types, ID prefixes, or derivation edges. The valid set is in the methodology's Contract Graph (§8, with derivation rules in §8.2) and the implementation's ID prefix registry (§5.1).
- **Layer-aware**: containers carry a `layer` field (presentation / application / domain / infrastructure). Bounded contexts ONLY in domain-layer containers. Tech stack inherited from `defaults.md` per layer.
- **Decisions live in traces**: ADRs / PDRs / UDRs / IDRs are decision-trace entries with `record_type`. There is no `context/decisions/` folder. Active "decision context" is a queried view over traces filtered by `load_bearing: true`.
- **Subagent load sets**: scoped only — never load the skill, methodology, or implementation docs into a subagent's context. Subagents see baseline + owned scope + foreign IF slices + relevant context.
- **Late-fetch bounded**: one re-invocation per task; exceeding the cap surfaces a finding and exits the task.
- **`reconcile` is user-initiated**: never auto-invoke.
- **`approve` requires structural eval clean + zero blocking semantic findings**.
- **Auto-advance is bounded**: in delegated modes, a tier auto-advances only when structural eval passes AND no breaking semantic change is detected.
- **Decision provenance**: any subagent decision that constrains future generation MUST emit a decision trace with `record_type` and `affects: [item_ids]`.

## Response shape

Keep responses tight. For operations that pause for user input, use this structure:

1. **Scope** — what tier/scope this operation touched.
2. **Decision** — what the skill did or is asking the user to decide.
3. **Affected** — item IDs, artifacts, and scopes changed or surfaced.
4. **Next** — the suggested next command.
````

## Subagent prompt

### `skill/subagent-prompt.md`

````template:skill/subagent-prompt.md
<!--
VibeLoom template: subagent-prompt
Used by: orchestrator (the Skill) when dispatching a subagent task within a wave.
Implements: the body of the orchestrator → subagent contract whose header schema is defined in canonical implementation §13.4.

The header carries the structured contract (task_id, scope, load_set_refs, allowed_paths, validation_contract, result_shape_id, etc.). This template is the prose body that wraps the header into a working prompt the subagent can execute.

The orchestrator materializes this template per-task by substituting the header fields and the task-template-specific instructions (e.g. for generate-code-component, the layer-aware codegen pattern).
-->

# Subagent task: {{task_id}}

You are a scoped VibeLoom subagent operating under a bounded contract. Your output is a patch produced inside a staging directory; the orchestrator validates and applies the patch, then awaits your sibling subagents.

## Task header

```yaml
task_id:               {{task_id}}
run_id:                {{run_id}}
wave_id:               {{wave_id}}
template_id:           {{template_id}}
template_version:      {{template_version}}
scope:                 {{scope}}
load_set_refs:         {{load_set_refs}}
foreign_refs:          {{foreign_refs}}
allowed_read_paths:    {{allowed_read_paths}}
allowed_write_paths:   {{allowed_write_paths}}
validation_contract:   {{validation_contract}}
result_shape_id:       {{result_shape_id}}
```

The header is binding. Everything below operates within these constraints.

## What you receive (the load set)

You have been provided with the following load set:

- **Baseline**: root config (`AGENTS.md` / `CLAUDE.md` at repo root) + repo-wide defaults (`defaults.md`, including the Tech Stack section per layer).
- **Owned scope**: contract artifacts for your scope (e.g. for `generate-code-component`: the component.md and its container.md, including the `layer` field).
- **Foreign references**: ONLY the IF-#### contracts of components your component depends on. You see their interface signatures and behavior contracts, NOT their internals.
- **Relevant context**: per-scope AGENTS.md / CLAUDE.md + any BDD scenarios for behaviors you implement.

You do NOT have access to:
- Other components' implementations.
- Files outside `allowed_read_paths`.
- The full Contract Graph (you have your slice; that's enough).
- Other subagents in the same wave (no inter-subagent communication; the orchestrator coordinates).

## Your job

Follow the task template at `templates/tasks/{{template_id}}.md` for step-by-step instructions specific to your task type.

Per the task template's Steps section:
- Read your load set.
- Apply layer-aware patterns (for code generation: read your container's `layer` field — presentation / application / domain / infrastructure — and use the appropriate codegen pattern).
- Honor tech stack choices declared in `defaults.md` for your layer (don't substitute frameworks).
- Generate or modify ONLY files within `allowed_write_paths`.
- Optionally late-fetch ONCE if a narrow context slice is missing (cap is one re-invocation per task).

## Constraints (binding)

- **Write scope**: You may write only to `allowed_write_paths`. Writing outside is a hard violation and returns a failure result.
- **Read scope**: You may read only from `allowed_read_paths`. Reading outside is a soft violation surfaced as a finding.
- **Late-fetch**: At most ONE re-invocation per task to request additional context. The orchestrator may approve or deny the request. Exceeding the cap returns a failure result with a "context insufficient" finding for human review.
- **Tech stack**: Choices in `defaults.md` for your layer are binding. Don't substitute (e.g. don't generate Vue when defaults specify React).
- **Decisions**: Any decision you make that constrains future generation MUST be emitted as a `decision` trace entry with `record_type: ADR` (or whichever record_type matches the primary affected tier) and `affects: [item_ids]`.
- **No semantic judgment of intent or product meaning**: those are user/orchestrator concerns. You implement the contract; you don't redefine it.
- **No cross-subagent communication**: subagents in your wave run concurrently and independently. The orchestrator coordinates.

## Validation contract

After your patch is staged, the orchestrator runs the runners declared in `validation_contract` (typically: typecheck, lint, unit, contract-conformance, bdd) inside your staging directory at `.vibeloom/runs/{{run_id}}/tasks/{{task_id}}/`.

If any blocking runner fails, your patch is rejected and you may be re-invoked with the failure as additional input.

## Output (your return)

Return a result conforming to `result_shape_id`. At minimum:

```yaml
status:               <ok | partial | failed>
patch_summary:        <one-line summary of what changed>
files_written:        [list of paths in allowed_write_paths]
files_read_outside:   [list of paths read outside allowed_read_paths, if any — surfaces as finding]
late_fetch_requested: <true | false>
late_fetch_payload:   <if requested, the context slice you asked for>
validation_results:   <runner_id: pass|fail|skip per runner>
decisions_emitted:    [list of decision trace IDs you appended]
findings:             [list of {severity, message, item_id?}]
notes:                <optional free-form notes for the orchestrator>
```

## Failure modes (handled by orchestrator)

- Validation runner fails → patch rejected; orchestrator may re-invoke.
- Late-fetch limit exceeded → task fails; orchestrator surfaces "context insufficient" finding for human review.
- Write outside allowed paths → task fails immediately; orchestrator escalates.
- Stack constraints violated → task fails; orchestrator re-invokes with explicit stack reminder.
- Foreign IF contract changes during run (concurrent) → orchestrator restarts the wave from the current basis.

You will not see the orchestrator's response to these failures; you only see your inputs and produce your outputs. The orchestrator is the only thing that knows the wave-level state.
````

## Skill references

### `skill/references/artifacts.md`

````template:skill/references/artifacts.md
# Artifacts Reference

Artifact layout, frontmatter shapes, ID schema, and derivation rules. Authoritative semantics live in [`vibeloom-implementation.md`](../../../vibeloom-implementation.md). This file is a load-on-demand condensation.

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

Canonical source: [implementation §5.1](../../../vibeloom-implementation.md#51-id-prefix-registry). Reproduced here for runtime load-on-demand; if any row disagrees, the implementation doc wins.

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

See [`vibeloom-methodology.md`](../../../vibeloom-methodology.md) §8 for the full edge table.

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
````

### `skill/references/eval.md`

````template:skill/references/eval.md
# Verification Ladder + Semantic Eval Reference

Load on demand during `eval`, `review`, `reconcile`, and `approve` when the target needs validation across the verification ladder.

## The verification ladder

The three tiers (Decidable / Mechanical / Heuristic) and the per-tier check inventory are canonically defined in [methodology §14.3](../../../vibeloom-methodology.md#143-verification-ladder). This reference covers the **heuristic tier** only — agent-judged semantic dimensions, where guidance is needed. The decidable and mechanical tiers are engine-driven and don't require this file.

The codæ trajectory is to promote checks upward as the engine matures — heuristic dimensions become mechanical runners; mechanical runners become structural rules. The decidable share grows over time.

**These checks describe WHAT to validate, not HOW.** Reason with whatever approach works best for the current model; emit findings in the schema below. Do not invent procedural steps, rubrics, or scoring systems.

---

## Finding Schema

Every semantic finding is a JSON object with these fields:

| Field | Type | Notes |
|---|---|---|
| `severity` | `breaking` \| `advisory` | Semantic axis — see Severity Classification below |
| `gate_effect` | `blocking` \| `non-blocking` | Policy axis — whether this finding gates approval. Defaults: `breaking` ⇒ `blocking`, `advisory` ⇒ `non-blocking`. Orchestrator may override. |
| `dimension` | enum | `faithful-representation`, `naming-consistency`, `implicit-dependencies`, `capability-gap`, `ux-product-mismatch`, `mockup-extraction-gap`, `target-platform-mismatch`, `other` |
| `upstream_id` | string \| null | The upstream item the downstream was checked against; null if not tied to a single upstream |
| `downstream_id` | string | The item or artifact being evaluated |
| `message` | string | One-sentence finding. Quote the specific divergent phrasing when possible. |
| `suggested_fix` | string \| null | Optional concrete edit direction; null when not obvious |

If no findings for a check, return an empty list. Do not invent severities, dimensions, or fields.

---

## Severity Classification

VibeLoom uses a **two-axis** model:

- **Semantic severity (`severity`)** — what the finding asserts about meaning. Values: `breaking` | `advisory`.
- **Gate effect (`gate_effect`)** — what the finding does to the approval gate at evaluation time. Values: `blocking` | `non-blocking`.

The two are correlated but distinct: by default, `breaking` ⇒ `blocking` and `advisory` ⇒ `non-blocking`. The orchestrator may override `gate_effect` per project policy (e.g., promote a recurring advisory to blocking until addressed). Older eval traces that emit only `severity` SHOULD be read as `severity=blocking` ⇔ `severity=breaking`; new traces SHOULD set both fields.

- **`breaking`** — the finding alters the meaning of an approved upstream item (narrowing, widening, reversing) or represents a capability entirely unaddressed. Breaking findings are `blocking` by default; they block delegated auto-advance in `pm` / `dev` modes and escalate to explicit user review (methodology ## Generation ### Approval And Auto-Advance).
- **`advisory`** — worth surfacing, but does not reliably indicate a spec defect. Naming drift, suggested implicit edges, and partial capability coverage are typically advisory and `non-blocking`.

When in doubt, classify as `breaking`. False advisories cost a review cycle; false-negative breaking findings let meaning drift past an approval gate.

---

## Dimensions

### Faithful Representation

**What:** For a downstream item and each item it declares in `derives_from`, judge whether the downstream faithfully represents the upstream's meaning.

**Faithful** means the downstream neither narrows, widens, reverses, nor contradicts the upstream. Adding detail or refinement consistent with the upstream is not a violation — that is what downstream tiers are for. Changing the scope, direction, or claim is.

**Breaking signals:**
- Downstream narrows upstream scope (e.g., upstream says "all users," downstream applies to "premium users only")
- Downstream widens upstream scope beyond what's stated
- Downstream reverses or negates upstream meaning
- Component interfaces (`IF-####`): contract, error behavior, or effects differ from the approved version
- Invariants (`INV-####`): rule weakened or strengthened compared to the approved version

**Advisory signals:**
- Downstream picks one plausible reading of an ambiguous upstream; another reading is equally plausible
- Downstream omits a detail that could be a deliberate refinement or a gap (when ambiguity is genuine)

If the downstream faithfully represents the upstream, emit no finding.

### Naming Consistency

**What:** Given the domain model's `TERM-####` items and a downstream artifact, judge whether the artifact's terminology aligns with the ubiquitous language.

**Consistent** means concepts defined by `TERM-####` are referred to using the same word or phrase throughout. Introducing a new word for a defined concept is a drift. Using a defined term with a different meaning than its `TERM` entry is a drift.

**Breaking** when the drift introduces genuine semantic confusion — the same word used for two different concepts in the same artifact, or a defined term used with a contrary meaning. **Advisory** for simple naming inconsistencies that don't obscure meaning.

If terminology aligns with the domain model, emit no finding.

### Implicit Dependencies

**What:** For a downstream item and its declared `derives_from`, judge whether there are upstream items the downstream's meaning depends on but that are not in `derives_from`.

**Candidate upstreams** are items of allowed upstream prefixes for the downstream's type per the Contract Graph (methodology §8). Do not propose edges to disallowed types.

**Depends on** means the downstream's description, constraints, or behavior would change if the candidate were removed or modified. A passing mention is not a dependency; a load-bearing reference is.

Emit one `advisory` finding per missing edge. Do not classify as `breaking` — whether to add the edge is a user decision, not an approval gate.

If no implicit dependencies are detected, emit no finding.

### Capability Gaps

**What:** Given all `CAP-####` and `CST-####` items from `intent` and the full downstream stack, judge whether each capability and hard constraint is substantively addressed somewhere downstream.

**Addressed** means at least one downstream artifact carries meaning that implements or enables the capability — not just a `derives_from` edge pointing at it. The engine's structural coverage check already ensures at least one edge exists; this check asks whether the meaning is actually carried.

**Breaking** for capabilities or hard constraints entirely unaddressed. **Advisory** when partially addressed, or addressed at an unexpectedly shallow level for the current mode.

If all capabilities and constraints are substantively addressed, emit no finding.

### UX/Product Mismatch

**What:** When ux-specs and product-specs are both in scope, judge whether they remain coherent. A VIEW that implies behavior not captured by any FR or STORY, or an FR that implies a UI surface not captured by any VIEW, are mismatches.

**Breaking** when the mismatch represents a substantive functional gap (e.g. "STORY-0019 says users can share notes by email, but no VIEW or INT supports this"). **Advisory** for cosmetic or minor coverage gaps.

If ux-specs and product-specs remain coherent, emit no finding.

### Mockup Extraction Gap

**What:** When mockups (`MOCK-####`) are in the load set, judge whether the contract items (FR, STORY, ACC, BC, TERM) substantively capture what the mockups visibly imply. Designers express user obligations through mockups; if a mockup shows a "recurring" toggle but no contract item captures recurring behavior, that's an extraction gap.

**Breaking** when a clearly visible mockup obligation is entirely missing from the contract (especially in `ux` mode where mockups drive product-spec generation). **Advisory** when the obligation is captured at a different level of abstraction or in a related item.

If mockup-implied obligations are substantively captured, emit no finding.

### Target-Platform Mismatch

**What:** When system-specs containers carry a `layer` field and `defaults.md` declares Tech Stack per layer, judge whether each container's deployment target and its inferred shape are consistent with the declared stack.

Examples:
- A `presentation` container declares "deploys as AWS Lambda" — mismatch (presentation is typically static asset bundle, not serverless function).
- A `domain` container's components declare interfaces that imply event-sourced aggregates, but defaults Tech Stack `aggregate pattern: CRUD` — mismatch.
- An `infrastructure` container declares no platform service dependencies — mismatch (infrastructure containers exist to declare them).

**Breaking** when the mismatch implies the codegen will produce a non-functional artifact (e.g. trying to package a SPA as a Lambda function). **Advisory** when the mismatch is a stylistic divergence from the declared stack.

If the deployment target and stack are consistent across all containers, emit no finding.

### Other Drift

The named dimensions above are not exhaustive. When you observe a semantic issue that clearly matters for approval but fits none of them, emit a finding with `dimension: other` and a message that identifies the nature of the drift. Prefer a named dimension when one fits; reserve `other` for genuine novelty.

---

## Application Notes

- Apply every dimension relevant to the target scope. `faithful-representation` and `implicit-dependencies` are per-item; `naming-consistency` and `capability-gap` are per-artifact or per-stack. `ux-product-mismatch` applies when both ux-specs and product-specs are in scope. `mockup-extraction-gap` applies when MOCK items are in the load set. `target-platform-mismatch` applies when system-specs containers and the Tech Stack section are in scope.
- Return the full finding list. Filtering to "most important" findings is the orchestrator's call, not the check's.
- Semantic eval is target-bounded — validate the target against its approved upstream basis; do not inspect downstream artifacts.
````

### `skill/references/modes.md`

````template:skill/references/modes.md
# Modes Reference

Modes control user ownership, delegation, and contract-stack depth. Authoritative semantics live in [`vibeloom-methodology.md ## Modes`](../../../vibeloom-methodology.md). This file is a load-on-demand condensation.

A mode controls three things:

- which contract tiers the user explicitly co-authors and approves
- which contract tiers are delegated to the agent for auto-advance
- whether the contract stack is full or compact

An approval unit is one contract tier.

---

## Full modes

`pm`, `dev`, `ux`, and `expert` all maintain the full contract stack: `intent-specs` → `product-specs` ⇄ `ux-specs` → `system-specs` → `context` → `code`. They differ in which tier the user owns and which auto-advance.

### `expert`

- **User owns:** all contract tiers (`intent-specs`, `product-specs`, `ux-specs`, `system-specs`).
- **Delegated:** none.
- **Public surface:** `generate`, `review`, `eval`, `reconcile`, `approve`, `status`, each accepting any target tier.
- **Normal stops:** every contract tier pauses for explicit user review and approval.

### `pm`

- **User owns:** `intent-specs`, `product-specs`. Optionally `ux-specs` (peer review of generated ux).
- **Delegated:** `system-specs` auto-advances when safe.
- **Public surface:** same as `expert`.
- **Normal stops:** after `product-specs` generation; `ux-specs` if owned, then `system-specs` auto-advances unless blocking eval findings or a breaking semantic change is detected.

### `dev`

- **User owns:** `intent-specs`, `system-specs`. Optionally `ux-specs`.
- **Delegated:** `product-specs` auto-advances when safe.
- **Public surface:** same as `expert`.
- **Normal stops:** after `system-specs` generation; `product-specs` auto-advances between intent approval and system generation.

### `ux`

Designer-led counterpart to `pm`. The designer drives discovery from intent + mockups; PM peer-reviews the generated product-specs.

- **User owns:** `intent-specs`, `ux-specs`. Optionally `product-specs` (peer review of ux-derived product).
- **Delegated:** `system-specs` auto-advances when safe.
- **Public surface:** same as `expert`, plus the `generate-product-specs-from-ux` task variant.
- **Normal stops:** after `ux-specs` approval; `product-specs` is generated from approved intent + ux evidence and presented to the PM as a peer-review gate; `system-specs` auto-advances when clean.
- **Mockups are first-class input evidence** — they may directly drive product-spec generation. They become normative truth only when their extracted obligations are represented as IDed contract items.

---

## Compact mode

### `vibe`

Simplified ceremony for small or early-stage projects. Visible contract stack collapses to `intent` + `defaults` + flat `system`; the user approves outcomes, not intermediate specs. Graph/cache/code-sync-like machinery may exist internally when useful, but it is not a user-owned approval surface. `status` is a lightweight one-screen "where am I?" report, not the full per-item taxonomy (see implementation §15.6 and `tasks/status.md` vibe branch).

- **Artifacts present:** `intent` (with product summary section), `defaults`, `system` (flat), root `config`, `source`, `tests`, `runtime`.
- **Artifacts absent:** `prd`, `usm`, `dm`, `ux`, `containers`, per-container `container`, per-component `component`, `decision-trace.md`, `bdd`, container/component-scoped config.
- **Tier order:** `intent-specs` → `system-specs` → `context` (root config only) → `code`.
- **User owns:** `intent-specs` only.
- **Delegated:** `system-specs` auto-advances when structural blockers clear.
- **Traces:** vibe still emits cheap provenance traces, especially approvals, generations, and decisions. These preserve repair/debug context and future upgrade migration.
- **Public surface:**
  - `approve intent-specs`
  - `generate code`
  - `reconcile code`
  - `review intent-specs`, `eval intent-specs`
  - `review context`, `eval context`
  - `review code`, `eval code`
  - `status`
- **Normal stops:** only `intent-specs` is a public user stop. Compact `system-specs` never becomes a public approval stop.
- **System-specs handling:** the engine may target `system-specs` internally, but it is not publicly reviewable.

---

## Delegated auto-advance

In `pm`, `dev`, and `ux`, a delegated approval unit auto-advances only when all conditions hold:

1. Structural eval passes (decidable tier of the verification ladder — all blocking checks clear).
2. No breaking semantic change detected against approved truth (heuristic tier).
3. No flagged issue requires human judgment.

If any condition fails, the delegated tier escalates to explicit user review and approval before the run can complete. See [`runtime.md`](runtime.md) for the validation rules and [`eval.md`](eval.md) for the verification ladder.

In `vibe`, compact `system-specs` uses the same safety tests. Structural blockers halt downstream generation; non-blocking advisory findings may allow best-effort continuation with findings surfaced and upgrade recommended when appropriate.

---

## Mode × command matrix (normal flow)

| Step | `vibe` | `pm` | `dev` | `ux` | `expert` |
|---|---|---|---|---|---|
| Bootstrap | `init --mode vibe` | `init --mode pm` | `init --mode dev` | `init --mode ux` | `init --mode expert` |
| Shape intent | `review intent-specs` | `review intent-specs` | `review intent-specs` | `review intent-specs` | `review intent-specs` |
| Approve intent | `approve intent-specs` | `approve intent-specs` | `approve intent-specs` | `approve intent-specs` | `approve intent-specs` |
| Shape ux | — | (optional) | (optional) | `review ux-specs` | `review ux-specs` |
| Approve ux | — | (optional) | (optional) | `approve ux-specs` | `approve ux-specs` |
| Forward to product | — | `generate product-specs` | (automatic) | `generate product-specs --from ux` | `generate product-specs` |
| Approve product | — | `approve product-specs` | (auto or escalated) | (PM peer review) | `approve product-specs` |
| Forward to system | (automatic) | (automatic) | `generate system-specs` | (automatic) | `generate system-specs` |
| Approve system | (automatic) | (auto or escalated) | `approve system-specs` | (auto or escalated) | `approve system-specs` |
| Forward to code | `generate code` | `generate code` | `generate code` | `generate code` | `generate code` |

`(automatic)` = handled by the forward `generate` command via smart orchestration.
`(auto or escalated)` = normally delegated, but escalates if breaking change detected.
`(optional)` = user may opt to own ux-specs in this mode; default is to skip.
`(PM peer review)` = product-specs generated from ux evidence; PM reviews and approves before downstream proceeds.
`—` = tier does not exist in this mode.

---

## Next-command suggestions

After every stop, the skill suggests the next forward command:

| After | `vibe` | `pm` | `dev` | `ux` | `expert` |
|---|---|---|---|---|---|
| approve intent-specs | `generate code` | `generate product-specs` | `generate system-specs` | `generate ux-specs` (or open `ux-specs/mockups/`) | `generate product-specs` |
| approve ux-specs | — | — | — | `generate product-specs --from ux` | `generate product-specs` |
| approve product-specs | — | `generate code` | — | (system auto-advances) | `generate system-specs` |
| approve system-specs | — | — | `generate code` | — | `generate code` |
| explicit `generate context` | — | `generate code` | `generate code` | `generate code` | `generate code` |

---

## Upgrade

`init --upgrade --mode <pm|dev|ux|expert>` promotes a `vibe` repo to a full mode. One-way — no downgrade back to `vibe`. See [`../../../vibeloom-methodology.md ## Vibe-to-Full Upgrade`](../../../vibeloom-methodology.md). The compact stack expands into the full graph; existing code is import-analyzed against the freshly generated full contract.
````

### `skill/references/operations.md`

````template:skill/references/operations.md
# Operations Reference

Quick runtime reference for VibeLoom operations. Authoritative semantics live in [`vibeloom-methodology.md ## Operations`](../../../vibeloom-methodology.md); this file is a load-on-demand condensation for the skill.

`eval` and `generate` are the primitives. `review` is an interactive shell on `eval`; `reconcile` is an interactive shell on `generate`. An approval unit is one contract tier.

---

## `init`

- **Purpose:** Bootstrap an ungoverned repo with a new VibeLoom-governed project.
- **Parameter:** Optional seed — prose artifact (file path or inline text) describing the intended system. When omitted, interactively interview the user for capabilities and constraints.
- **Flags:** `--mode` (`pm` | `dev` | `ux` | `expert` | `vibe`) — required. `--upgrade` — when used with `--mode` (`pm` | `dev` | `ux` | `expert`), promotes a `vibe` repo to the specified full mode.
- **Precondition:** Repo has no existing VibeLoom governance, OR (with `--upgrade`) repo is currently in `vibe` mode.
- **Postcondition:** Mode set. Draft `intent` and `defaults` generated from the seed or interview. With `--upgrade`: full contract stack generated from compact artifacts as `draft`; mode changed to target.
- Bootstrap-only (without `--upgrade`): valid only as the first successful command in an ungoverned repo.

## `import`

- **Purpose:** Bootstrap from existing code by reconstructing candidate contract bottom-up.
- **Parameter:** Optional source repo path. When omitted, imports from the current repo's own code. When provided, reads source code from the specified repo but sets up governance in the current repo.
- **Flags:** `--mode` (`pm` | `dev` | `ux` | `expert` | `vibe`) — required.
- **Precondition:** Current repo has no existing VibeLoom governance; source repo contains existing source code.
- **Postcondition:** Candidate contract artifacts reconstructed in `draft` in the current repo; mode set.
- Review and approval proceed top-down even though reconstruction is bottom-up.
- Bootstrap-only.

## `generate`

- **Purpose:** Generate one or more affected tiers from approved upstream truth using the forward-back pass model. Idempotent; does not inspect existing downstream artifacts for drift.
- **Parameter:** Optional target (`intent-specs` | `product-specs` | `ux-specs` | `system-specs` | `context` | `code`). When omitted, starts at the highest affected tier and follows the normal mode-specific forward path until the next required explicit user stop or completion.
- **Flags:** None.
- **Precondition:** Upstream tier(s) approved. For `intent-specs`, a governed repo must exist (initial creation is handled by `init`).
- **Postcondition:** For contract tiers: target tier artifacts in `draft`; `eval` runs automatically. Blocking findings keep the tier in `draft` until resolved via `review` or out-of-band edits + `eval`. Context and code artifacts generate directly without lifecycle state.
- When target is `code`, `context` is generated implicitly first.
- When target is `context`, generation stops after context.
- In `vibe`: valid targets are `intent-specs` | `system-specs` | `context` | `code`. `product-specs` does not exist.

## `eval`

- **Purpose:** Run structural and semantic validation on a target against its approved upstream basis. For contract tiers, also validates internal consistency within the target tier.
- **Parameter:** Optional target (`intent-specs` | `product-specs` | `ux-specs` | `system-specs` | `context` | `code`). When omitted, evaluates the next target requiring attention in top-down forward order.
- **Precondition:** Target exists.
- **Postcondition:** Structural findings (blocking) and semantic findings (non-blocking) reported. No artifacts modified.
- Runs automatically as part of `generate` and `approve` for contract tiers.
- Target-bounded: validates target against approved upstream truth, never inspects downstream.

## `review`

- **Purpose:** Interactive validation of a target. Interactive shell on `eval` — each cycle runs `eval`, surfaces findings, proposes fixes, applies bounded edits within the target.
- **Parameter:** Optional target. When omitted, reviews the next target requiring attention.
- **Precondition:** For contract targets, the target exists in `draft`; if already `approved`, `review` is findings-only. For `context` and `code`, the target exists.
- **Postcondition:** Findings surfaced; bounded fixes applied within the target.
- Does not propagate downward; that belongs to `reconcile`.
- Exit choices: `Loop`, `Eval only`, `Proceed to approve` (contract draft) or `Accept` (context/code, or already-approved contract).

## `reconcile`

- **Purpose:** Remediation loop for drift in all forms (structural, lifecycle, semantic — see [`../../../vibeloom-methodology.md`](../../../vibeloom-methodology.md) §15 (drift classification) and §16 (workflow shapes for reconciliation)). Inspects existing downstream artifacts, surfaces conflicts, selectively regenerates after user direction. Interactive shell on `generate`.
- **Parameter:** Optional target scope (`product-specs` | `ux-specs` | `system-specs` | `context` | `code`). When omitted, reconciles from the highest changed tier downward through `code`.
- **Precondition:** At least one drift form is present — approved upstream has changed (structural), an approved artifact was edited outside the flow (lifecycle), or semantic eval surfaced content divergence.
- **Postcondition:** Drift resolved; affected artifacts regenerated via `generate`.
- Always user-initiated. The default forward path is `generate`.
- Two-phase: scoped read-only drift analysis → user direction per case → scoped write-capable reconcile tasks.

## `approve`

- **Purpose:** Advance a reviewed contract approval unit from `draft` to `approved`.
- **Parameter:** Optional approval unit (`intent-specs` | `product-specs` | `ux-specs` | `system-specs`). When omitted, approves the next required approval unit in top-down order whose structural eval passes.
- **Precondition:** Approval unit exists in `draft` and structural `eval` passes (all blocking checks clear).
- **Postcondition:** Status set to `approved`; provenance recorded (`approval_mode: user` or `delegated`, plus timestamp).
- Editing an approved artifact reopens it to `draft` automatically.

## `status`

- **Purpose:** Show current methodology state: lifecycle, downstream freshness, coverage, affected scope, mode.
- **Parameter:** Optional scope filter (`intent-specs` | `product-specs` | `ux-specs` | `system-specs` | `context` | `code` | a specific container or component scope).
- **Postcondition:** Read-only report including:
  - Contract-tier lifecycle (`draft` | `approved` | not yet generated)
  - For `context` and `code`: generated/not yet generated
  - Per-item status across the categories: `current` | `stale` | `uncovered` | `dangling` | `drifted` | `obsolete`
  - Affected tiers and scopes
  - Coverage gaps
  - Current mode
- In full modes, graph-backed. In `vibe`, heuristic approximations from `intent`, compact `system`, root config, and current code.

---

## Operation summary

| Interactive (user-guided) | Formal (automated) | Scope |
|---|---|---|
| `review` — shell on `eval` | `eval` — structural + semantic validation | target artifact or tier |
| `reconcile` — shell on `generate` | `generate` — forward-back-pass production | downstream artifacts |

See [`runtime.md`](runtime.md) for dispatch mechanics and [`modes.md`](modes.md) for mode-specific behavior.
````

### `skill/references/runtime.md`

````template:skill/references/runtime.md
# Runtime Reference

Dispatch mechanics for the skill. Authoritative semantics live in [`vibeloom-implementation.md`](../../../vibeloom-implementation.md). This file is a load-on-demand condensation focused on what the orchestrator needs at runtime.

---

## Runtime loop

Every operation follows the same high-level loop:

1. Load only the minimal planning state needed for the current operation.
2. Compute the affected set and call engine `dispatch` to get the initial dispatch plan.
3. Dispatch the current ready set as scoped subagent tasks (each with a fully-formed task header — see below).
4. Validate subagent results from summaries plus allowed spot reads.
5. If a task surfaces one narrow missing dependency, re-invoke that task once with an approved late-fetch slice.
6. Accept successful task results, retire superseded ones, recompute the remaining dispatch plan, and continue to the next ready set.
7. Finish any shared/root/orchestrator-local work and return target-level findings or outputs.

---

## Dispatch plan structure

The engine's `dispatch` command returns a plan with:

- `plan_id`
- `affected_set` — the items triggering the run
- `waves` — ordered list; each wave has `wave_id`, `scopes`, `dependencies` (scope→scope edges)

Each scope in a wave carries: `scope_id`, `kind` (component/container/root), `owned_paths`, `allowed_read_paths`, `task_template_id`.

## Wave assembly rules

- Two scopes share a wave iff their `owned_paths` are disjoint (writes can't collide).
- Scope B is in a later wave than scope A iff B's `derives_from` references items owned by A.
- Wave size is bounded by orchestrator concurrency policy (e.g. max 5 subagents per wave).
- Reconciliation tasks always run as singleton waves.

## Parallel semantics

- Within a wave, subagents run concurrently. The orchestrator awaits all results.
- Patches are applied sequentially in scope-id order to avoid race conditions.
- Validation runners per task run inside the subagent's staging dir at `.vibeloom/runs/<RUN-ID>/tasks/<TASK-ID>/` BEFORE the patch is applied to the working tree.

## Subagent task header

The orchestrator-to-subagent contract has these fields (per canonical implementation §13.4):

| Field | Notes |
|---|---|
| `task_id` | unique within run |
| `run_id` | the parent generation/eval/reconcile run |
| `wave_id` | which wave in the dispatch plan |
| `template_id` | which task template (e.g. `generate-code-component`) |
| `template_version` | for reproducibility |
| `scope` | scope_id from the dispatch plan |
| `load_set_refs` | references to baseline + owned + foreign + context items |
| `foreign_refs` | IF-#### contracts of dependencies (read-only) |
| `allowed_read_paths` | globs the subagent may read |
| `allowed_write_paths` | globs the subagent may write (disjoint from sibling subagents in this wave) |
| `validation_contract` | runner_ids the orchestrator will invoke against the patch |
| `result_shape_id` | expected return shape |

The body of the prompt that wraps this header lives in [`../subagent-prompt.md`](../subagent-prompt.md).

---

## Subagent execution contract

Subagents are a general execution primitive for scoped `import`, `generate`, `eval`, `review`, `reconcile` work when decomposition is useful.

Two modes:

- **read-only analysis** — scoped `import` analysis, `eval`, advisory `review`, drift analysis inside `reconcile`. No write scope.
- **write-capable generation / reconciliation** — contract, context, code generation; bounded-fix phases of `review`; fix phases of `reconcile`. Explicit write scope.

Each invocation starts from a fresh prompt built from:

- the task header (operation + target + scope + objective + write permissions + prerequisites + validation contract + result-shape)
- the scoped load set (baseline + owned scope + foreign slice + relevant context)
- minimal accepted prior-wave summaries needed for prerequisites or unresolved findings

Subagents may not treat same-wave outputs as input. Same-wave outputs become eligible inputs only after the wave is accepted and the dispatch plan is recomputed.

---

## Parallel dispatch

### Contract tiers

Sequential across tiers, but three phases inside a tier:

1. **Root forward-back pass** — root artifacts generate in dependency order (e.g., `prd` → `usm` → `dm`). Back-pass reopens affected earlier artifacts until stable.
2. **Container wave** — affected `container.md` files generate in parallel. Writes disjoint by directory.
3. **Component wave** — affected `component.md` files generate in parallel after the container wave completes. `component.md` reads its own `container.md` (per DAG), so the component wave follows container wave.

### Context

Single parallel wave:

- one task for root config
- one task per affected container config
- one task per affected component — generates both component config and any component-scoped `bdd` in one invocation (shared load set and write scope)

Decision-trace writes (the `decision` trace family — record_type IDR/PDR/UDR/ADR/general) are orchestrator-local appends to `.vibeloom/traces/decisions.jsonl`, not subagent tasks. Per-record markdown rendering at `decisions/<record_type>/<RECORD>-<NNNN>-<slug>.md` is also orchestrator-local.

### Code

Dependency-aware waves. Wave computation:

- a component can join the current wave when all its `DEP-####` references resolve to components in already-completed waves (or to none)
- its `owned_paths` are disjoint from every other component's `owned_paths` in the same wave

Computed by topological sort over `DEP-####` → `IF-####` edges. Once a wave completes and cross-scope validation passes, the orchestrator recomputes and dispatches the next ready set.

### Post-wave validation

After each wave, the orchestrator validates from accepted summaries + targeted spot reads:

- interface contracts declared in component specs are satisfied
- dependency references resolve to actual generated outputs
- no conflicting file writes or write-scope violations

If validation fails and failing outputs can be localized, only affected tasks are reopened. If the failure is cross-cutting or ownership-ambiguous, surface findings and stop.

---

## Context loading

### Orchestrator (full modes)

Loads: skill instructions, status snapshot, graph cache, and only the artifacts needed for planning. After dispatch, retains graph + status + dispatch plan + subagent summaries. Reopens artifacts only for targeted spot validation.

### Orchestrator (vibe)

Loads: skill instructions, current `intent.md`, compact `system.md` when present, and recent tails of `approvals.jsonl` / `generations.jsonl` / `decisions.jsonl`. The orchestrator may derive private graph/cache/status/code-sync-like scaffolding, but it must not expose that scaffolding as user-managed contract or approval ceremony. Vibe operations rarely dispatch many subagents; post-dispatch retention is minimal.

### Subagent load sets (full modes)

| Subagent scope | Baseline | Owned scope | Referenced foreign slice | Relevant context |
|---|---|---|---|---|
| component | root config + `defaults` | component + container config, component spec, container spec, relevant `system`/`containers` summary | directly referenced IF/DEP snippets from siblings or cross-container | component-scoped `bdd`, intersecting load-bearing decision-trace records |
| container | root config + `defaults` | container config, container spec, `system`, `containers`, affected component inventory summary | directly referenced cross-container IF/DEP snippets | intersecting load-bearing decision-trace records |
| root | root config + `defaults` | target root artifact(s), `system`, `containers` as needed | targeted downstream summaries when required for planning/merge | intersecting load-bearing decision-trace records |

### Subagent load sets (vibe)

All subagents load root config + `defaults` + approved `intent.md` as baseline. If internal component-level dispatch is used, each subagent also receives the targeted component slice from flat `system.md` plus directly referenced compact IF/DEP excerpts. If the compact inventory is too ambiguous for safe partitioning, fall back to single-agent execution.

### Operation overlays

Scope base is filtered by operation:

- **contract gen / eval / review** — contract target + approved upstream basis; omit `bdd`; include config only when validation explicitly depends on it
- **context gen / eval / review** — governing contract slice + context artifacts at the target scope
- **code gen / eval / review / reconcile** — contract + config + relevant context + foreign dependency slice
- **import analysis** — code + inferred-scope hints + minimal reconstruction guidance; no generated context artifacts as inputs

### Intent is not a subagent load

Intent persistence is orchestrator-level, not a subagent concern. Once each tier is approved, it captures everything downstream needs. Subagents work from the approved contract slice. If a subagent would need intent directly, that signals insufficient upstream capture — fix the contract, not the load set.

---

## Late-fetch

A subagent may surface a late-fetch request in its result summary when it discovers a narrow missing dependency. The orchestrator evaluates:

- if a slice can be supplied without broadening the subagent's ownership or write scope, the orchestrator re-invokes the same task once with the additional slice added to its fresh prompt
- if the re-invocation's result summary still requests missing slices, the orchestrator treats this as a finding and exits the task

At most **one late-fetch re-invocation per task**.

---

## Spot reads

Spot reads are targeted rereads of specific files triggered by a concrete validation need. Typical triggers:

- verifying a reported interface/provider match
- inspecting a file implicated by a failed validation
- inspecting a file in a declared write set
- inspecting a file or artifact referenced by an unresolved finding

Broad rereads of whole scopes or entire waves are not part of normal execution. If a broad reread seems necessary, surface findings and stop rather than silently expand context.

---

## Context efficiency

The implementation does not promise a fixed token budget. Efficiency comes from four mechanisms:

- **targeted slices** — subagents receive only the contract + context intersecting their scope
- **one-template-at-a-time loading** — the agent loads one template per artifact, unloading between artifacts
- **bounded late-fetch** — at most one re-invocation per task
- **dependency-aware waves** — subagents share a wave only when write scopes are disjoint and declared dependencies are already satisfied

For reference, a component subagent typically receives 6–12K tokens of contract + config + context slice.

---

## Accepted state

`accepted` is operation-local runtime state, not artifact metadata:

- for write-capable tasks, an accepted result is a validated set of writes retained in the active operation state
- for read-only tasks, an accepted result is a validated scoped findings/evidence package
- accepted is distinct from `approved`
- superseded accepted results are retired from the active plan

Dispatch plans and subagent summaries are ephemeral by default. They are not governed repo truth and are not normal prompt inputs outside the current operation.

---

## Orchestrator writes

The orchestrator may write only:

- shared/root/runtime artifacts
- decision-trace appends (`.vibeloom/traces/decisions.jsonl`) plus per-record markdown rendering at `decisions/<record_type>/<RECORD>-<NNNN>-<slug>.md`
- approval-trace appends (`.vibeloom/traces/approvals.jsonl`)
- `.vibeloom/cache/` regenerable state
- other trace family appends (generations, evals, code-sync, imports)

Component-owned outputs are changed only through subagent rerun/reconcile flow, not direct orchestrator patching.
````

### `skill/references/troubleshooting.md`

````template:skill/references/troubleshooting.md
# Troubleshooting Reference

Common failure modes and recovery paths. Load on demand when the normal flow hits an error or ambiguity.

---

## Graph cache missing or corrupt

**Symptom:** `.vibeloom/cache/contract-graph.json` is absent, unreadable, or fails validation.

**Action:** The engine regenerates the cache from ground truth (contract + context artifacts) before proceeding. Do not fail the operation; rebuild and continue.

---

## Direct edit detected on an approved artifact

**Symptom:** An approved contract artifact's content differs from the last-approved form. The engine detects this via a two-tier compare: filesystem mtime mismatch triggers per-item hash comparison against the approval trace.

**Action:** If any item was added, removed, or modified (hash differs), the engine automatically reopens the artifact to `draft` before proceeding. If mtime changed but every item's hash still matches (e.g., whitespace-only or non-semantic frontmatter edit), the artifact stays `approved` and the recorded mtime is updated. Users do not manually maintain `status` for this transition. Confirmation is required only for the semantic decisions that follow, not for the lifecycle bookkeeping itself.

---

## Breaking semantic change during delegated auto-advance

**Symptom:** In `pm` or `dev`, a delegated tier's eval detects a breaking change (see [`vibeloom-methodology.md ## Generation ### Breaking-Change Detection`](../../../vibeloom-methodology.md) for the classification table).

**Action:** Escalate. Explicit user review and approval of that tier become required before the run can complete. Surface the breaking signal with item IDs, both approved and draft statements, and the conflict description.

In `vibe`, compact `system-specs` uses the same safety tests. Structural blockers halt downstream generation. Non-blocking advisory findings may still allow best-effort continuation with findings surfaced and upgrade recommended when appropriate.

---

## Partial wave failure

**Symptom:** Some subagents in a wave succeed, some fail (e.g., validation errors, late-fetch exceeded).

**Action:**

- Accept successful task results into operation-local accepted state.
- Retire failed tasks from the active plan.
- If failing outputs can be localized, reopen only affected tasks in a follow-up wave (the next recomputed ready set).
- If the failure is cross-cutting or ownership-ambiguous, surface findings to the user and stop rather than guess.

Unaffected accepted task results stay active across retries.

---

## Late-fetch exceeded

**Symptom:** A subagent's re-invocation result summary still requests missing slices after the first approved late-fetch.

**Action:** The orchestrator treats this as a finding and exits the task. Surface the unresolved need in the operation's final report. User then decides: amend upstream contract, widen scope manually, or accept the partial result.

Cap: **one late-fetch re-invocation per task**, no exceptions.

---

## Approval unit blocked

**Symptom:** `approve <target>` fails because structural `eval` has blocking findings.

**Action:** Do not promote to `approved`. Report the blocking findings with item references. User fixes via `review <target>` (bounded fixes) or out-of-band edits + re-run `eval`. Approval becomes available only when all blocking checks clear.

---

## Ambiguous import reconstruction (vibe)

**Symptom:** During `import --mode vibe`, the flat system inventory cannot be safely partitioned into components (inventory is too ambiguous).

**Action:** Fall back to single-agent execution for downstream generation. Surface the ambiguity as findings and recommend `review intent-specs` or upgrade to a full mode when the project has grown enough to warrant it.

---

## Conflicting drift choices during reconcile

**Symptom:** During `reconcile`, two drift cases propose incompatible fix directions (e.g., one amends upstream truth, another preserves upstream and corrects downstream).

**Action:** Surface the conflict before fixes are applied. User must resolve the conflict before the reconcile wave proceeds.

---

## Subagent wrote outside its declared write set

**Symptom:** Post-wave validation reveals a file written by a subagent that is not in its `allowed_writes`.

**Action:** Reject the task's writes. Do not accept the result. Treat as a failed task: if the failure can be localized, reopen in a follow-up wave; if cross-cutting, surface findings and stop.

---

## Broad reread needed

**Symptom:** Cross-scope validation is tempting to resolve by rereading an entire scope or wave.

**Action:** Do not silently expand context. Surface findings to the user and stop. Broad rereads are not part of normal execution — they signal either a validation-rule gap or genuine ambiguity that needs user judgment.

---

## Upstream not approved

**Symptom:** `generate <target>` or `approve <target>` runs but an upstream tier is still in `draft`.

**Action:**

- If the upstream tier is **delegated** in the current mode: auto-advance it (eval → approve if safe) and continue.
- If the upstream tier is a **user stop** in the current mode: halt and surface the need for explicit user review and approval before continuing.

See [`modes.md`](modes.md) for per-mode auto-advance behavior.

---

## Bootstrap already succeeded

**Symptom:** `init` or `import` invoked on a repo that already has VibeLoom governance.

**Action:** Return an error with guidance: "Bootstrap already succeeded; use `generate` or `status` to continue." Exception: `init --upgrade --mode <pm|dev|expert>` is valid only when the current mode is `vibe`.

---

## Downgrade attempt

**Symptom:** `init --upgrade --mode vibe` or any attempt to move from `pm`/`dev`/`expert` back to `vibe`.

**Action:** Reject with explanation. The vibe → full transition is one-way.
````

## Task templates

### `tasks/approve.md`

````template:tasks/approve.md
<!--
VibeLoom task template: approve
Operation: approve
Invoked by: SKILL.md when user runs `/vibeloom approve <approval-unit>` (where approval-unit = one contract tier: intent-specs, product-specs, ux-specs, system-specs)
-->

# Task: approve

## Purpose

Advance a reviewed contract approval unit from `draft` to `approved`. Records an approval trace capturing per-item content fingerprints, which becomes the basis for subsequent drift detection.

## Inputs

- `<approval-unit>`: required. One contract tier: `intent-specs | product-specs | ux-specs | system-specs`.
- `--mode` (optional): `user` or `delegated` (engine fills in based on current mode + tier ownership rules).
- Approval-unit artifacts at `draft` status with structural eval clean.
- Current project mode (`vibe | pm | dev | ux | expert`).

## Preconditions

- Approval unit exists.
- All artifacts in the approval unit are `draft` (or already `approved` — in which case approve is a no-op).
- Structural eval passes for full modes. In vibe, compact structural checks pass for the visible artifact being approved.
- All blocking findings from semantic eval are addressed (no `blocking` findings remain in the most recent eval trace).
- For mode-delegated approval: current mode allows delegated approval for this tier (e.g. system-specs in pm mode auto-advances when conditions met).

## Steps

1. Run `eval --target <approval-unit>` to confirm clean.
2. If any blocking finding: abort, surface "approval cannot proceed; address findings first via review."
3. Compute fingerprints:
   - Full modes: per-item content fingerprints (SHA-256 canonical hashes) for every IDed item in the approval unit.
   - Vibe: compact artifact fingerprints for the visible approval surface (`intent.md` for user approval); private scaffolding, if any, is not an approval unit.
4. Compute per-artifact hashes alongside items.
5. Append an `approval` trace entry to .vibeloom/traces/approvals.jsonl with:
   - approval_unit (the tier)
   - approval_mode (user or delegated)
   - items: { item_id: hash } per IDed item in the unit
   - artifacts: { artifact_id: hash } per artifact in the unit
   - run_id, timestamp, author
6. Update each artifact's frontmatter status from `draft` to `approved`.
7. Refresh derived runtime state:
   - Full modes: refresh Contract Graph cache.
   - Vibe: do not expose graph refresh as ceremony; private scaffolding may be refreshed if the engine uses it.

> **Note on auto-advance:** the `approve` task itself does NOT invoke downstream generation. Auto-advance to the next tier is an **orchestrator policy** (see methodology §5, "Delegated auto-advance" in `references/modes.md`). The orchestrator may, after `approve` returns successfully, schedule the next `generate-*` operation if the current mode delegates the downstream tier and conditions hold. Approval and generation remain distinct operations with distinct traces.

## Output

- Each artifact in the approval unit: status updated to `approved`.
- New approval trace entry in .vibeloom/traces/approvals.jsonl.
- Derived runtime state refreshed as appropriate for the mode.

## Postconditions

- The approval unit's lifecycle is set to `approved`.
- An `approval` trace is written carrying per-item content fingerprints (sha256) for every IDed item in the unit.
- `status` is recomputed; downstream items dependent on the newly approved basis are reclassified (typically transitioning to `uncovered` or `stale`).

## Constraints

- Approval is per-tier (the approval unit). Affected artifacts within the tier advance together. Cannot approve a single artifact in isolation.
- Approval requires all-clean structural + zero-blocking-semantic findings. False positives in advisory findings don't block.
- Approval traces are append-only and never regenerated. They are the single source of truth for "what was approved when by whom."
- Auto-advance is bounded by mode rules: e.g. in pm mode, system-specs auto-advances when its eval is clean and no breaking semantic finding is detected. Auto-advance never happens for user-owned tiers.
- Direct edits to `approved` artifacts (outside this task) auto-reopen them to `draft` per lifecycle drift rules.

## Invariants

- Existing approval traces are never modified or deleted (append-only).
- Approval is rejected if structural eval has any blocking finding (engine raises `ApprovalBlocked`).
- The artifact's content hash at approval time matches the `items` map in the written trace.

## Validation

- Pre-approval: structural + semantic eval (run as part of step 1).
- Post-approval: re-run structural eval after status flips, to catch any inconsistency introduced by the approval itself (rare but possible).
- Mechanical runners not invoked at approval time (they run at generate / code-sync time).

## Failure modes

- Blocking findings: abort, surface "review first."
- Hash computation fails (non-deterministic content): surface error; user must address (typically a frontmatter formatting issue).
- Auto-advance trigger fires but the next tier has its own findings: surface findings + halt auto-advance; user resolves.
- Concurrent edit during approval (artifact mtime changes between hash and write): abort with "concurrent edit detected; re-run approve."

<!-- task-template-version: 0.3.0 -->
````

### `tasks/eval.md`

````template:tasks/eval.md
<!--
VibeLoom task template: eval
Operation: eval
Invoked by: SKILL.md when user runs `/vibeloom eval [--target <tier>]` or as part of generate / approve preconditions
-->

# Task: eval

## Purpose

Read-only validation of a target against approved upstream truth across the verification ladder. Produces findings; modifies nothing.

## Inputs

- `--target` (optional): tier or specific scope to eval (e.g. `intent-specs`, `product-specs`, `web/search`). Default: full repo.
- Approved basis via `.vibeloom/traces/approvals.jsonl`; full modes also use `.vibeloom/cache/contract-graph.json`.
- Validation registry at validation-registry.md.
- Current project mode (`vibe | pm | dev | ux | expert`).

## Preconditions

- Full modes: `.vibeloom/cache/contract-graph.json` exists or can be rebuilt.
- Vibe: compact artifacts exist; private scaffolding may be rebuilt if the engine uses it, but no public graph is required.
- For mechanical-tier checks: validation runners in registry are executable.
- For heuristic-tier checks: agent has access to the items in scope.

## Steps

1. Build/refresh the structural basis:
   - Full modes: Contract Graph via engine `parse + graph`.
   - Vibe: compact artifact inventory from `intent.md`, `defaults.md`, `system.md`, and any private scaffolding the engine chooses to derive.
2. **Decidable tier (engine, structural)**: run the engine's structural checks for the target. Full modes use the canonical check inventory in [methodology §14.3](../../vibeloom-methodology.md#143-verification-ladder), including `derives_from` validation per implementation §5.1 and methodology §8.2. Vibe runs compact checks only: required visible files, parseable frontmatter/sections, approval hash consistency, validation registry presence, and upgrade recommendation heuristics.
3. **Mechanical tier (engine + runners)**: invoke validation runners declared in `validation-registry.md` that are in scope for the target. Aggregate pass/fail per runner.
4. **Heuristic tier (agent, semantic)**: agent runs the heuristic dimensions defined in [`references/eval.md`](../skill/references/eval.md) (canonical dimension list in methodology §14.2) against items in scope.
5. Categorize findings: `blocking` (must address before approval) or `advisory` (worth noting, not gating).
6. Emit an `eval` trace per invocation: target, checks_run, findings (each with finding_id, severity, item_id, message), cost.
7. Return aggregated findings to caller (or surface to user if invoked directly).

## Output

- Eval trace in `.vibeloom/traces/evals.jsonl`.
- Findings list (blocking + advisory).
- Non-zero exit code if any blocking findings.

## Postconditions

- Findings (blocking + advisory) are returned; categorized per implementation §14 (structural / semantic).
- One `eval` trace is written per invocation, recording `checks_run`, per-finding `item_id`, and severity.
- No artifact, context, or code file is modified.

## Constraints

- Read-only — modifies no artifacts and no traces other than appending to evals.jsonl.
- False positives beat false negatives: prefer over-marking to under-marking.
- Heuristic findings are agent-judged; ambiguous cases escalate as blocking by default.
- Mechanical runners run with their declared scope; runners outside the target are skipped.

## Invariants

- Read-only operation: zero writes to the working tree.
- Eval is target-bounded; it never inspects downstream of the target.

## Validation

- N/A (eval is itself the validation).

## Failure modes

- Engine parse fails: surface parse errors first; halt before structural checks.
- A mechanical runner times out: surface as advisory; the rest of the runners proceed.
- Heuristic eval cost exceeds budget: surface advisory ("eval truncated due to context budget"); the rest of decidable + mechanical results stand.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/generate-code-component.md`

````template:tasks/generate-code-component.md
<!--
VibeLoom task template: generate-code-component
Operation: generate (code generation; full modes use one leaf task per affected component)
Invoked by: SKILL.md as a subagent task within a wave; in full modes, one invocation per affected component; in vibe, only after the orchestrator derives private internal scopes from compact artifacts
-->

# Task: generate-code-component

## Purpose

Generate or repair code with bounded write scope, layer-aware codegen patterns, and validation. In full modes the scope is a public component. In vibe the scope may be a private orchestrator-derived slice; it must not force the user to curate component specs.

## Inputs

- `task_id`, `run_id`, `wave_id`, `template_version` (from subagent task header — see canonical implementation §13.4)
- `scope`: the target component or private vibe slice, e.g. `web/search` or `notes-service/notes`
- `component_id`: CMP-#### of the target in full modes; optional/private in vibe
- `container_id`, `layer`: from container.md frontmatter in full modes; inferred private scaffolding in vibe
- `load_set_refs`: items the subagent receives in its load (baseline + owned scope + foreign IF slices + relevant context)
- `foreign_refs`: IF-#### contracts of dependencies (read-only — never used to expand write scope)
- `allowed_read_paths`: globs the subagent may read
- `allowed_write_paths`: globs the subagent may write (always disjoint from other subagents in the same wave)
- `validation_contract`: list of runner_ids the orchestrator will invoke against the subagent's output
- `result_shape_id`: expected shape of the subagent's return (for orchestrator validation)
- Approved upstream: full contract for the component's lineage (CAP → FR → STORY → BC → CMP) in full modes; approved compact intent + inferred flat system in vibe.
- Tech stack inherited from defaults.md (per layer).

## Preconditions

- Full modes: `system-specs` is `approved` for the target component.
- Full modes: `context` is generated and current for the component.
- Full modes: container's `layer` field is set.
- Vibe: intent is approved; compact `system.md` and root assistant guidance exist or can be regenerated.
- Validation registry declares the runners listed in `validation_contract`.

## Steps

1. Load the load set (baseline + owned scope + foreign IF slices + relevant context).
2. Read the container's `layer` to determine the codegen pattern:
   - **presentation**: generate UI components, pages, routes, design-token usage. Bundle target per Tech Stack.
   - **application**: generate API surfaces, request/response handlers, orchestration logic. Auth middleware per Tech Stack.
   - **domain**: generate aggregate roots, entity classes, value objects, domain events, repository interfaces. Persistence pattern per Tech Stack.
   - **infrastructure**: generate IaC declarations (Terraform / Pulumi / CDK / native). NOT application code.
3. For each owned interface (IF-####) in the component:
   - Generate the implementation respecting the contract (signature, behavior described in BEH-####).
   - Emit code in the appropriate language per Tech Stack.
4. For each owned behavior (BEH-####):
   - Generate at least one test (unit or integration, per validation registry runners).
   - Tests are evidence of contract conformance, not contract themselves.
5. For each consumed dependency (DEP-####):
   - Reference the foreign component's IF-#### contract from `foreign_refs`. Don't re-implement the foreign contract.
6. Late-fetch ONCE if a narrow missing context slice is discovered (e.g. an IF detail not in the load set). Cap is one re-invocation per task.
7. Write the patch to the staging directory at `.vibeloom/runs/<RUN-ID>/tasks/<TASK-ID>/`.
8. Run all validation runners declared in `validation_contract` inside the staging dir.
9. Return a result conforming to `result_shape_id`: patch summary, file list, validation summary, findings.

## Output

- Patch in `.vibeloom/runs/<RUN-ID>/tasks/<TASK-ID>/patch.diff`.
- Files in `.vibeloom/runs/<RUN-ID>/tasks/<TASK-ID>/files/`.
- Summary in `.vibeloom/runs/<RUN-ID>/tasks/<TASK-ID>/summary.yaml`.
- Validation results.
- Late-fetch event recorded in the parent generation trace if used.

## Postconditions

- Code files exist within the component's `owned_paths` and pass the validation runners declared in `validation-registry.md`.
- Full modes: a `code-sync` trace is written linking generated files (and hashes) to component contract IDs (`CMP`, `IF`, `BEH`, `VIEW`, etc.).
- Vibe: generation provenance is recorded; code-sync-like evidence may be private runtime scaffolding and must not require public component IDs.
- Generation trace written; on validator failure, a generation trace records FAILED and the patch is not applied to the working tree.

## Constraints

- Writes are STRICTLY confined to `allowed_write_paths`. Writing outside is a hard violation.
- Reads are confined to `allowed_read_paths`. Reading outside is a soft violation surfaced as a finding.
- Late-fetch is bounded to ONE re-invocation per task. Exceeding the cap returns a failure result.
- The codegen pattern matches the layer (e.g. don't generate database schemas in a presentation container).
- Tech stack choices from defaults are binding. Don't substitute (e.g. don't generate Vue when defaults specify React).
- Any decision the subagent makes that constrains future generation MUST be emitted as a `decision` trace entry with `record_type: ADR` (or appropriate other) and `affects: [item_ids]`.

## Invariants

- Writes are confined to the component's `owned_paths` (enforced by `execute_plan` per implementation §13.3).
- No contract or context artifact is modified by this task.
- A failed task in a wave does not block successful peers (per execute_plan's per-task atomicity).

## Validation

- All runners in `validation_contract` MUST pass before patch is applied to working tree.
- Layer-aware structural checks: no presentation→domain calls (must go through application).
- Patch is rejected (subagent task fails) if any blocking validation fails.
- Cross-scope consistency check by orchestrator after the wave completes: do IFs match across scopes? do dependencies resolve? are BDD scenarios still satisfied?

## Failure modes

- Validation runner fails: patch is rejected; subagent surfaces finding; orchestrator reopens the component for another pass with the failure as additional input.
- Write outside allowed_write_paths: subagent surfaces error; task fails immediately; orchestrator escalates to user.
- Late-fetch limit exceeded: subagent fails the task with a "context insufficient" finding for human review.
- Stack constraints violated: subagent fails; orchestrator reopens with explicit stack reminder.
- Foreign IF contract changes during the run (concurrent change): wave fails; orchestrator restarts wave from current basis.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/generate-context.md`

````template:tasks/generate-context.md
<!--
VibeLoom task template: generate-context
Operation: generate
Invoked by: SKILL.md when user runs `/vibeloom generate context` or as part of a top-down generation cascade after system-specs is approved
-->

# Task: generate-context

## Purpose

Generate or repair context artifacts from approved contract. Full modes generate root + per-container + per-component AGENTS.md / CLAUDE.md plus per-component BDD scenarios. Vibe generates only root assistant guidance from compact artifacts. Context is regenerable from approved contract — never approved as its own tier.

## Inputs

- `target_tier`: `context` (fixed)
- `mode`: pm / dev / ux / expert (any full mode; in vibe, only root AGENTS.md is generated, no BDD)
- `affected_ids`: optional. Item IDs that triggered the regeneration.
- Approved upstream: full contract in full modes; compact intent/defaults/system in vibe.
- Mode-specific assistant slugs (e.g. `claude`, `codex`) for which to generate config files.

## Preconditions

- All contract tiers in scope for the mode are `approved`.
- Full modes: working directory contains the materialized container/component directory tree.
- Vibe: root project directory exists; no public container/component tree is required.

## Steps

1. Load approved contract:
   - Full modes: via engine `parse + graph`.
   - Vibe: from compact artifacts; private scaffolding may help generation but is not user-facing contract.
2. For each (assistant slug × scope), generate the corresponding config artifact:
   - **root**: `AGENTS.md`, `CLAUDE.md` (one per assistant) at repo root. Includes governance summary, mode, contract inventory pointers, current run state.
   - **per-container**: `<container>/AGENTS.md`, `<container>/CLAUDE.md`. Includes container layer + deployment target + resident BCs (domain only) + component inventory + dependency edges.
   - **per-component**: `<container>/<component>/AGENTS.md`, `<container>/<component>/CLAUDE.md`. Includes component IFs / DEPs / BEHs / NOTEs + ownership boundary + load-set hints.
3. For each component (full modes only — not vibe), generate per-behavior `<container>/<component>/context/bdd/BEH-####.md` Gherkin scenarios:
   - SCN-#### derives from ACC, INV, BEH, STORY.
   - Non-executable Gherkin (Given / When / Then) — runnable later via the contract-conformance or bdd validation runners.
4. Run structural checks:
   - Full modes: engine `parse + eval --target context` (frontmatter validity, derives_from references resolve to approved upstream).
   - Vibe: root assistant guidance references compact intent/defaults/system and stays concise.
5. Run heuristic semantic eval for context-sufficiency (does each component have enough context for a subagent to act in scope without late-fetching?).
6. Emit a `generation` trace recording basis_ids, output_artifact_ids (the config + bdd files generated).

## Output

- AGENTS.md, CLAUDE.md at root + per container + per component.
- BDD scenario files in <container>/<component>/context/bdd/.
- New trace entry in .vibeloom/traces/generations.jsonl.
- Derived runtime state updated as appropriate for the mode.
- Findings.

## Postconditions

- Scope-appropriate `AGENTS.md` / `CLAUDE.md` files exist for the targeted scopes (root, container, component).
- Full modes: BDD scenarios materialized as `BDD-####-<slug>.md` files under `<container>/<component>/context/bdd/` for relevant components.
- Vibe: no BDD files are generated.
- Generation trace written.

## Constraints

- Context is NOT approved like contract. The fix path for bad context is to amend the upstream contract and regenerate. Don't introduce content that isn't traceable to approved contract.
- Per-scope configs reference contract item IDs but don't restate contract content (avoid duplication).
- Decision context (load-bearing decisions) is a queried view over decision traces, not a duplicated section in config files. Configs link to the live query (`vibeloom decisions list --load-bearing --affecting <scope-id>`).
- BDD scenarios are generated only in full modes. Vibe mode skips BDD entirely.

## Invariants

- Contract artifacts (intent/product/ux/system) are not modified.
- Context artifacts carry no `status` or `approval_unit` — no approval gate applies.

## Validation

- Structural eval must pass.
- Semantic eval includes context sufficiency check ("can a subagent act in scope CMP-0012 from this load set alone, without late-fetching?").
- Mechanical runners not invoked at this tier (BDD scenarios are runnable via contract-conformance or bdd runner once code exists).

## Failure modes

- Missing approved contract: abort, surface "approve all contract tiers in scope first."
- Per-component context too large (exceeds practical token budget): surface advisory; consider decomposing the component.
- BDD generation produces redundant or contradictory scenarios: surface as findings; user resolves via review.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/generate-intent-specs.md`

````template:tasks/generate-intent-specs.md
<!--
VibeLoom task template: generate-intent-specs
Operation: generate
Invoked by: SKILL.md when user runs `/vibeloom generate intent-specs` or as part of a top-down generation cascade
-->

# Task: generate-intent-specs

## Purpose

Regenerate or repair `intent-specs` (intent.md + defaults.md) from user intent prose, the existing approved tier above (none — intent is the root), and any previously-stale items.

## Inputs

- `target_tier`: `intent-specs` (fixed)
- `mode`: from current project state (vibe / pm / dev / ux / expert)
- `affected_ids`: optional. List of CAP/CST/DEF item IDs that triggered the regeneration. If empty, regenerate the whole tier.
- User intent prose: from prior `init` invocation or current `intent.md` content.
- Previously-approved approval trace (if any) — used to detect what's changed.

## Preconditions

- Working directory contains `intent.md` (possibly empty / placeholder).
- For repair (non-empty `affected_ids`): the tier was previously approved at least once.

## Steps

1. Load existing `intent.md` content if present.
2. Run engine `parse intent.md` → extract current CAP-####, CST-####, DEF-#### items.
3. Compare against previous approval trace (if exists) to identify drift class:
   - direct edit (artifact mtime newer than approval; reopen to draft)
   - structural drift (no upstream — this is the root tier — so structural drift here is impossible by definition)
4. Generate or repair items:
   - For new project (no prior trace): extract CAP from prose using "what user-facing outcome can the user achieve?" pattern.
   - For repair: regenerate only the affected items, preserving unaffected items verbatim.
5. Generate `defaults.md`:
   - Carry every CST that's repo-wide-and-always-on as a DEF-####.
   - Populate Tech Stack section per layer if user prose contains stack hints; otherwise leave empty (signals "agent decides").
   - Populate Quality guardrails from constraints about testing / coverage / SLAs.
6. Run engine `parse + eval --target intent-specs` for structural checks.
7. Run heuristic semantic eval (faithful representation, naming consistency).
8. Emit a `generation` trace recording basis_ids (none — root tier), output_artifact_ids (`intent`, `defaults`), output_item_ids (the CAP/CST/DEF generated).

## Output

- `intent.md` and `defaults.md` updated (status: draft).
- New trace entry in `.vibeloom/traces/generations.jsonl`.
- `.vibeloom/cache/contract-graph.json` updated.
- Findings surfaced (structural + semantic).

## Postconditions

- `intent.md` and `defaults.md` exist as `draft`.
- Every IDed `CAP`/`CST`/`DEF` carries the registry-allocated final ID.
- Structural eval on intent-specs passes (lifecycle, required fields, ID validity).
- Generation trace written with `basis_ids: []` (intent is the root tier) and the produced item IDs.

## Constraints

- Intent is the root tier — items here have empty `derives_from`.
- Free prose is allowed; only items that downstream tiers must reference need IDs.
- Tech Stack fields in defaults: empty fields signal "agent decides reasonably given other constraints"; filled fields are binding.
- Don't fabricate capabilities not implied by the user's intent prose.

## Invariants

- No upstream basis exists for intent-specs (root tier); the orchestrator does not request derivation citations from this task.
- Pre-existing `intent.md`/`defaults.md` are reconciled per `reconcile`, not silently overwritten.

## Validation

- Structural eval (decidable tier of verification ladder) must pass: lifecycle consistency, required fields, ID validity, reference integrity.
- Semantic eval (heuristic tier): faithful representation, naming consistency, capability gaps.
- Mechanical runners not invoked at the intent-specs tier (no code yet).

## Failure modes

- Insufficient intent prose: surface "intent prose too thin to extract capabilities"; ask user to expand.
- Contradictions between intent prose and existing CSTs: surface conflict finding; user resolves via `review intent-specs`.
- Tech Stack inference ambiguity (e.g. multiple framework hints): leave field empty + surface advisory.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/generate-product-specs-from-ux.md`

````template:tasks/generate-product-specs-from-ux.md
<!--
VibeLoom task template: generate-product-specs-from-ux
Operation: generate (variant)
Invoked by: SKILL.md when in `ux` mode and user runs `/vibeloom generate product-specs --from ux`
-->

# Task: generate-product-specs-from-ux

## Purpose

Designer-led generation: derive product-specs (prd + usm + dm) from approved intent-specs **plus approved ux-specs evidence**. Mockups can drive product-spec generation directly. The generated product-specs go through PM peer-review before becoming load-bearing.

## Inputs

- `target_tier`: `product-specs` (fixed)
- `mode`: `ux` (this variant runs only in ux mode)
- `affected_ids`: optional. Item IDs that triggered the regeneration.
- Approved upstream: intent.md (CAP, CST), defaults.md (DEF), **ux.md (VIEW, INT, UXC, MOCK)** — the ux-specs evidence is primary input, not just supplementary.
- Mockup files in ux-specs/mockups/ — may contain entities, flows, labels, states extracted via vision analysis.
- Previous approval trace for product-specs (if exists).

## Preconditions

- Mode is `ux`.
- intent-specs is `approved`.
- ux-specs is `approved` (the designer has signed off on the ux-specs first).
- Working directory contains placeholder prd.md, usm.md, dm.md.

## Steps

1. Load approved intent + ux-specs items via engine `parse + graph`.
2. Load mockup files referenced by MOCK-#### entries (image content, optionally vision-analyzed for visible entities and labels).
3. Build the load set: CAP, CST, DEF + VIEW, INT, UXC, MOCK + mockup file content.
4. Generate `prd.md` with **ux evidence as primary basis**:
   - OBJ derives from CAP, CST (intent).
   - FR derives from CAP, CST, **VIEW, INT** (ux evidence elevated to first-class basis).
   - NFR derives from CAP, CST, DEF, **UXC** (UX constraints become NFRs).
   - Each FR/NFR cites its ux-evidence backing in a structured `ux_evidence` field for PM review.
5. Generate `usm.md` with mockup-driven story extraction:
   - STORY derives from FR + **VIEW + MOCK** (stories often extracted from observed user surfaces).
   - ACC derives from STORY + **MOCK** (acceptance criteria often visible in mockup states).
   - FLOW derives from FR + **INT** (flows extracted from interaction patterns).
6. Generate `dm.md`:
   - TERM derives from CAP, FR, STORY, **MOCK** (UI labels often reveal ubiquitous language).
   - BC derives from FR, STORY, FLOW (standard).
   - AGG, ENT, VO, INV per standard derivation.
7. Run engine `parse + eval --target product-specs`.
8. Run heuristic semantic eval with **mockup extraction gaps** dimension elevated (e.g. "VIEW-0012 mockup shows a 'recurring' option but no FR captures recurring behavior").
9. Emit `generation` trace recording basis_ids (intent + ux items + MOCKs), output_artifact_ids, output_item_ids, plus `task_template_id: generate-product-specs-from-ux` for audit.
10. Surface a **PM peer-review packet**: each generated item is shown with its ux-evidence backing so the PM can verify the derivation is faithful.

## Output

- prd.md, usm.md, dm.md updated (status: draft, awaiting PM review).
- New trace entry in .vibeloom/traces/generations.jsonl with the from-ux variant flag.
- Contract Graph updated.
- PM peer-review packet (each FR/STORY/TERM with its mockup/ux backing).

## Postconditions

- `prd.md`, `usm.md`, `dm.md` exist as `draft`, derived from approved intent + ux evidence.
- Every IDed item cites either an approved intent item OR an approved ux item OR a mockup reference in `derives_from`.
- Structural eval on product-specs passes.
- Generation trace written with `basis_ids` spanning both intent and ux upstream.

## Constraints

- This task variant is **ux-mode only**. Other modes use the standard `generate-product-specs.md` task.
- Mockups are NOT contract truth until extracted obligations are IDed contract items. Mockups are evidence; product-specs items are the contract.
- PM peer-review is REQUIRED before product-specs becomes load-bearing — even though the designer drives the workflow, the PM still gates.
- ux_evidence field on each generated item enables traceability ("which mockup implied this story?").

## Invariants

- Neither intent-specs nor ux-specs are modified.
- Mockups (`MOCK-####`) remain evidence; they are not promoted to normative items by this task.

## Validation

- Structural eval must pass.
- Semantic eval emphasizes mockup-extraction-gaps dimension (UX-mode-specific concern).
- Mechanical runners not invoked (no code yet).

## Failure modes

- ux-specs not approved: abort, surface "approve ux-specs first (designer flow)."
- Mockup vision analysis fails: degrade gracefully — generate from VIEW/INT/UXC text without mockup content; surface advisory.
- PM peer-review is rejected: items revert to draft; surface diff between PM expectations and ux-derived items; user (designer + PM) reconcile.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/generate-product-specs.md`

````template:tasks/generate-product-specs.md
<!--
VibeLoom task template: generate-product-specs
Operation: generate
Invoked by: SKILL.md when user runs `/vibeloom generate product-specs` or as part of a top-down generation cascade after `intent-specs` approval
-->

# Task: generate-product-specs

## Purpose

Generate or repair `product-specs` (prd.md + usm.md + dm.md) from approved intent-specs and any approved ux-specs (in pm or expert mode).

## Inputs

- `target_tier`: `product-specs` (fixed)
- `mode`: from current project state (must be pm / dev / ux / expert; not vibe)
- `affected_ids`: optional. Item IDs that triggered the regeneration.
- Approved upstream: intent.md (CAP, CST), defaults.md (DEF), ux-specs/ux.md (VIEW, INT, UXC, MOCK) if present and approved.
- Previous approval trace for product-specs (if exists).

## Preconditions

- intent-specs is `approved` (approval trace exists in .vibeloom/traces/approvals.jsonl).
- Mode is pm / dev / ux / expert.
- Working directory contains placeholder prd.md, usm.md, dm.md (created by init).

## Steps

1. Load approved upstream items via engine `parse + graph`.
2. Build the load set: all CAP-####, CST-####, DEF-#### from intent-specs; if ux-specs is approved and mode is pm/expert (PM-led with UX review), also load VIEW/INT/UXC/MOCK as evidence.
3. Generate `prd.md`:
   - OBJ-#### derives from CAP, CST.
   - KR-#### derives from OBJ.
   - MET-#### derives from KR.
   - FR-#### derives from CAP, CST.
   - NFR-#### derives from CAP, CST, DEF.
   - EARS-style normalized statements attached as structured field on FR/NFR.
4. Generate `usm.md`:
   - EPIC-#### derives from FR.
   - FLOW-#### derives from FR.
   - STORY-#### derives from FR, FLOW.
   - ACC-#### derives from STORY (EARS-style attached).
   - MS-#### derives from EPIC.
5. Generate `dm.md`:
   - TERM-#### derives from CAP, FR, STORY (ubiquitous language).
   - BC-#### derives from FR, STORY, FLOW, TERM.
   - AGG-#### derives from BC.
   - ENT-#### derives from AGG.
   - VO-#### derives from AGG.
   - INV-#### derives from BC, AGG, ENT.
6. Run engine `parse + eval --target product-specs` for structural checks.
7. Run heuristic semantic eval (faithful representation, naming consistency, implicit dependencies, capability gaps, UX/product mismatch if ux-specs in scope).
8. Emit a `generation` trace recording basis_ids (the upstream items consumed), output_artifact_ids (prd, usm, dm), output_item_ids.
9. Surface findings; recommend `review product-specs` if non-blocking advisory or `approve product-specs` if eval is clean.

## Output

- prd.md, usm.md, dm.md updated (status: draft).
- New trace entry in .vibeloom/traces/generations.jsonl.
- Contract Graph updated.
- Findings.

## Postconditions

- `prd.md`, `usm.md`, `dm.md` exist as `draft`.
- Every IDed item cites at least one approved upstream item in `derives_from` per implementation §5.1 derivation rules.
- Structural eval on product-specs passes.
- Generation trace written with `basis_ids: [approved CAP/CST/DEF IDs]` and produced item IDs.

## Constraints

- Every product-specs item MUST have `derives_from` referencing approved upstream items.
- Domain model (dm) is the semantic anchor: bounded contexts here drive component layout in system-specs downstream.
- Don't introduce capabilities not in intent — this would be drift toward intent (forbidden; intent is root authority).
- Preserve approved items verbatim if `affected_ids` is non-empty (only regenerate stale subset).

## Invariants

- Intent-specs are not modified (read-only basis).
- Bounded contexts (`BC-####`) are only declared in `dm.md`; their hosting in domain-layer components is established during `generate-system-specs`, not here.

## Validation

- Structural eval must pass before approval gate.
- Semantic eval surfaces blocking findings (e.g. "FR-0019 narrows CAP-0003") that must be reviewed before approval.

## Failure modes

- Missing approved upstream: abort, surface "approve intent-specs first."
- Contradictions between FR and CAP: surface as semantic blocking finding.
- BC inferred but no clear aggregate root: surface advisory; user adds during review.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/generate-system-specs.md`

````template:tasks/generate-system-specs.md
<!--
VibeLoom task template: generate-system-specs
Operation: generate
Invoked by: SKILL.md when user runs `/vibeloom generate system-specs` or as part of a top-down generation cascade after product-specs (and ux-specs if present) are approved
-->

# Task: generate-system-specs

## Purpose

Generate or repair `system-specs` (system.md + containers.md + per-container container.md + per-component component.md) from approved product-specs (and ux-specs if present), with layer-aware container synthesis.

## Inputs

- `target_tier`: `system-specs` (fixed)
- `mode`: pm / dev / ux / expert (any full mode)
- `affected_ids`: optional. Item IDs that triggered the regeneration.
- Approved upstream: intent.md, defaults.md (Tech Stack section is critical here), prd.md, usm.md, dm.md, ux.md (if approved).
- Previous approval trace for system-specs (if exists).

## Preconditions

- intent-specs, product-specs are `approved`.
- ux-specs is `approved` (if mode is pm / dev / expert with ux-specs in scope).
- Defaults Tech Stack section has at least the Domain stack populated (decomposition: monolith vs multi-service).
- Working directory contains placeholder system.md and containers.md.

## Steps

1. Load approved upstream items via engine `parse + graph`.
2. Read defaults Tech Stack to determine:
   - Presentation stack → presentation container(s) shape and deployment target.
   - Application stack → application container(s) shape.
   - Domain stack → number of domain containers (monolith = 1; multi-service = 1 per BC).
   - Infrastructure stack → infrastructure container shape.
3. Generate `system.md`:
   - EXT-#### derives from FR, NFR, CAP (external actors and systems).
   - TB-#### derives from NFR (trust boundaries).
   - SNFR-#### derives from NFR, CST, DEF (system-wide non-functional requirements).
4. Generate `containers.md`:
   - CONT-#### entries per layer:
     - One presentation container (e.g. "web-app") unless micro-frontends explicit.
     - One or more application containers (one per UI surface served, e.g. "web-api", "mobile-api", "admin-api").
     - Domain containers per the decomposition choice (monolith → one container hosting all BCs; multi-service → one container per BC).
     - One infrastructure container ("infra") declaring consumed platform services.
   - Each CONT carries its `layer` field.
   - Inter-container communication paths recorded as structured content.
5. Generate per-container `<container>/container.md` files:
   - Required `layer` field in frontmatter.
   - Deployment target section filled per layer + platform choice from defaults.
   - Resident bounded contexts (DOMAIN ONLY).
   - Component inventory.
   - Local dependency edges.
   - Cross-layer interactions (prose; structural in v0.4).
6. Generate per-component `<container>/<component>/component.md` files:
   - `bounded_context` field populated for domain components; null for others.
   - IF-#### per provided interface (derives from FR, STORY, ACC).
   - DEP-#### per consumed dependency.
   - BEH-#### per local behavior contract (derives from STORY, ACC, INV).
   - NOTE-#### per local concern.
7. Run engine `parse + eval --target system-specs` for structural checks (including layer-aware constraints: `bounded_context` populated only for domain-layer components, exactly one per component).
8. Run heuristic semantic eval (faithful representation, naming consistency, implicit dependencies, capability gaps, target-platform mismatch — flags if Tech Stack and inferred container layer don't agree).
9. Emit a `generation` trace recording basis_ids, output_artifact_ids (system, containers, all per-container + per-component files), output_item_ids.

## Output

- system.md, containers.md updated (status: draft).
- Per-container container.md and per-component component.md files created/updated.
- New trace entry in .vibeloom/traces/generations.jsonl.
- Contract Graph updated.
- Findings.

## Postconditions

- `system.md`, `containers.md`, per-container `container.md`, per-component `component.md` exist as `draft`.
- Every container carries the required `layer` field (`presentation` | `application` | `domain` | `infrastructure`).
- Every domain-layer component carries a non-empty `bounded_context`; non-domain components carry empty/null.
- Structural eval on system-specs passes.
- Generation trace written.

## Constraints

- Every CONT carries `layer`. Every CMP inherits its container's layer.
- Bounded contexts ONLY in domain-layer containers. Structural eval enforces.
- Domain decomposition follows defaults (monolith: all BCs in one container; multi-service: one per BC). Conflicts surface as semantic finding.
- Deployment target on each container.md must be consistent with infrastructure stack in defaults.
- Don't fabricate components without traceable basis — every CMP derives from at least its container plus (for domain) at least one BC.

## Invariants

- Bounded contexts (`BC-####`) are hosted only by `domain`-layer components (methodology §6.5).
- Each component belongs to exactly one container; no component spans containers.
- Product-specs are not modified.

## Validation

- Structural eval must pass: layer-aware constraints, ID validity, reference integrity, DAG validity, ownership rules, context sufficiency.
- Every IDed item cites at least one approved upstream item in `derives_from` per implementation §5.1 derivation rules.
- Mechanical runners not invoked at the system-specs tier (no code yet).
- Semantic eval surfaces target-platform mismatches and capability gaps.

## Failure modes

- Missing approved upstream: abort, surface "approve product-specs (and ux-specs if applicable) first."
- Defaults Tech Stack incomplete (e.g. no domain decomposition choice): surface advisory; ask user to fill Tech Stack before generating system-specs.
- Bounded context too large to fit in one component: surface decomposition advisory; user splits BC during review.
- Inferred deployment target conflicts with declared platform: surface as semantic finding.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/generate-ux-specs.md`

````template:tasks/generate-ux-specs.md
<!--
VibeLoom task template: generate-ux-specs
Operation: generate
Invoked by: SKILL.md when user runs `/vibeloom generate ux-specs` or as part of a top-down generation cascade in pm/dev/expert mode where ux-specs is generated as peer review surface
-->

# Task: generate-ux-specs

## Purpose

Generate or repair `ux-specs` (ux.md + mockup index) from approved intent-specs and any approved product-specs (in pm or expert mode). Designer reviews the generated ux-specs as a peer review surface.

## Inputs

- `target_tier`: `ux-specs` (fixed)
- `mode`: `pm`, `dev`, or `expert` (in `ux` mode, ux-specs is user-authored, not generated; this task is for the peer-review-of-ux scenario)
- `affected_ids`: optional. Item IDs that triggered the regeneration.
- Approved upstream: intent.md (CAP, CST), defaults.md (DEF), prd.md / usm.md (FR, STORY, ACC, FLOW) if approved.
- Existing mockup files in ux-specs/mockups/ (optional — designer may have dropped some in for reference even if not driving generation).
- Previous approval trace for ux-specs (if exists).

## Preconditions

- intent-specs is `approved`.
- Mode is pm / dev / expert (in `ux` mode, this task is not invoked; the designer authors directly).
- Working directory contains placeholder ux.md + ux-specs/mockups/ folder.

## Steps

1. Load approved upstream items via engine `parse + graph`.
2. Build the load set: CAP, CST, DEF + FR, STORY, ACC, FLOW (if product-specs approved).
3. Generate `ux.md`:
   - VIEW-#### derives from CAP, FR, STORY (one VIEW per major UI surface implied by the stories).
   - INT-#### derives from FLOW, STORY, VIEW (interaction patterns implied by user flows).
   - UXC-#### derives from CST, NFR (UX constraints elevated from non-functional requirements: accessibility, responsiveness, motion, dark-mode, i18n).
   - MOCK-#### entries reference any pre-existing mockup files; do NOT fabricate mockup files.
4. Run engine `parse + eval --target ux-specs` for structural checks.
5. Run heuristic semantic eval (faithful representation, naming consistency, UX/product mismatch, mockup extraction gaps).
6. Emit a `generation` trace recording basis_ids, output_artifact_ids (`ux`), output_item_ids.
7. Surface findings; recommend designer review the generated ux-specs as a peer-review packet (the designer is consulted; ux-specs is ultimately approved by them).

## Output

- ux.md updated (status: draft).
- New trace entry in .vibeloom/traces/generations.jsonl.
- Contract Graph updated.
- Designer peer-review packet.

## Postconditions

- `ux.md` exists as `draft` with `VIEW`/`INT`/`UXC`/`MOCK` items.
- Every IDed item cites an approved upstream item (intent in pm/ux mode; intent + product in peer mode) in `derives_from` per implementation §5.1 derivation rules.
- Structural eval on ux-specs passes.
- Generation trace written.

## Constraints

- Generated VIEWs must trace back to approved CAP/FR/STORY. Don't fabricate UI surfaces not implied by upstream.
- Mockup files are NEVER auto-generated. MOCK-#### entries reference designer-supplied files only.
- UXCs that conflict with NFRs in product-specs surface as semantic findings.
- In `ux` mode, this task is NOT invoked — the designer authors ux.md directly via `init` materialization.

## Invariants

- Mockups under `ux-specs/mockups/` stay as evidence; they do not become normative items without IDed conversion to `VIEW`/`INT`/etc.
- Upstream tiers are not modified.

## Validation

- Structural eval must pass.
- Semantic eval surfaces UX/product mismatch (e.g. "VIEW-0012 implies a multi-step wizard but FLOW-0009 is single-step").

## Failure modes

- Missing approved upstream: abort, surface "approve intent-specs (and product-specs if applicable) first."
- No mockup files but stories imply heavy visual content: surface advisory ("consider adding designer mockups to ux-specs/mockups/ for richer ux-specs").
- Designer rejects peer-review: items revert to draft; user runs `reconcile ux-specs` to negotiate direction.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/import.md`

````template:tasks/import.md
<!--
VibeLoom task template: import
Operation: import
Invoked by: SKILL.md when user runs `/vibeloom import --mode <mode>`
-->

# Task: import

## Purpose

Bootstrap from existing code. Produce candidate contract artifacts in `draft` with confidence scores and evidence pointers. Full modes import into the full tiered contract; vibe imports into compact intent/defaults/system and keeps deeper structure private unless the user upgrades.

## Inputs

- `--mode`: required. Target mode for the imported project.
- Existing repo: filesystem under `./` containing source code, tests, configs, mockups, decision docs (any combination).
- Optional `--scan-paths`: limit scan to specified paths.
- Optional `--exclude-paths`: paths to exclude (defaults: `node_modules`, `.git`, `dist`, `build`, common build dirs).

## Preconditions

- Working directory is writable.
- `./intent.md` does NOT exist (or `--force` set with explicit confirmation).
- Existing code surface large enough to make import worthwhile (heuristic: under ~500 LOC, recommend prompt-only generation instead).

## Steps

1. Codebase scan: enumerate languages, frameworks, dependencies, test files, config files.
2. Aggregate evidence: per-language entry points, declared interfaces, dependency graph, observed deployment hints (Dockerfile, package.json scripts, CI configs).
3. Per-tier candidate inference:
   - In vibe: infer compact `intent.md`, `defaults.md`, and flat `system.md`; deeper product/system partitions may be kept as private scaffolding for confidence and upgrade, not as user-reviewed artifacts.
   - In full modes, infer in tier order:
     a. **intent-specs**: infer capabilities (CAP) from observable user-facing functionality, constraints (CST) from configs and dependencies. Tech stack inferred from frameworks → populates Tech Stack section in `defaults.md`.
     b. **product-specs**: infer FRs from API endpoints + user flows; STORYs from observed user journeys; BCs from cohesive code modules.
     c. **ux-specs** (if presentation code present): infer VIEWs from page/route definitions, INTs from event handlers, UXCs from i18n + accessibility configs.
     d. **system-specs**: infer CONT from deployment topology, CMP from cohesive code modules, IF from public API surfaces, DEP from import graph, BEH from test descriptions, `layer` from heuristic (presentation = frontend bundle / static; application = API/server; domain = service workload; infrastructure = IaC).
4. Confidence scoring per candidate (numeric 0–1) and uncertainty list, based on evidence quality (multiple corroborating signals = high; single weak signal = low).
5. Evidence collection per candidate: collect `evidence_refs` (file paths, test paths, config locations) for each candidate item ID. **Do not** add `evidence`/`confidence`/`uncertainty` fields to artifact rows — these live only in the import trace.
6. Draft writing: compact artifacts only in vibe; tier order (intent → product → ux → system) in full modes. Use the standard artifact templates with `derives_from` per the §5.1 derivation rules where public IDs are materialized. Artifact rows stay clean of import-only fields.
7. Emit one `import` trace per invocation carrying both aggregate summary (`evidence_summary`, `candidates_proposed`, `confidence_distribution`) and `per_candidate: {<item_id>: {confidence, evidence_refs, uncertainty}}` — see implementation §8.6 for the schema. Review tooling joins draft items against this map to surface confidence and evidence during top-down approval.
8. Run structural eval appropriate to the mode; surface coverage gaps (uncovered upstream items, dangling references) as findings in full modes and compact-consistency findings in vibe.
9. Surface review packets to the user, top-down (intent first).

## Output

- Draft artifacts at every tier in scope for the target mode (status: `draft`), in the standard artifact-template shape (no import-only fields on rows). In vibe, this means compact artifacts only.
- Trace entry in `.vibeloom/traces/imports.jsonl` with `schema_version: 1.1`, aggregate summary, and `per_candidate` map keyed by allocated item IDs.
- Full modes: `.vibeloom/cache/contract-graph.json` initialized with candidate items + edges. Vibe: optional private scaffolding may be initialized, but no public graph review surface is created.
- Per-tier review packets that join draft items against `per_candidate` so reviewers see confidence and evidence inline.

## Postconditions

- Candidate contract artifacts exist as `draft` in the standard template shape; per-candidate confidence and evidence are queryable from `.vibeloom/traces/imports.jsonl.per_candidate` keyed by item ID.
- One `import` trace written with both aggregate distribution and per-candidate map.
- ID registry initialized; no IDs allocated yet to imported candidates (engine assigns final IDs at approval time).

## Constraints

- Imported items are NOT trusted until reviewed and approved by the user.
- Confidence scoring is an honest metric: agent must NOT inflate confidence to bias approval.
- Evidence pointers MUST cite real source paths (no fabricated references).
- Per-tier order respected: don't surface ux-specs review before intent-specs, etc.
- Layer inference is heuristic; user must confirm `layer` field on each container during review.

## Invariants

- Source code under analysis is read-only; no edits to existing code.
- No contract item produced is `approved` — review and approval remain user-driven, top-down.

## Validation

- Structural eval after each batch (must pass before next batch generates).
- No mechanical runners invoked (existing code already exists; no new code generated yet).
- Heuristic semantic eval per batch surfaces concerns about inference quality (e.g. "FR-0019 has no clear acceptance criterion in observed code").

## Failure modes

- No discoverable code: surface guidance to use `init` instead.
- Mixed-language codebase exceeding agent context: scan in chunks; surface a "scan-only-this-subtree" suggestion.
- Conflicting evidence (e.g. both REST and GraphQL endpoints): emit ambiguity finding; user picks during review.
- Missing test coverage: import proceeds but FRs lacking ACC are flagged as low-confidence.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/init.md`

````template:tasks/init.md
<!--
VibeLoom task template: init
Operation: init
Invoked by: SKILL.md when user runs `/vibeloom init --mode <mode> "<intent prose>"`
-->

# Task: init

## Purpose

Bootstrap an ungoverned repo with a draft `intent-specs` tier in the chosen mode.

## Inputs

- `--mode`: required. One of `vibe | pm | dev | ux | expert`.
- `--upgrade` (optional): if present, upgrade an existing vibe project to a full mode. Vibe → full is one-way.
- Intent prose (positional argument): one-sentence to one-paragraph description of what the project is for.
- Existing repo state: zero or more files at `./` (for upgrade case, includes prior `intent.md`, `defaults.md`, `system.md`, `.vibeloom/traces/`).

## Preconditions

- Working directory is writable.
- For non-upgrade: `./intent.md` does not exist (new project).
- For `--upgrade`: `./intent.md` exists, `./.vibeloom/traces/approvals.jsonl` exists, current mode is `vibe`.

## Steps

1. Validate mode + flags.
2. Materialize `intent.md` from the appropriate template:
   - `vibe`: `templates/artifacts/intent-specs/vibe-intent.md`
   - All other modes: `templates/artifacts/intent-specs/intent.md`
3. Materialize `defaults.md` from `templates/artifacts/intent-specs/defaults.md`. Pre-fill the Tech Stack section with empty fields (the user fills in or the agent infers from intent prose).
4. For `ux` mode: also create empty `ux-specs/mockups/` directory.
5. For full modes (pm/dev/ux/expert): create empty `prd.md`, `usm.md`, `dm.md` (and `ux.md` for ux mode), `system.md`, `containers.md` placeholders to make the structure visible.
6. For full modes (pm/dev/ux/expert): run engine `parse` to extract IDed items from the new `intent.md` and `defaults.md` into the contract-graph cache; then run engine `eval --target intent-specs` for structural checks. For `vibe`: run compact checks over visible artifacts; the engine may derive private scaffolding, but no public graph is exposed.
7. Emit traces recording the init invocation. Full modes record generation plus decision provenance; vibe at minimum records the init decision and may record generation/private-scaffold provenance if produced.
8. Surface findings to user; recommend next operation (`/vibeloom review intent-specs` or `/vibeloom approve intent-specs` if eval is clean).

## Output

- New artifacts: `intent.md`, `defaults.md`, mode-specific placeholders, optional `ux-specs/mockups/`.
- New trace entry in `.vibeloom/traces/generations.jsonl` when generation/scaffolding work is performed.
- Full modes: `.vibeloom/cache/contract-graph.json` updated. Vibe: optional private scaffolding may be updated, but no public graph surface is created.
- Status report emitted; in vibe it remains a one-screen orientation report.

## Postconditions

- Mode is set; selected layout (full or compact per implementation §2) is scaffolded.
- Draft `intent.md` and `defaults.md` exist (or seeded from `--upgrade` source).
- ID registry is initialized at `.vibeloom/state/id-registry.json` with empty next-counters.
- One `decision` trace written with `record_type: general`, `topic: init`, `payload: {mode}`.

## Constraints

- Never overwrite an existing `intent.md` unless `--upgrade` is set.
- The Tech Stack section in `defaults.md` is structured per layer (presentation / application / domain / infrastructure); fields left empty signal "agent decides reasonably."
- For `--upgrade`: preserve prior approval traces; emit a new generation trace with `task_template_id: init-upgrade` for migration audit.

## Invariants

- Only writes to a greenfield repo (`.vibeloom/` did not exist before invocation), unless `--upgrade` is in effect.
- Existing files outside the scaffolded layout are not touched.

## Validation

- Structural eval runs and must pass before recommending approval.
- Mechanical runners are not invoked at init (no code yet).
- Heuristic semantic eval is skipped at init unless intent prose is long enough to warrant it.

## Failure modes

- Existing `intent.md` and not `--upgrade`: surface conflict, abort.
- Mode invalid: surface error, list valid modes.
- Engine parse fails: surface parse error with line numbers, abort before writing further artifacts.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/reconcile.md`

````template:tasks/reconcile.md
<!--
VibeLoom task template: reconcile
Operation: reconcile
Invoked by: SKILL.md when user runs `/vibeloom reconcile <target>` or when the engine detects stale/drift/dangling/uncovered/obsolete scope
-->

# Task: reconcile

## Purpose

Interactive stale/drift loop. Surface conflict cases with item-ID anchors; present fix-direction options; user steers; regenerate or patch affected scopes; eval until clean.

## Inputs

- `<target>`: required. A tier (e.g. `code`) or scope (e.g. `web/search`).
- Current status report from engine `status` (must show stale, drifted, uncovered, dangling, or obsolete items in target).
- Approved upstream truth (the basis to reconcile against).
- Existing downstream content (the artifacts/code that may carry signal worth preserving).

## Preconditions

- Target has items in non-current status (stale, drifted, uncovered, dangling, or obsolete).
- Approved upstream exists and is itself current (otherwise reconcile upstream first — bottom-up reconciliation is forbidden).

## Steps

1. Run `status --target <target>` to get the current set of non-current items.
2. Build a **reconciliation packet** per drift case:
   - Changed item IDs (what shifted upstream).
   - Affected downstream items (the impact set).
   - Detected drift class: stale (upstream changed), lifecycle (approved file edited outside flow), semantic (meaning shifted even when structure passes), dangling (downstream references removed upstream), uncovered (newly approved upstream lacks downstream), obsolete (basis superseded conceptually).
   - Direction options:
     - **preserve_contract** → regenerate downstream from approved upstream truth (downstream content is replaced).
     - **amend_contract** → upstream is amended to match observed downstream behavior (upstream reopens to draft + needs re-approval; downstream stays).
     - **user_defined** → user provides explicit direction (custom patch + custom contract amendment).
   - Recommendation per case (engine + agent suggestion based on heuristics: e.g., "stale on auto-generated boilerplate → preserve_contract; lifecycle drift on hand-edited intent.md → amend_contract").
3. For each drift case, the user picks a direction (or batch-picks for similar cases).
4. Apply chosen direction:
   - preserve_contract → invoke the appropriate `generate-*` task on the affected scope.
   - amend_contract → reopen the upstream artifact to draft; invoke `review` on it; then `approve`; then `generate` downstream.
   - user_defined → apply user-supplied patch + record an explicit decision trace.
5. Re-run eval on affected scopes after each direction is applied.
6. Emit a generation trace per regenerated scope, plus a decision trace per direction chosen (record_type usually ADR for code-level reconciliation; PDR/UDR/IDR per the affected tier).
7. Loop until no non-current items remain (or user explicitly defers some).

## Output

- Affected artifacts updated per chosen directions.
- Generation traces per regenerated scope.
- Decision traces per direction chosen (with record_type and affects).
- Eval trace entries per iteration.
- Status report after — should show all items current (or explicitly deferred).

## Postconditions

- Each affected case has either: (a) a recorded direction with applied resolution, or (b) been marked skipped by the user.
- Each step emitted a `decision` trace (or `general` reconcile-session trace) capturing direction + findings-after summary.
- The remaining-affected set is empty or the user explicitly exited.

## Constraints

- Reconcile is ALWAYS user-initiated. The agent never auto-invokes reconcile.
- Reconcile is the only operation that can amend approved upstream (via amend_contract direction). Other operations either regenerate or patch downstream.
- `user_defined` direction MUST emit a decision trace explaining the reasoning — otherwise the rationale is lost and future reconciliations can't learn from the pattern.
- For obsolete items, the direction options change: archive (mark obsolete=true, leave in trace) vs delete-from-graph (with cascading impact preview).
- Bottom-up reconciliation forbidden — fix upstream-most drift first, work down.

## Invariants

- No reconciliation modifies an `approved` contract item without going through `review` + `approve` first (the `amend_contract` direction routes back through the approval flow).
- Reconcile traces are appended in order; never edited or reordered.
- Reconciliation tasks run as singleton waves (per implementation §13.2 rule 4) — no two reconciliation tasks ever run in parallel within one invocation.

## Validation

- Each direction triggers the appropriate downstream generate / patch task with full validation.
- Cross-scope consistency check after the reconciliation pass completes.

## Failure modes

- User picks `amend_contract` but the upstream amendment introduces new conflicts: cascade as further reconciliation cases.
- All directions for a case rejected by the user: surface "no direction chosen; case remains drifted" and continue with other cases.
- Reconciliation produces oscillation (item flips between stale and current across iterations): detect cycle; surface as "reconciliation loop detected — consider promoting the underlying decision to a load-bearing decision trace."

<!-- task-template-version: 0.3.0 -->
````

### `tasks/review.md`

````template:tasks/review.md
<!--
VibeLoom task template: review
Operation: review
Invoked by: SKILL.md when user runs `/vibeloom review <target>`
-->

# Task: review

## Purpose

Interactive findings loop on a single target. Surface eval findings; propose bounded fixes; user approves, edits, or rejects each; iterate until target is clean. `review` fixes the target only — it does NOT propagate changes downward (that's `generate` after approval).

## Inputs

- `<target>`: required. A specific tier (e.g. `intent-specs`) or scope (e.g. `web/search`).
- Findings from a prior `eval` invocation (or eval is invoked first if findings absent).

## Preconditions

- Target exists.
- Target is in `draft` status. If the target is `approved`, the user must first explicitly reopen it via the orchestrator-policy "reopen-on-edit" flow (an approved target detected as edited is reclassified to `draft` by the engine's lifecycle rules — see implementation §9; reviewing an already-`draft` item is the normal case). The `review` task itself does not mutate `approved` → `draft`.

## Steps

1. Run `eval` on target to surface current findings.
2. Build a **review packet**:
   - Changed item IDs in scope.
   - Upstream basis (the items this target derives from).
   - Findings (blocking and advisory).
   - Proposed bounded fixes (one per finding when possible).
   - Downstream impact preview (which downstream items will become stale if this target changes).
   - Recommendation summary.
   - Evidence and trace pointers.
3. Present the packet to the user as a summary first — counts by severity, total findings, estimated walk-time. Confirm scope: walk all blocking? include advisory? skip any category? The user may re-prioritize before drilling in.
4. Walk findings in priority order (one at a time or batched, per UX preference). For each finding, the user picks:
   - **Accept proposed fix** → apply patch to target.
   - **Edit fix** → user provides their own patch.
   - **Defer** → mark finding as deferred (kept in trace but not blocking this review pass).
   - **Reject (mark advisory→ignored)** → record decision trace explaining why.
5. After each accepted/edited fix, re-run eval on the affected sub-scope.
6. Loop until no blocking findings remain (or user explicitly stops with deferred findings noted).
7. Emit a `generation` trace recording the review patches as a kind of in-place generation.
8. Recommend next operation: `approve <target>` if clean, or `reconcile <target>` if drift was detected during review.

## Output

- Target artifact updated (status: still draft).
- Eval trace entries for each iteration.
- Generation trace entry for the cumulative review patches.
- Decision trace entries for any deferred / ignored findings (record_type=`general` typically).

## Postconditions

- All structural and (where applicable) semantic findings on the target have been surfaced.
- Any user-accepted bounded fixes are applied within the target only.
- The user has either approved (proceed-to-approve / accept) or exited the loop; their decision is recorded.

## Constraints

- `review` fixes the TARGET ONLY. Downstream is not regenerated until `generate` is invoked after approval.
- The review packet is the bounded human review surface — the user should not need to read raw whole artifacts unless they choose to drill down.
- Packet is write-capable: the user can add their own findings, modify recommendations, or note context.
- Don't auto-apply fixes without explicit user accept (codæ principle: agents propose; humans approve).

## Invariants

- The target is not propagated downward — `review` fixes the target in place; downward propagation is `generate`'s job.
- Approved upstream items are not modified by review on a downstream target.

## Validation

- After each fix iteration, structural eval runs immediately.
- Heuristic eval runs once at the end of the review (not per iteration — too costly).
- `review` does NOT invoke mechanical runners on code (review is for contract-tier targets; code-tier review uses `reconcile` instead).

## Failure modes

- Findings are all blocking and proposed fixes are all rejected: surface "review cannot complete; consider `reconcile <target>` to negotiate direction."
- User edits a fix in a way that introduces NEW findings: surface them on the next iteration; loop continues.
- Target has no findings at all: complete immediately; recommend `approve <target>`.

<!-- task-template-version: 0.3.0 -->
````

### `tasks/status.md`

````template:tasks/status.md
<!--
VibeLoom task template: status
Operation: status
Invoked by: SKILL.md when user runs `/vibeloom status` or as preamble to other operations
-->

# Task: status

## Purpose

Read-only report across lifecycle, freshness, coverage, drift, and current mode. Recommends the next operation. Branches on mode: full modes expose graph-backed status; vibe emits a lightweight one-screen "where am I?" report from compact artifacts, traces, and optional private scaffolding.

## Inputs

- (none — operates on current repo state)
- `--target` (optional, full modes only): scope-narrow the report.
- `--verbose` (optional, full modes only): include per-item detail; default is per-artifact summary.

## Preconditions

- Mode is detectable from repo state (presence of compact vs full layout per implementation §2).
- For full modes (`pm`, `dev`, `ux`, `expert`): `.vibeloom/cache/contract-graph.json` exists or can be rebuilt.
- For vibe: compact artifacts exist; private scaffolding may be rebuilt if used.
- For all modes: `.vibeloom/traces/approvals.jsonl` is readable when present (absent ⇒ "no approvals yet — run `/vibeloom init` to start").

## Steps

**Branch on mode.**

### Full modes (`pm`, `dev`, `ux`, `expert`)

1. Build/refresh Contract Graph via engine `parse + graph` (cheap if cache is current).
2. Compute per-item status by category:
   - **current**: synchronized to approved basis; no findings.
   - **stale**: downstream depended on changed approved truth.
   - **uncovered**: approved upstream lacks required downstream realization.
   - **dangling**: downstream references a removed upstream item.
   - **drifted**: semantic mismatch, direct edit, or unvalidated divergence.
   - **obsolete**: upstream basis was superseded conceptually.
3. Compute per-artifact lifecycle (draft / approved).
4. Compute coverage: per upstream item, count of downstream items (uncovered if zero in scope-required tier).
5. Compute trace summary: counts per family in current run window.
6. Compute current mode + per-tier ownership.
7. Aggregate into a status report with recommended next operation.
8. Persist status snapshot to `.vibeloom/cache/status.json`.

### Vibe mode

1. Read `intent.md` content + mtime + content hash.
2. Read tail of `.vibeloom/traces/approvals.jsonl` to find the most recent intent-specs approval (if any) and its approved hash.
3. Compute intent state: `approved (date)` if approved hash matches current content hash; `draft (last-modified date)` if mtime > last-approval timestamp or approved hash mismatch.
4. Read tail of `.vibeloom/traces/generations.jsonl` if present to find the most recent code-generation event for the project.
5. Compute code state: `not yet generated` (no generation trace), `generated against current intent` (last gen basis hash matches current intent hash), or `intent changed since last codegen — regen recommended`.
6. Read `.vibeloom/traces/decisions.jsonl` line count and most recent topic.
7. Optionally consult private scaffolding for complexity and repair signals; do not expose per-item graph/status as the report surface.
8. Recommend next operation: `approve intent-specs` (intent is draft) | `generate code` (intent approved, code stale or absent) | `consider upgrade to pm/dev/expert` (intent has grown beyond ~30 IDed items, compact intent is dense, or private scaffolding indicates repeated repair pain).
9. Render one-screen report. Any memoization is private runtime data; the user-facing output remains the report, not a cache artifact.

## Output

### Full modes
- Status report (rendered to user).
- `.vibeloom/cache/status.json` updated.
- Recommended next operation (e.g. "review intent-specs (1 advisory finding)" or "approve product-specs (clean)" or "reconcile code (3 stale, 1 drifted)").

### Vibe
- One-screen report containing: current mode, intent state, code state, decision count + last topic, recommended next operation.
- No user-facing graph/status artifact.

## Postconditions

### Full modes
- A read-only report is emitted covering: per-tier lifecycle, per-item status (`current` / `stale` / `uncovered` / `dangling` / `drifted` / `obsolete`), affected scope, mode, and recommended next operation.
- The status cache (`.vibeloom/cache/status.json`) is updated.

### Vibe
- A one-screen report is emitted covering: mode, intent state, code state, decision count, recommended next operation.
- No graph/status cache is exposed as user-managed ceremony.

## Constraints

- Read-only — modifies no contract artifacts and no traces.
- Full modes: may refresh `.vibeloom/cache/` files (status.json, contract-graph.json).
- Vibe mode: may use private derived scaffolding, but never requires the user to manage graph/status/cache artifacts.
- Status categories (`current` / `stale` / ...) are taxonomy from methodology §9 — applied per-item in full modes; vibe surfaces coarse intent/code orientation instead.
- Recommendation is best-effort; never auto-invokes the recommended operation.

## Invariants

- Read-only operation: no contract, context, code, or trace is modified.
- Full modes: cache rebuild is allowed and idempotent — the cache is regenerable from artifacts + traces.
- Vibe: deleting private cache/scaffolding cannot remove the compact contract; the engine rebuilds or ignores it.

## Validation

- N/A.

## Failure modes

- (Full modes) Cache corrupt: rebuild from artifacts and traces; surface "cache rebuilt" notice.
- Approval traces missing: surface "no approvals — run init" advisory; vibe path still emits mode + intent state.
- Trace files unreadable: surface integrity warning; status proceeds with reduced fidelity.

<!-- task-template-version: 0.3.0 -->
````

## Artifact templates — intent-specs

### `artifacts/intent-specs/defaults.md`

````template:artifacts/intent-specs/defaults.md
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
````

### `artifacts/intent-specs/intent.md`

````template:artifacts/intent-specs/intent.md
<!--
VibeLoom template: intent
Tier: intent-specs (full modes: pm, dev, ux, expert)
Purpose: prose-first description of the system; captures user intent as capabilities and hard constraints.
Entities: CAP-####, CST-#### (root entity types — no derives_from).
Downstream: drives prd, usm, dm, system, containers, container, component; constraints graduate to defaults when repo-wide and always-on.

Generator guidance:
- Keep prose first. Structured entries are a side effect of the prose, not the primary output.
- Every CAP is an observable user-facing outcome.
- Every CST is a hard requirement or binding preference. Repo-wide always-on CSTs also appear in defaults.md as `default` items.
- Intent is a root artifact; CAP and CST carry no derives_from (they are root entity types).
- Free prose stays un-IDed — only entries that downstream tiers must reference need IDs.
-->

---
artifact_id: intent
artifact_type: intent
tier: intent-specs
approval_unit: intent-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Intent

<!-- One-paragraph statement of what the system is, for whom, and why it should exist. -->

## Vision

<!-- 2-5 sentence vision. What does success look like? -->

## Context and motivation

<!-- What is the surrounding problem, environment, or opportunity? What exists today and why is it insufficient? -->

## Capabilities

<!-- Observable user-facing outcomes. Each capability is a functional promise the system makes to the user. -->

| id | description | notes |
|---|---|---|
| CAP-0001 | | |

## Constraints

<!-- Hard requirements or binding preferences. Repo-wide always-on constraints also appear in defaults.md as `default` items. -->

| id | description | notes |
|---|---|---|
| CST-0001 | | |

## Out of scope

<!-- Optional prose: what is explicitly not this project's concern. Free prose, no IDs. -->

## Open assumptions and risks

<!-- Optional prose. No IDs — these are not graph entities in v2. They may feed future review/eval cycles. -->
````

### `artifacts/intent-specs/vibe-intent.md`

````template:artifacts/intent-specs/vibe-intent.md
<!--
VibeLoom template: intent (vibe mode)
Tier: intent-specs (vibe only)
Purpose: all-inclusive "intent + product" spec. Prose description plus a product summary section that seeds a full product-specs stack on upgrade.
Entities: CAP-####, CST-#### only. Product-level detail is prose, not structured entities.
Downstream: drives compact system (vibe-system.md) and is the primary product-level input for system-specs generation.

Generator guidance:
- Prose-first. Capabilities and constraints are IDed only if downstream work must reference them.
- Product summary is free prose — user journeys, domain concepts, acceptance criteria expressed in narrative. Do not introduce FR-####, STORY-####, BC-####, etc. here.
- On upgrade (init --upgrade --mode pm|dev|ux|expert), the product summary seeds the generation of prd + usm + dm (and ux-specs in `ux` mode).
-->

---
artifact_id: intent
artifact_type: intent
tier: intent-specs
approval_unit: intent-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Intent

<!-- One-paragraph statement of what the system is, for whom, and why it should exist. -->

## Vision

<!-- 2-5 sentence vision. What does success look like? -->

## Context and motivation

<!-- What is the surrounding problem, environment, or opportunity? -->

## Capabilities

<!-- Observable user-facing outcomes. Each capability is a functional promise the system makes to the user. -->

| id | description | notes |
|---|---|---|
| CAP-0001 | | |

## Constraints

<!-- Hard requirements or binding preferences. Repo-wide always-on constraints also appear in defaults.md. -->

| id | description | notes |
|---|---|---|
| CST-0001 | | |

---

## Product summary

<!--
Narrative summary that captures what would normally live in prd + usm + dm. Write it as prose; do not introduce FR-####, STORY-####, BC-####, etc. This section seeds full product-specs on upgrade.

Cover three areas:
-->

### Key requirements

<!-- Functional and non-functional requirements in narrative form. What must the product do? Any critical performance, security, or availability expectations? -->

### User workflows

<!-- Primary user journeys, happy paths, and key decision points. -->

### Domain concepts

<!-- Core domain terms, their relationships, and important invariants. -->
````

## Artifact templates — product-specs

### `artifacts/product-specs/dm.md`

````template:artifacts/product-specs/dm.md
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
````

### `artifacts/product-specs/prd.md`

````template:artifacts/product-specs/prd.md
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
````

### `artifacts/product-specs/usm.md`

````template:artifacts/product-specs/usm.md
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
````

## Artifact templates — ux-specs

### `artifacts/ux-specs/ux.md`

````template:artifacts/ux-specs/ux.md
<!--
VibeLoom template: ux
Tier: ux-specs (full modes only; peer to product-specs)
Purpose: user-visible surfaces, interactions, UX constraints, mockup references.
Entities: VIEW-####, INT-####, UXC-####, MOCK-####.

Derivation rules (per §5.1):
- VIEW derives from CAP, FR, STORY (and optional MOCK references)
- INT derives from FLOW, STORY, VIEW
- UXC derives from CST, NFR, MOCK
- MOCK is a leaf entity referencing files in ux-specs/mockups/

Generator guidance:
- ux-specs is a peer co-informing tier with product-specs. Either can lead depending on mode (`pm` or `ux`).
- In `ux` mode (designer-led), mockups can directly drive product-spec generation via the `generate-product-specs-from-ux` task variant. The generated product-specs still go through PM peer-review and approval before becoming load-bearing.
- In `pm` and `dev` modes, ux-specs is generated from approved intent + product evidence and presented to the designer as a peer-review gate.
- Mockups are first-class input evidence. Good mockups often reveal entities, flows, stories, labels, states, and constraints. Mockups DO NOT become normative truth until their extracted obligations are represented as IDed contract items.
- VIEW: a screen, page, modal, or major UI surface. Each VIEW is what the user sees.
- INT: an interaction pattern (click → expand, drag → reorder, type → autosuggest). Cross-cuts views.
- UXC: a UX-specific constraint (accessibility, responsiveness, motion, dark-mode support, internationalization).
- MOCK: a reference to a designer-supplied artifact (PNG, Figma snapshot, Sketch export). Stored in ux-specs/mockups/ and referenced by MOCK-#### id.

Storage convention:
- Mockup files live in `ux-specs/mockups/`. Filename convention is `MOCK-####-<slug>.<ext>`.
- This template captures the structured items; the mockup files themselves are binary/image assets.
-->

---
artifact_id: ux
artifact_type: ux
tier: ux-specs
approval_unit: ux-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# UX-specs

User-visible surfaces, interactions, UX constraints, and mockup references. Peer co-informing tier with product-specs.

## Views

<!-- Each VIEW is a major UI surface (page, screen, modal, panel). Derives from CAP, FR, STORY, and optional MOCK. -->

| id | name | purpose | derives_from | mockup_refs | notes |
|---|---|---|---|---|---|
| VIEW-0001 | | | | | |

## Interactions

<!-- Each INT is an interaction pattern that may apply across views. Derives from FLOW, STORY, VIEW. -->

| id | name | trigger → outcome | derives_from | notes |
|---|---|---|---|---|
| INT-0001 | | | | |

## UX constraints

<!-- Each UXC is a UX-specific constraint: accessibility, responsiveness, motion, dark-mode, i18n. Derives from CST, NFR, MOCK. -->

| id | constraint | scope | derives_from | notes |
|---|---|---|---|---|
| UXC-0001 | | | | |

## Mockup index

<!-- Each MOCK references a file in ux-specs/mockups/. Filename pattern: MOCK-####-<slug>.<ext>. MOCKs are leaf entities referenced by VIEW, INT, UXC. -->

| id | filename | description | source | notes |
|---|---|---|---|---|
| MOCK-0001 | mockups/MOCK-0001-<slug>.png | | | |

## Notes

<!-- Free-prose UX rationale, design-system pointers, accessibility commitments, etc. Not graph-addressable; informational. -->
````

## Artifact templates — system-specs

### `artifacts/system-specs/component.md`

````template:artifacts/system-specs/component.md
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
````

### `artifacts/system-specs/container.md`

````template:artifacts/system-specs/container.md
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
````

### `artifacts/system-specs/containers.md`

````template:artifacts/system-specs/containers.md
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
````

### `artifacts/system-specs/system.md`

````template:artifacts/system-specs/system.md
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
````

### `artifacts/system-specs/vibe-system.md`

````template:artifacts/system-specs/vibe-system.md
<!--
VibeLoom template: system (vibe mode)
Tier: system-specs (vibe only)
Purpose: all-inclusive summary "technical" spec. Flat covering system context, containers, components, and structured local content.
Entities: CONT-#### and CMP-#### only (per methodology ## Modes ### Vibe Mode).

Note on scope: vibe keeps the Contract Graph unmaterialized. EXT/TB/SNFR/interfaces/dependencies/behaviors appear as structured content in this one file rather than as distinct artifacts. Upgrade to pm/dev/ux/expert expands this into system + containers + per-container + per-component.

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

<!-- Structured content in vibe — not graph entities. Kept here for orientation. -->

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
````

## Artifact templates — context

### `artifacts/context/bdd.md`

````template:artifacts/context/bdd.md
<!--
VibeLoom template: bdd (behavioral scenarios)
Tier: context (full modes only; not generated in vibe)
Purpose: non-executable Gherkin scenarios derived from approved contract for one component-owned behavior slice.
Entities: SCN-#### (individual Gherkin scenarios).
Derivation rules (per §5.1):
- SCN derives from ACC, INV, component (CMP), STORY

One artifact per behavior: filename BDD-####-<slug>.md under /<container>/<component>/context/bdd/.

Generator guidance:
- One BDD artifact = one component-scoped behavior collection.
- Each scenario carries a SCN-#### id and its own derives_from pointing at ACC, INV, CMP, or STORY items.
- Write scenarios in Gherkin style: Given / When / Then / And.
- Keep scenarios observable and deterministic — no implementation details.
- bdd is generated only for components whose contract references acceptance criteria that reach this component (via ACC-#### → FR-#### → STORY-#### → CMP-####).
-->

---
artifact_id: BDD-<####>
artifact_type: bdd
tier: context
scope_kind: component
scope_id: <container-slug>.<component-slug>
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Behavioral Scenarios

<!-- One-paragraph statement of the behavior this artifact covers. -->

- **artifact id:** BDD-<####>
- **behavior title:**
- **owning component:** <CMP-####>
- **derives_from:**

## Scenarios

<!-- Each scenario is a SCN-#### item. Add one ### SCN-#### block per scenario. -->

### SCN-0001

- **derives_from:**

```gherkin
Scenario: <title>
  Given <precondition>
  And <additional context>
  When <action>
  Then <expected outcome>
  And <additional observable outcome>
```
````

### `artifacts/context/component-config.md`

````template:artifacts/context/component-config.md
<!--
VibeLoom template: component config
Tier: context (full modes only)
Purpose: scoped agent-facing execution configuration at component scope. Emitted as AGENTS.md and CLAUDE.md inside the component directory, one per assistant.
Not graph-addressable. Regenerated from approved contract when contract changes.

Assistant slug in the `assistant` frontmatter field. One file per assistant.

Generator guidance:
- Include concrete component-specific pointers: component slug, owning container, bounded context, owned paths, owned interfaces, dependencies, test commands for this component.
- Derived from approved contract entities at component scope and above (component spec + container + system + containers + defaults).
- Do not duplicate contract content. Reference item IDs.
- Subagents loading this config also load the component spec itself; do not restate the spec.
-->

---
artifact_id: config.component.<container-slug>.<component-slug>.<assistant>
artifact_type: config
tier: context
scope_kind: component
scope_id: <container-slug>.<component-slug>
container_id: <CONT-####>
component_id: <CMP-####>
bounded_context: <BC-####>
assistant: <assistant>
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Component Config — <component-slug>

<!-- One-paragraph orientation: what this component owns and why it exists as a separate technical boundary. -->

## Governance summary

- **Component:** <CMP-####> (<container-slug>.<component-slug>)
- **Container:** <CONT-####>
- **Bounded context:** <BC-####>

## Owned paths

<!-- From component.md body (source of truth). Summary here for quick access. -->

| path | notes |
|---|---|
| | |

## Owned interfaces

<!-- From component.md IF-#### table. Summary here. -->

| id | name | kind | consumers |
|---|---|---|---|
| IF-0001 | | | |

## Dependencies

<!-- From component.md DEP-#### table. -->

| id | target | kind | notes |
|---|---|---|---|
| DEP-0001 | | | |

## Commands at component scope

<!-- Test commands, build commands, and lint targets scoped to this component's owned paths. -->

## Do-not-touch boundaries

- Do not edit paths or interfaces not owned by this component.
- Do not bury cross-component behavior in local helper code.
- Do not correct semantic drift only in code if the contract is wrong or incomplete — escalate.

## Local caveats

<!-- Project-specific warnings: idempotency, concurrency, specific invariants the implementer must preserve. -->
````

### `artifacts/context/container-config.md`

````template:artifacts/context/container-config.md
<!--
VibeLoom template: container config
Tier: context (full modes only)
Purpose: scoped agent-facing execution configuration at container scope. Emitted as AGENTS.md and CLAUDE.md inside the container directory, one per assistant.
Not graph-addressable. Regenerated from approved contract when contract changes.

Assistant slug in the `assistant` frontmatter field. One file per assistant.

Generator guidance:
- Include concrete container-specific pointers: container slug, resident BCs, component inventory, owned paths, local dependency edges, local constraints, test commands.
- Derived from approved contract entities at container scope and above (container spec + system + containers + defaults).
- Do not duplicate contract content. Reference item IDs and artifacts.
-->

---
artifact_id: config.container.<container-slug>.<assistant>
artifact_type: config
tier: context
scope_kind: container
scope_id: <container-slug>
container_id: <CONT-####>
assistant: <assistant>
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Container Config — <container-slug>

<!-- One-paragraph orientation: what this container owns and why it exists as a separate runtime unit. -->

## Governance summary

- **Container:** <CONT-####> (<container-slug>)
- **Runtime:** <runtime or deployment unit>
- **Resident bounded contexts:** <BC-####, …>

## Component inventory

<!-- Summary of container.md component table. Regenerated from contract. -->

| id | component | bounded_context | owned_paths |
|---|---|---|---|
| CMP-0001 | | | |

## Local dependency edges

<!-- Structured content from container.md. -->

| from | to | kind | notes |
|---|---|---|---|
| | | | |

## Local constraints

<!-- Local NFR/operational constraints specific to this container. -->

| constraint | affects | notes |
|---|---|---|
| | | |

## Commands at container scope

<!-- Common commands: build, test, lint, type-check for this container's stack. -->

## Do-not-touch boundaries

- Do not redistribute responsibilities between components without updating container.md first.
- Bounded contexts do not span containers.
- Do not change neighboring containers from here.

## Local caveats

<!-- Project-specific warnings relevant to this container. -->
````

### `artifacts/context/root-config.md`

````template:artifacts/context/root-config.md
<!--
VibeLoom template: root config
Tier: context (all modes)
Purpose: scoped agent-facing execution configuration at repo scope. Implements the methodology's `config` artifact; emitted as AGENTS.md and CLAUDE.md (one per assistant) at repo root.
Not graph-addressable. Regenerated from approved contract when contract changes.

Assistant slug in the `assistant` frontmatter field (e.g., `claude`, `codex`). One file per assistant.

Generator guidance:
- Include concrete project-specific pointers: artifact IDs, interface names, owned paths, test commands, cross-scope dependency cues — so subagents can orient without loading the full Contract Graph.
- Derived from approved contract entities owned at root scope and above (none above root, so just root: intent, defaults, prd, usm, dm, ux, system, containers in full modes; compact intent + defaults + system in vibe).
- Do not duplicate contract content. Reference item IDs and artifacts.
- Context artifacts never outrank contract. Config is operational guidance.
-->

---
artifact_id: config.root.<assistant>
artifact_type: config
tier: context
scope_kind: root
scope_id: root
assistant: <assistant>
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Root Config

<!-- One-paragraph orientation: what this repo is, what mode it is in, what you (the assistant) can do here. -->

## Governance summary

- **Mode:** <vibe | pm | dev | ux | expert>
- **Repo scope:** everything under this root
- **Contract sources of truth:** see the artifact list below

## Contract inventory

<!-- Pointers to the governed contract artifacts at root scope. Regenerated from approved contract. -->

| artifact | path | status | notes |
|---|---|---|---|
| intent | `/intent.md` | | |
| defaults | `/defaults.md` | | |
<!-- Full modes also: prd, usm, dm, system, containers. Vibe modes: add flat system only. -->

## Containers

<!-- Full modes only: list container slugs + their root paths. Vibe mode: omit. -->

| container | path | bounded contexts | notes |
|---|---|---|---|
| | | | |

## Repo-wide binding rules

<!-- Summary of defaults.md — every scope must respect these. -->

<!-- Table auto-populated from defaults.md CST-#### items. -->

## Commands at root scope

<!-- Commands the agent typically runs at root: eval root, generate context, approve system-specs, etc. -->

## Do-not-touch boundaries

- Do not infer product semantics from code when approved contract already exists; fix the contract first.
- Do not edit unrelated containers or components from root scope.
- Do not patch context artifacts directly when the fix belongs upstream.

## Local caveats

<!-- Project-specific warnings: approval behavior per mode, reconciliation discipline, etc. -->
````

## Project-level meta artifacts

### `artifacts/validation-registry.md`

````template:artifacts/validation-registry.md
<!--
VibeLoom template: validation-registry
Tier: meta (lives at repo root; not part of the contract stack)
Purpose: declare the project's validation runners — the mechanical tier of the verification ladder. Code-sync traces reference registered runners by `runner_id`.

Schema (per implementation §7):
- runner_id   — stable identifier referenced by traces
- command     — shell command. May reference template variables: ${component}, ${container}, ${owned_paths}
- scope       — workspace | container | component  (where the runner applies)
- inputs      — list of paths / globs / declared sources fed to the runner
- outputs     — what the runner emits: status, logs, artifacts
- description — short prose explaining what the runner checks (optional but recommended)

Standard runner families (suggested ids):
- typecheck         — language-level type validation
- lint              — style + simple-bug static analysis
- unit              — unit tests
- integration       — integration tests
- contract-conformance  — generated contract tests against IF-#### interfaces
- bdd               — generated BDD scenarios pass
- security          — SAST / dependency audit
- smoke             — post-deploy smoke check
- deploy            — deployment dry-run / validation

Generator guidance:
- One registry per project, at the repo root: `validation-registry.md`.
- Add or remove runners over time as the project's tech stack evolves; runners are project-specific.
- Code-sync traces reference runners by id; renaming a runner_id is a breaking change for trace replay.
- Per-runner: pick the simplest command that produces a binary pass/fail outcome. Wrap complex pipelines into shell scripts and reference them.
- Scope determines when the orchestrator invokes the runner (workspace = once per run; container = once per affected container; component = once per affected component).
- Use template variables for component/container scoped runners so the same registry entry serves all matching scopes.
-->

---
artifact_type: validation-registry
tier: meta
timestamp: "<ISO-8601 timestamp>"
---

# Validation registry

Project-level validation runners declared once. Each entry exposes a deterministic command the orchestrator runs against generated artifacts. Belongs to the **mechanical** tier of the verification ladder (see methodology §14.3).

## Runners

```yaml
# typecheck — language-level type validation
- runner_id: typecheck
  command: tsc --noEmit
  scope: workspace
  inputs:
    - src/**
  outputs:
    - status
    - logs
  description: Strict TypeScript typecheck across the workspace.

# lint — style + simple-bug static analysis
- runner_id: lint
  command: eslint src/
  scope: workspace
  inputs:
    - src/**
  outputs:
    - status
    - logs
  description: ESLint with the project's shared config.

# unit — unit tests, per-component
- runner_id: unit
  command: npm test --workspace ${component}
  scope: component
  inputs:
    - owned_paths
  outputs:
    - status
    - logs
  description: Per-component unit tests. ${component} is substituted at invocation.

# integration — integration tests, per-container
- runner_id: integration
  command: npm run test:integration --workspace ${container}
  scope: container
  inputs:
    - owned_paths
  outputs:
    - status
    - logs
  description: Per-container integration tests across components.

# contract-conformance — generated contract tests against declared interfaces
- runner_id: contract-conformance
  command: npm run test:contracts --workspace ${component}
  scope: component
  inputs:
    - owned_interfaces
  outputs:
    - status
    - logs
  description: Verify that the component implements the IF-#### interfaces it declares.

# bdd — generated BDD scenarios pass
- runner_id: bdd
  command: npm run test:bdd --workspace ${component}
  scope: component
  inputs:
    - owned_paths
  outputs:
    - status
    - logs
  description: Run generated Gherkin scenarios for the component.

# security — SAST + dependency audit
- runner_id: security
  command: npm audit --audit-level=high && semgrep --config=auto src/
  scope: workspace
  inputs:
    - src/**
    - package.json
  outputs:
    - status
    - logs
  description: Dependency audit + static analysis security scan.

# smoke — post-deploy smoke check
- runner_id: smoke
  command: npm run smoke --workspace ${container}
  scope: container
  inputs:
    - deployed_url
  outputs:
    - status
    - logs
  description: Hit a small set of endpoints after deploy; confirm 2xx responses.

# deploy — deployment dry-run validation (e.g. terraform plan)
- runner_id: deploy
  command: terraform plan -input=false -out=tfplan
  scope: workspace
  inputs:
    - infra/**
  outputs:
    - status
    - logs
  description: Validate deployment changes before apply.
```

## Notes

- Replace example commands with the project's actual commands during `init` or via `vibeloom generate validation-registry --project-stack`.
- Add project-specific runners as needed (load-test, e2e, accessibility-audit, performance-budget, etc.).
- The orchestrator emits a code-sync trace recording which runners ran and their pass/fail status per scope.
````

## Other

### `artifacts/decision-trace.md`

````template:artifacts/decision-trace.md
<!--
VibeLoom template: decision-trace (single template for all human-authored decisions)
Tier: context (decision traces are persisted under .vibeloom/traces/decisions.jsonl as durable provenance; this template is the markdown representation that materializes per-record into project folders for human readability)
Purpose: capture human-authored decisions with classification by primary contract tier.

Decisions live in one trace family with `record_type` classifying the primary contract tier:

| record_type | meaning                          | primary tier         |
|-------------|----------------------------------|----------------------|
| IDR         | Intent Decision Record           | intent-specs         |
| PDR         | Product Decision Record          | product-specs        |
| UDR         | UX Decision Record               | ux-specs             |
| ADR         | Architecture Decision Record     | system-specs         |
| general     | process / methodology / ops      | none — no contract   |

Materialization convention (project layout):
- Each decision instance is its own file, organized under decisions/ by record_type:
  decisions/idr/IDR-0001-<slug>.md
  decisions/pdr/PDR-0007-<slug>.md
  decisions/udr/UDR-0003-<slug>.md
  decisions/adr/ADR-0042-<slug>.md
  decisions/general/DEC-0099-<slug>.md
- The append-only trace stream at .vibeloom/traces/decisions.jsonl carries the canonical record (one JSON object per line). The per-record markdown files are the human-readable rendering.

Generator guidance:
- Classify by PRIMARY locus, not by all tiers a decision ripples to. A decision that's primarily architectural (e.g. "REST → GraphQL") is an ADR even if it ripples to product, UX, and code. Multi-tier impact is captured in `affects: [item_ids]`, not in record_type.
- `general` is for decisions that don't change contract content (process conventions, methodology choices, operations). These typically have empty `affects` and stay `load_bearing: false`.
- `load_bearing: true` only when the decision still informs future generation (preserve / avoid / why-still-binding / which-rejected-alternative).
- Truly normative decisions should be promoted to IDed contract items; the trace entry remains immutable.
- Fill `affects: [item_ids]` with the contract item IDs this decision constrains. This is what enables the future v0.4+ promotion to graph nodes.
-->

---
trace_id: DEC-<YYYYMMDD>-<NNNN>            # event identity, replay key (e.g. DEC-20260512-0007)
record_id: <RECORD>-<NNNN>                 # rendered-record identity (e.g. ADR-0007); omit for record_type: general
kind: decision
record_type: <IDR | PDR | UDR | ADR | general>
load_bearing: <true | false>
affects: []                                # list of contract item IDs constrained by this decision
timestamp: "<ISO-8601 timestamp>"
author: "<email-or-handle>"
topic: "<short slug or title>"
---

# <Decision title>

<!-- One-sentence summary of what was decided. -->

## Context

<!-- The circumstances that led to this decision. What was the situation, what changed, what triggered it. -->

## Decision

<!-- What was decided. Be specific. -->

## Rationale

<!-- Why this choice was made. Tradeoffs considered, alternatives evaluated. -->

## Alternatives considered

<!-- Other options examined and why they were rejected. -->

| option | why rejected |
|---|---|
| | |

## Consequences

<!-- What follows from this decision: changes required, downstream items affected, ongoing constraints. -->

| affected_item_id | expected_effect |
|---|---|
| | |

## Status

<!--
- proposed: under discussion, not yet load-bearing
- accepted: load_bearing=true; informs future generation
- superseded: load_bearing=false; replaced by another decision (reference it)
- deprecated: load_bearing=false; no longer applies but kept for history
-->

- **Status:** <proposed | accepted | superseded | deprecated>
- **Superseded by:** <DEC-id, if applicable>
````
