<!--
VibeLoom template: ux
Tier: ux-specs (full modes only; peer to product-specs)
Purpose: user-visible surfaces, interactions, UX constraints, mockup references.
Entities: VIEW-####, INT-####, UXC-####, MOCK-####.

Derivation rules (per §5.1):
- VIEW derives from CAP, FR, STORY (and optional MOCK references)
- INT derives from FLOW, STORY, VIEW
- UXC derives from CST, NFR, MOCK
- MOCK is a leaf entity referencing files in ux-specs/mockups/

Generator guidance:
- ux-specs is a peer co-informing tier with product-specs. Either can lead depending on mode (`pm` or `ux`).
- In `ux` mode (designer-led), mockups can directly drive product-spec generation via the `generate-product-specs-from-ux` task variant. The generated product-specs still go through PM peer-review and approval before becoming load-bearing.
- In `pm` and `dev` modes, ux-specs is generated from approved intent + product evidence and presented to the designer as a peer-review gate.
- Mockups are first-class input evidence. Good mockups often reveal entities, flows, stories, labels, states, and constraints. Mockups DO NOT become normative truth until their extracted obligations are represented as IDed contract items.
- VIEW: a screen, page, modal, or major UI surface. Each VIEW is what the user sees.
- INT: an interaction pattern (click → expand, drag → reorder, type → autosuggest). Cross-cuts views.
- UXC: a UX-specific constraint (accessibility, responsiveness, motion, dark-mode support, internationalization).
- MOCK: a reference to a designer-supplied artifact (PNG, Figma snapshot, Sketch export). Stored in ux-specs/mockups/ and referenced by MOCK-#### id.

Storage convention:
- Mockup files live in `ux-specs/mockups/`. Filename convention is `MOCK-####-<slug>.<ext>`.
- This template captures the structured items; the mockup files themselves are binary/image assets.
-->

---
artifact_id: ux
artifact_type: ux
tier: ux-specs
approval_unit: ux-specs
scope_kind: root
scope_id: root
status: draft
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# UX-specs

User-visible surfaces, interactions, UX constraints, and mockup references. Peer co-informing tier with product-specs.

## Views

<!-- Each VIEW is a major UI surface (page, screen, modal, panel). Derives from CAP, FR, STORY, and optional MOCK. -->

| id | name | purpose | derives_from | mockup_refs | notes |
|---|---|---|---|---|---|
| VIEW-0001 | | | | | |

## Interactions

<!-- Each INT is an interaction pattern that may apply across views. Derives from FLOW, STORY, VIEW. -->

| id | name | trigger → outcome | derives_from | notes |
|---|---|---|---|---|
| INT-0001 | | | | |

## UX constraints

<!-- Each UXC is a UX-specific constraint: accessibility, responsiveness, motion, dark-mode, i18n. Derives from CST, NFR, MOCK. -->

| id | constraint | scope | derives_from | notes |
|---|---|---|---|---|
| UXC-0001 | | | | |

## Mockup index

<!-- Each MOCK references a file in ux-specs/mockups/. Filename pattern: MOCK-####-<slug>.<ext>. MOCKs are leaf entities referenced by VIEW, INT, UXC. -->

| id | filename | description | source | notes |
|---|---|---|---|---|
| MOCK-0001 | mockups/MOCK-0001-<slug>.png | | | |

## Notes

<!-- Free-prose UX rationale, design-system pointers, accessibility commitments, etc. Not graph-addressable; informational. -->
