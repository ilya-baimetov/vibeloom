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
