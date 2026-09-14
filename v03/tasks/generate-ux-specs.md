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
