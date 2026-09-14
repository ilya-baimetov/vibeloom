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
2. **Decidable tier (engine, structural)**: run the engine's structural checks for the target. Full modes use the canonical check inventory in [methodology §14.3](../vibeloom-methodology.md#143-verification-ladder), including `derives_from` validation per implementation §5.1 and methodology §8.2. Vibe runs compact checks only: required visible files, parseable frontmatter/sections, approval hash consistency, validation registry presence, and upgrade recommendation heuristics.
3. **Mechanical tier (engine + runners)**: invoke validation runners declared in `validation-registry.md` that are in scope for the target. Aggregate pass/fail per runner.
4. **Heuristic tier (agent, semantic)**: agent runs the heuristic dimensions defined in [`references/eval.md`](../references/eval.md) (canonical dimension list in methodology §14.2) against items in scope.
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
