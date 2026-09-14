# Runtime Reference

Dispatch mechanics for the skill. Authoritative semantics live in [`vibeloom-implementation.md`](../vibeloom-implementation.md). This file is a load-on-demand condensation focused on what the orchestrator needs at runtime.

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
