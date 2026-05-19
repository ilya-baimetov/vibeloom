# Build the v0.3 vibeloom engine

> **Historical from-scratch prompt.** This document is the original prompt that produced the current `v03/engine/`. It was written assuming a **greenfield build** — i.e. no `engine/` directory exists. The directory now exists and is the source of truth. Do **not** use this prompt to maintain the engine; for ongoing maintenance, read `v03/vibeloom-implementation.md` directly and edit `v03/engine/` in place. Kept for replay/audit and for v0.4+ engine rebuilds against a future spec.

A prompt for Claude Code (or any equivalent agentic coding tool). The agent reads the canonical implementation spec and produces a working engine — single Python file or multi-file package, agent's call (see Step 4).

This prompt names **what** must happen, not how. Module decomposition, public API shapes, internal data structures, parsing strategies, code style — those are the agent's call. The agent should consult `vibeloom-implementation.md` as the source of truth and exercise judgment.

This prompt is itself codæ-shaped — Inputs, Preconditions, Steps, Output, Postconditions, Constraints, Invariants, Validation, Failure modes — because the build of vibeloom should follow the same discipline vibeloom imposes on the systems it governs.

**Time-budget calibration.** This is a 1–2 day build for a focused human-paced agent. If you find yourself spending hours on a single module, stop and ask whether you're solving the spec or solving something the spec doesn't ask for. Re-read the relevant § when in doubt; do not invent. **For agentic runs with hours rather than days:** Step 4 ships in priority stages — get Stage 1 (read-only primitives) and Stage 2 (structural eval) verified before attempting later stages, and commit + surface state if you hit the time budget mid-stage.

---

## Purpose

Build the v0.3 vibeloom engine: a deterministic Python package that parses contract artifacts, validates schemas, builds the contract graph, computes affected sets, plans dispatch waves, manages the ID registry, reads/writes durable traces, and computes status. The engine never makes semantic judgments. **Skill = orchestrator + judgment; engine = parser + math.**

## Inputs

- **`v03/vibeloom-implementation.md`** — canonical spec. Authoritative for every shape, schema, rule, and operation the engine must implement. Read it cover-to-cover before writing code.
- **`v03/vibeloom-methodology.md`** — paradigm context. Read to understand contract tiers, modes, Contract Graph, status taxonomy, traces, and the verification ladder.
- **`v02/engine/`** — prior-art reference. The v02 engine targets an older spec; many concepts carry over but several details have changed. Use it for inspiration, not for copy-paste.

### v02 → v03 delta (must-handle)

| Area | v03 changes |
|---|---|
| Contract artifact frontmatter | adds `approval_unit` field (impl §6.1, §6.3) |
| Decision traces | JSONL canonical + per-record markdown rendering at `/decisions/<record_type>/<TRACE_ID>-<slug>.md`, regenerable from JSONL (impl §8.5.1) |
| Dispatch | `execute_plan(plan)` is now a single primitive shared by `generate` and `reconcile` (impl §13.3); the engine assembles the plan and validates results, the orchestrator drives subagents |
| ID prefixes | 6-column registry (prefix / name / tier / source artifact / scope / notes) per impl §5.1 |
| Containers | `layer` field required (`presentation` \| `application` \| `domain` \| `infrastructure`); BCs only in `domain` layer (methodology §6.4) |
| Modes | adds `ux` mode (designer-led + PM peer reviewer) |
| Task templates | 10 sections (Purpose / Inputs / Preconditions / Steps / Output / Postconditions / Constraints / Invariants / Validation / Failure modes) per impl §12.1 |
| Decisions | unified `DEC-` family with `record_type` (`IDR`/`PDR`/`UDR`/`ADR`/`general`); no separate ADR/PDR folders |
| Eval ladder | explicit `decidable` / `mechanical` / `heuristic` rungs per methodology §14.3 |

The implementation doc is the truth. Treat the table above as a starting checklist, not an exhaustive list.

## Architecture sketch (data flow only)

```text
artifacts (markdown + frontmatter)
        │
        ▼
parsing & schema validation
        │
        ▼
ID registry & contract graph (DAG over derives_from)
        │
        ▼
read-only operations:  structural eval • staleness • affected-set
        │
        ▼
dispatch plan (waves) and execute_plan (validation + atomic patches + trace I/O)
        │
        ▼
status classification (current / stale / uncovered / dangling / drifted / obsolete)
        │
        ▼
JSON on stdout  ←  CLI surface
```

How to decompose this into modules and APIs is the agent's choice — match the impl spec's responsibilities and keep the dependencies acyclic.

## Preconditions

- Repository is checked out at `vibeloom/`. You are working in `vibeloom/v03/`.
- Python 3.10+ available.
- All three input files exist.
- No `engine/` directory at `v03/`. **Note (post-v03):** this precondition was authentic when the prompt was first run; the engine now exists at `v03/engine/`. To re-run this prompt in maintenance mode, either work in a clean worktree where `engine/` is absent, or read the existing engine first and treat it as authoritative. For routine edits, do not use this prompt — read the spec and modify `v03/engine/` in place.
- Templates live as fenced blocks in `vibeloom-templates.md`; `extract-templates.py` materializes them under `v03/templates/`. The engine never reads templates directly — they're inputs to the *skill* build (see [`build-skill.md`](build-skill.md)). Useful as a reference for canonical artifact shapes.

## Steps

1. **Read `vibeloom-implementation.md` like a spec, not like prose.** Three passes: (a) skim the §s and copy the headings into a scratchpad as a working outline; (b) read each § slowly, taking notes on every frontmatter shape (§6), every trace schema (§8), every operation pseudocode (§15), and every acceptance-checklist item (§16); (c) follow forward references (§13 in §6, §15 in §13) and re-read in context. Do not start coding while still confused.
   **Verify:** write `read-pass-1-summary.md` at the worktree root listing every trace family, every status category, every dispatch wave-rule, and every operation. Externalize so a reviewer can verify the pass actually happened — not just that you claimed it did.

2. **Read `vibeloom-methodology.md` cover-to-cover for paradigm context.** Methodology §6.5 (layered architecture) and §11.1 (decision-trace classification) are particularly load-bearing.
   **Verify:** write `read-pass-2-summary.md` at the worktree root covering the verification ladder (decidable / mechanical / heuristic), layered-architecture rules (BCs only in domain layer; component → container; bounded context → component), and the contract / context / code tier distinction.

3. **Diff v02 against v03.** Identify every place the v03 spec changes the contract. Inventory v02/engine/ first: which modules have a 1:1 v03 analog (likely `parser`, `graph`, `ids`, `staleness`, `affected`, `status`), which need light adaptation (`schema` for new trace shapes), which are net-new (decision-trace markdown rendering, dispatch_plan + execute_plan, layered-architecture validation). The delta table above is a starting list; the spec is the truth.
   **Verify:** the diff covers every row in the v02→v03 delta table above, plus any others you found. State which v02 modules you'll reuse as-is, which need adaptation, which you'll rewrite. Pin the v02 commit SHA you're diffing against.

4. **Implement the engine** in Python 3.10+, stdlib only, somewhere under `v03/`. The agent picks the source layout (single-file script vs. multi-file package). Whatever the layout, the engine must expose **one CLI surface** invokable from the skill — a console-script (e.g. `vibeloom-engine <command>`) after `pip install -e`, or a direct script (`python3 engine.py <command>`), or `python3 -m vibeloom_engine <command>`. Choose the simplest pattern that makes the engine bundleable inside the skill release tarball without additional install steps for end users. v02 used a multi-file package + console-script — a reasonable baseline; v0.3 may keep that or simplify further.

   Implement in **priority order**, checkpointing after each stage. If you reach the time budget mid-stage: commit, surface what's done, surface what's not. Do not skip ahead — partial coverage of Stage 1 is more valuable than fragile half-implementations across all six.

   **Stage 1 — read-only primitives (target: 30% of build budget).**
   - **Frontmatter and body parsing** for every artifact type listed in §6. Body parsing extracts IDed items per the families in §5.1 and the body conventions in §17.3 (the `artifacts.md` template documents the canonical column conventions).
   - **Schema validation** for every frontmatter shape (§6). Trace-shape validation is deferred to Stage 3.
   - **ID registry** with allocation, retired-list, and the rule that retired IDs are never reused (§5.2).
   - **Contract graph** as a DAG over `derives_from` edges; only `CAP` and `CST` may be roots; bounded contexts only in domain-layer components (methodology §6.4); the rest of methodology §8.
     - **Cycle handling:** a cycle in `derives_from` is a blocking structural-eval finding (exit 1). The engine reports the full cycle path (e.g. `A → B → C → A`) and which artifacts host the offending edges. The engine does not silently break the cycle — the user breaks it by editing an artifact's `derives_from` list.
   - **Layered invariants** — BCs only in domain-layer components per methodology §6.4.
   - **CLI verbs `parse` and `graph`** (output shapes + exit codes per the conventions block at the bottom of this Step).
   - **Verify (Stage 1):** fabricate a minimal v0.3 scratch repo at `/tmp/vibeloom-engine-verify/` with `intent.md` (CAP-0001, CST-0001) and `prd.md` (FR-0001 deriving from CAP-0001), valid frontmatter per impl §6. Run `parse` → expect 2 artifacts, no errors, exit 0. Run `graph` → expect ≥3 items, ≥1 edge, exit 0. The v03 templates tree under `v03/templates/` is *not* a valid contract repo — templates have placeholder frontmatter and live under `templates/artifacts/<tier>/`, not at repo root. Don't use it for this verify gate.

   **Stage 2 — structural eval (target: 15%).**
   - Every check in impl §14.1 and methodology §14.1 (Rung 1 of the verification ladder).
   - **CLI verb `eval`.**
   - **Verify (Stage 2):** on the clean Stage-1 fixture, `eval` exits 0 with 0 blocking findings. Introduce a deliberate cycle (FR-0001 ↔ FR-0002) and re-run `eval` → expect 1 blocking `cycle: FR-0001 → FR-0002 → FR-0001` finding, exit 1.

   **Stage 3 — trace I/O + schema versioning (target: 15%).**
   - **Trace I/O** for every family in §8 (approval, code-sync, generation, eval, decision, import) plus the structured `id-registry.json`. JSONL is append-only; rejecting in-place rewrites is non-negotiable.
   - **Schema validation for trace shapes** with `schema_version` handling per §8.7 — current major OK, future major raises, kind-mismatch rejected.
   - **Verify (Stage 3):** writing then reading each trace family round-trips; appending to an existing trace file preserves prior records; reading a trace whose `schema_version` major exceeds the engine's raises a typed error rather than parsing partially.

   **Stage 4 — staleness / affected-set / direct-edit detection (target: 15%).**
   - **Staleness, affected-set, direct-edit detection** per impl §10 + §15.
   - **CLI verbs `staleness`, `affected`, `detect-edits`.**
   - **Verify (Stage 4):** on a fixture with an approval trace, modifying an upstream item and re-running `staleness` flips downstream items to `stale`; modifying an approved-artifact's body in-place surfaces in `detect-edits`.

   **Stage 5 — dispatch plan + execute_plan (target: 15%).**
   - **Dispatch plan** with wave assembly per impl §13.1–§13.2 (disjoint ownership, derivation precedence, concurrency cap, reconciliation singletons, eval ordering).
   - **`execute_plan(plan)`** per §13.3 — coordinates validation, trace writing, atomic patch application; calls back to the orchestrator for actual subagent spawning.
   - **CLI verb `dispatch`.**
   - **Verify (Stage 5):** `dispatch` emits a well-formed plan JSON satisfying §13.2 wave-assembly rules; `execute_plan` invokes the orchestrator callback with the documented task header (impl §13.3).

   **Stage 6 — status classification + decision-trace rendering + cache management (target: 10%).**
   - **Status classification** producing the six categories in §10, plus the surrounding report fields (lifecycle per artifact, affected scope, coverage gaps, current mode, recommended next operation).
   - **Decision-trace markdown rendering** per §8.5.1 — every JSONL row in `decisions.jsonl` materializes deterministically as a per-record file at `/decisions/<record_type>/<TRACE_ID>-<slug>.md`. Idempotent, regenerable.
   - **Cache management** at `.vibeloom/cache/` — regenerable, never authoritative, safe to delete.
   - **CLI verb `status`** plus any verbs the v03 spec implies for decision-trace rendering.
   - **Verify (Stage 6):** `status` distinguishes all six categories on a fixture exercising each one; decision-trace render is byte-identical on re-render of the same JSONL row; user-edited body in a rendered file is preserved across re-render (per §8.5.1).

   **Across all stages — CLI conventions:**
   - **Per-command output shape:** v02/engine/vibeloom_engine/cli.py is the baseline. Each command emits its own command-specific JSON payload directly to stdout (e.g. `parse` → artifact inventory; `graph` → graph structure; `eval` → `{findings: [...], errors: [...]}`). v0.3 retains v02's per-command shape for unchanged commands; new v0.3 commands document their own payload shape in the engine source. **Do not invent a unified envelope** — v02 doesn't use one and the skill expects per-command shapes. YAML appears in spec examples for human readability; engine stdout is uniformly JSON.
   - **Exit-code semantics:**
     - `0` — clean: no blocking findings (advisories OK).
     - `1` — blocking findings (e.g. `eval` finds structural-rule violations; `dispatch` finds an unresolvable derivation).
     - `2` — engine error (invalid input, internal exception, malformed trace).
     Skills route on exit code; ambiguity here breaks routing.

   The agent decides module names, public APIs, internal data shapes, parsing strategy, and code organization. Match the spec's behavior; don't over-think the structure.

5. **Write tests covering the engine's behavior.** At minimum, the test suite must:
   - Exercise every status category from §10 (`current` / `stale` / `uncovered` / `dangling` / `drifted` / `obsolete`).
   - Exercise wave-assembly rules from §13.2 (disjoint ownership, derivation precedence, concurrency cap, reconciliation singletons).
   - Exercise schema-version handling from §8.7 (parser meets older trace; meets newer trace; rejects incompatible major).
   - Exercise the ID registry's retired-list invariant.
   - Exercise the decision-trace markdown rendering's idempotency.
   - Exercise the cache's regeneration-from-traces property.
   - Exercise `derives_from` validation per §5.1 + §8.2: non-root item missing `derives_from` → blocking finding; derivation chain that doesn't transitively reach `CAP` or `CST` → blocking finding; non-allowed upstream prefix per §5.1 derivation rules → blocking finding.

   Build whatever test fixtures the suite needs. Tests run with `pytest`.
   **Verify:** `pytest --cov` reports ≥85% statement coverage on engine modules. Every status category, every wave-assembly rule, and every schema-version transition has at least one named test. Test names map to spec §s where applicable (e.g. `test_status_uncovered_per_§10`).

6. **Smoke-test the engine surface end-to-end on a scratch repo.** The engine is a deterministic substrate; mode-driven workflows (vibe vs. pm vs. ux vs. dev vs. expert) are skill concerns and live in the build-skill smoke tests. The engine smoke test confirms the **primitives compose correctly** on a realistic minimal contract artifact set under `/tmp`. At minimum, exercise:
   - Parsing a minimal artifact set; building the graph; running `eval` clean.
   - Writing an approval trace via the engine API; running `status` and seeing lifecycle flip to approved with all items `current`.
   - Modifying an approved artifact; running `detect-edits` and seeing direct edits surfaced; running `status` and seeing items reclassified appropriately.
   - Running `affected` after a CAP-level change; running `dispatch` and getting a well-formed plan that satisfies §13.2 wave-assembly rules.
   - Rendering decision-trace markdown per §8.5.1, two cases:
     (a) fresh render → delete the file → re-render: output must be byte-identical (idempotent regeneration);
     (b) fresh render → simulate user edit (modify the body prose, leave frontmatter intact) → re-render: frontmatter is byte-identical; the user-edited body is **preserved as-is**, not overwritten (per §8.5.1's "body prose is regenerated on first materialization, then preserved on subsequent regenerations").

   Each engine command must produce well-formed JSON on stdout. Each CLI exit code must match the documented semantics.
   **Verify:** all smoke-test commands exit with documented exit codes; all stdout payloads parse as valid JSON; the eval/approve/detect-edits cycle reaches the documented end state without manual intervention; the full sequence is captured in a transcript file the human can replay.

## Output

A working engine under `v03/` — source layout per Step 4 (single file or package). Invokable via the agreed CLI surface; bundleable inside the skill release tarball with no install steps required for end users.

## Postconditions

- The engine exposes one CLI verb per capability (`parse`, `graph`, `eval`, `affected`, `staleness`, `detect-edits`, `dispatch`, `status`, plus any v0.3-spec-implied commands such as decision-trace rendering). All commands emit JSON on stdout and follow documented exit-code semantics.
- All trace schemas from impl §8 are encoded and validated on read per §8.7.
- ID registry persists `next` counter and `retired` list per prefix; retired IDs are never reused (§5.2).
- Contract graph is a DAG; only `CAP` and `CST` are roots.
- Decision-trace markdown rendering is wired up per §8.5.1 — JSONL canonical, markdown derived, regenerable.
- `dispatch_plan` and `execute_plan` exist per §13 and pass tests covering the wave-assembly rules.
- Status classification matches §10 for all six categories.
- Engine smoke test (Step 6) passes end-to-end on a scratch repo; transcript captured. Mode-driven smoke tests (vibe / pm) belong to `build-skill.md`.
- Test suite passes with `pytest` at ≥85% statement coverage.

## Constraints

- **Zero runtime dependencies beyond Python 3.10+.** No `pip install` required for end users. Stdlib only at runtime. Dev-only tools — `pytest`, `pytest-cov`, `coverage` — are permitted (installable in a venv when the host Python is externally managed). The zero-runtime-deps rule applies to engine runtime imports only. Custom YAML frontmatter parser shipped in-tree.
- **No semantic judgments in the engine.** Hashes, schemas, derivation walks, IDs, JSON I/O — yes. Spec meaning, approval correctness, faithfulness — no.
- **All operations are deterministic.** Same inputs → same outputs.
- **Cache is regenerable; traces are canonical.** If `.vibeloom/cache/` is deleted, the engine rebuilds from current artifacts + the full trace history in `.vibeloom/traces/` with no information loss. When current artifacts and trace-recorded state disagree (e.g. an artifact was edited since its last approval trace), traces are the canonical record of *what was approved*; current artifacts are the canonical record of *what is now*. The status report surfaces the gap as drift.
- **Traces are durable, append-only.** No silent rewrites. On schema-version mismatch, surface a status finding instead of crashing (§8.7).

## Invariants

- The contract graph is a DAG; only `CAP` and `CST` are roots.
- Container `layer` is required and enum-bounded.
- Bounded contexts are hosted only by domain-layer components.
- Component belongs to exactly one container; bounded context belongs to exactly one component.
- ID registry's `retired` list is append-only; retired IDs are never reused.
- Trace files are append-only; no in-place edits.

## Validation

Before declaring the engine complete, every **engine-side** item in impl **§16 acceptance checklist** must pass. Some §16 items are skill concerns (validated by `build-skill.md`, not here). The mapping below pre-classifies every §16 box so you don't have to guess:

| §16 item | Owner |
|---|---|
| `.vibeloom/cache/` and `.vibeloom/traces/` separated | **engine** |
| Approval baseline trace-backed (JSONL append-only) | **engine** |
| ID registry persists retired + next | **engine** |
| Trace families have `schema_version` | **engine** |
| Code-sync traces connect IDs to file hashes + validation evidence | **engine** |
| Review/reconciliation packets have user-notes write capability | skill |
| Task templates are markdown 10-section, not YAML wrappers | skill |
| Subagent writes patch-staged in `.vibeloom/runs/`, validated, applied atomically | **engine** |
| Dispatch plan + wave-assembly + parallel semantics match §13.1–§13.3 | **engine** |
| Subagent task header schema is the only orchestrator↔subagent contract | skill |
| Validation registry parsed, runners invokable | **engine** |
| Product/UX peer generation supports mockup evidence with `MOCK-####` | skill |
| `ux` mode supported as a fifth top-level mode | skill (modes are skill concerns) |
| Verification ladder reflected in eval routing | **engine** |
| Component / container / BC rules match methodology §6.5 | **engine** |
| Engine validates `derives_from` per §5.1 + §8.2 (universal-trace) | **engine** |
| `status` distinguishes the 6 categories | **engine** |
| Each operation has explicit, traceable execution semantics (§15.1–§15.8) | **engine** for primitives; skill for orchestration |
| Vibe layout genuinely minimal (no graph cache, no code-sync trace) | **engine** |
| Templates only as fenced blocks; tree is build artifact | skill |

Paste this table into your final report with each engine-row marked ✓ / blocked, and skill-rows marked **skill-deferred** with a one-line rationale.

Plus:
- `pytest` passes 100% with ≥85% statement coverage.
- The smoke test in step 6 passes end-to-end and a transcript is left for review.

## Failure modes

- **Spec ambiguity vs. spec bug — different responses:**
  - *Ambiguity:* spec is silent or unclear. Prefer the most conservative interpretation, leave a comment marking the choice (`# spec ambiguity: <reason>`), surface in your final report. Do not invent behavior the spec doesn't specify.
  - *Bug:* spec contradicts itself or contradicts a reference (e.g. §6.3 says one thing, §17.3 says another). **Do not fix the spec.** Stop the affected step. Surface the contradiction with both citations in your final report and request human adjudication before continuing. The spec author is the only legitimate fixer.
- **v02-vs-v03 confusion.** If you find yourself reaching for the v02 module and pasting it, stop and re-read the relevant § of `vibeloom-implementation.md`. The v02 engine is reference, not template.
- **Schema drift.** If your implementation diverges from §8 trace schemas, the bug is in your code, not the spec. Re-read §8.7.
- **Test failures.** Don't suppress, don't skip. If a test exposes a real bug in the spec, surface it (per the bug rule above); if it exposes a bug in your code, fix it.
- **Reaching for a third-party package.** Stop. Check stdlib first. The zero-dependency constraint is not optional.
- **Stale context after a long build.** When a step's outcome surprises you, re-read the relevant § rather than working from memory. Long sessions drift; the spec stays put.

## Anti-patterns to avoid

- Importing `pyyaml`, `pydantic`, `marshmallow`, `jsonschema`, or any other parsing/validation library.
- Shelling out to `git` for content hashing — use `hashlib.sha256` on canonical-normalized text.
- In-place editing of trace files.
- Letting the engine make semantic decisions.
- Catching `Exception` broadly.
- Adding undocumented CLI flags.
- Treating cache as authoritative.
- Hand-editing extracted templates (the templates tree is a build artifact; edit the source).

## Checkpointing

After each major step (1 — read; 3 — v02 diff inventory; 4 — engine implementation; 5 — tests; 6 — smoke), commit the current state to a working branch with a step-naming message (e.g. `engine: step 4 complete — parser + schema + graph`). If a session is interrupted, the next agent run resumes from the most recent checkpoint without re-doing earlier work.

## Final report

When the engine passes acceptance, produce a one-page summary covering:

1. **Checklist:** paste impl §16 with each box marked engine-✓ / skill-deferred / blocked.
2. **Spec ambiguities found:** every `# spec ambiguity:` comment, with the chosen interpretation and rationale.
3. **Spec bugs surfaced:** any §-vs-§ contradictions discovered (per the failure-modes rule). Do not fix; surface only.
4. **Test results:** `pytest` summary + coverage percentage.
5. **Smoke test:** which CLI commands ran, what state the scratch repo ended in, links to the trace files left for inspection.
6. **v02 modules reused:** per-module notes (as-is / adapted / rewritten) with provenance line numbers.
7. **Known limitations or deferred work:** anything intentionally not implemented yet, with rationale.
8. **Reference commit SHA** for the engine state — `build-skill.md` will use this as its starting point.

## After this build

When the engine passes its acceptance checklist and the smoke test, run [`build-skill.md`](build-skill.md) to assemble the full skill bundle.

Tag a reference engine commit so the build-skill phase has a stable target.
