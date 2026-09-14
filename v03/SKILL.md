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

- **[vibeloom-methodology.md](vibeloom-methodology.md)** — WHAT (entities, tiers, modes, operations, approval model, Contract Graph, status taxonomy, verification ladder, decision-trace classification). If this skill file conflicts with the methodology, the methodology wins.
- **[vibeloom-implementation.md](vibeloom-implementation.md)** — HOW (cache vs traces split, artifact layout, frontmatter shape, ID schema, runtime loop, dispatch plan + wave assembly + subagent task header schema, trace schemas, layer-aware constraints).
- **[codæ-manifesto.html](codæ-manifesto.html)** — WHY (the case for contract-driven agentic engineering). Paradigm context; not loaded for runtime decisions, but referenced when explaining the system or onboarding new contributors.

## Runtime references (load on demand)

- **[references/operations.md](references/operations.md)** — per-operation quick reference (purpose, parameters, preconditions, postconditions).
- **[references/modes.md](references/modes.md)** — per-mode behavior (`vibe`, `pm`, `dev`, `ux`, `expert`): tier ownership, auto-advance, public surface.
- **[references/runtime.md](references/runtime.md)** — dispatch mechanics: dispatch plan, wave assembly, parallel semantics, subagent task header, load sets, late-fetch.
- **[references/artifacts.md](references/artifacts.md)** — artifact layout, frontmatter shapes, ID schema, derivation rules, layer-aware constraints.
- **[references/eval.md](references/eval.md)** — verification ladder (decidable / mechanical / heuristic), heuristic dimensions, finding schema, severity classification.
- **[references/troubleshooting.md](references/troubleshooting.md)** — failure modes and recovery (cache corruption, lifecycle drift, breaking changes, partial wave failure, late-fetch overflow).

## Templates

### Artifact templates (under [`artifacts/`](artifacts/))

- `intent-specs/`: `intent.md`, `vibe-intent.md`, `defaults.md` (with Tech Stack section per layer)
- `product-specs/`: `prd.md`, `usm.md`, `dm.md`
- `ux-specs/`: `ux.md` (peer to product-specs; mockup-evidence pattern)
- `system-specs/`: `system.md`, `vibe-system.md`, `containers.md`, `container.md` (with `layer` field + per-layer deployment guidance), `component.md` (layer-aware bounded_context constraint)
- `context/`: `bdd.md`, `root-config.md`, `container-config.md`, `component-config.md`
- `decision-trace.md` (single template parameterized by `record_type`; materializes per-record markdown renderings of decision-trace entries — see implementation §8.5.1)
- `validation-registry.md` (project-level meta artifact)

Load one artifact template at a time for the artifact being generated.

### Task templates (under [`tasks/`](tasks/))

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
