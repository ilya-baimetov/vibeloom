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
