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
