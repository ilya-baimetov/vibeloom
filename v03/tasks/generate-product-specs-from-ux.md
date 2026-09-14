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
