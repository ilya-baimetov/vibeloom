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
