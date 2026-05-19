# VibeLoom v03 Adversarial Canon Review

Scope: `v03/codæ-manifesto.html`, `v03/vibeloom-methodology.md`, and `v03/vibeloom-implementation.md`.

Review posture: adversarial. This report focuses on quality, concision, internal consistency, and whether a future agent or human can treat the canon as a precise authority chain.

## Executive Summary

The v03 canon is materially stronger than a loose philosophy doc: it has a clear methodology/implementation split, a concrete approval model, and enough runtime specificity to be executable. The weak point is not ambition; it is authority drift. The manifesto, methodology, and implementation repeat and sometimes reinterpret the same concepts, while the implementation contains stale inventories and unchecked acceptance state. The biggest risks are agents following stale task names, contradictory ID rules, and schema differences between the canon and skill templates.

The recommended direction is to make the canon stricter and shorter:

- Manifesto: durable thesis only; evidence and market claims in an appendix or site evidence page.
- Methodology: conceptual rules only; no file layout, template schema, or low-level runtime tables except short references.
- Implementation: exact runtime/source of truth; no stale task names, historical checkboxes, or examples that contradict schemas.

## CANON-01: Methodology carries implementation and template detail

Severity: High

Evidence:

- `vibeloom-methodology.md` defines the authority split clearly: manifesto is why, methodology is what, implementation is how.
- The methodology then includes concrete fields such as `intent:` and `defaults:`, a full tech-stack decomposition, DDD container/component rules, and detailed cognitive-surface examples.

Why this is an issue:

The methodology is supposed to be the stable conceptual contract. When it contains template-like fields and implementation mechanics, it becomes longer, harder to remember, and easier to contradict. It also forces every template or engine change to become a methodology edit, which makes the canon less stable.

Fix options:

1. Move concrete field lists and low-level schema examples into `vibeloom-implementation.md`.
   This restores the authority chain: methodology names concepts and invariants; implementation owns executable shape.

2. Keep a small conceptual example in methodology and point to implementation for normative fields.
   This preserves readability without turning methodology into a template spec.

3. Split methodology into a short core and a separate appendix.
   This keeps all material available, but it still leaves two methodology-like documents to maintain.

Recommended fix:

Use option 1 with a small amount of option 2. Keep one compact example only where it clarifies a concept, then send all normative field lists, layouts, and trace shapes to implementation. This improves concision and reduces future drift.

## CANON-02: Implementation task inventory names templates that do not exist

Severity: Critical

Evidence:

- `vibeloom-implementation.md` lists standard task templates such as `generate-component-code.md`, `eval-target.md`, `review-target.md`, `reconcile-code.md`, `reconcile-contract.md`, and several `infer-*` tasks.
- The extracted template tree contains tasks such as `generate-code-component.md`, `eval.md`, `review.md`, `reconcile.md`, and `import.md`.
- `extract-templates.py --check` reports 41 templates match disk, so the extracted tree is internally synchronized with `vibeloom-templates.md`; the stale inventory is in the implementation narrative.

Why this is an issue:

This is a direct executable contradiction. An agent following the implementation doc will look for files that are not present, and an agent following the skill will route to different names. It also undermines confidence in the implementation doc as the runtime source of truth.

Fix options:

1. Replace the stale list with the exact current task inventory from `v03/templates/tasks`.
   This fixes the immediate contradiction but leaves another copied inventory to maintain.

2. Delete the detailed task list from the runtime architecture section and make `vibeloom-templates.md` section 17.3 the only inventory.
   This is more concise and avoids duplicate task lists.

3. Keep the list but label it as non-normative examples.
   This avoids strict contradiction but is weak because task names are operational details.

Recommended fix:

Use option 2. The implementation should define task-template contracts and dispatch semantics, while the template bundle should own the exact inventory. If the implementation needs a list, it should be generated or checked from the template bundle.

## CANON-03: Decision trace identity contradicts itself

Severity: Critical

Evidence:

- The implementation schema uses a decision trace ID such as `DEC-20260502-003`.
- The same area describes rendered decision markdown paths like `decisions/adr/ADR-20260502-003-tax-calculation-strategy.md`.
- The skill references and artifact templates use `<RECORD>-<YYYYMMDD>-<NNNN>` examples such as `ADR-20260502-003`.

Why this is an issue:

Trace identity is a durable replay primitive. If the trace event is `DEC-*` but rendered records are `ADR-*`, the system needs an explicit mapping. Without one, agents may create duplicate IDs, broken backlinks, or rendered decision files that cannot be traced back to their source events.

Fix options:

1. Use `DEC-*` everywhere, including rendered decision files.
   This is the simplest machine model, but it loses familiar human labels such as ADR and PDR.

2. Keep `trace_id: DEC-*` and add a separate `record_id: ADR-*` or `decision_id: ADR-*`.
   This preserves replay consistency while allowing human-facing decision record families.

3. Split decision traces into independent ID families: `ADR-*`, `PDR-*`, `UDR-*`, and `IDR-*`.
   This is human-friendly but weakens the single event-family model.

Recommended fix:

Use option 2. Keep `DEC-*` as the event identity and add a clearly defined rendered record ID. Then update examples, templates, and references to show both fields. This gives agents one replay key and humans one readable decision label.

## CANON-04: The word `root` is overloaded in the ID-prefix registry

Severity: High

Evidence:

- Methodology says graph root items are capabilities and constraints.
- Implementation prefix tables mark several product/system IDs as scope `root`, including definitions, objectives, functional requirements, personas, epics, and journeys.

Why this is an issue:

The implementation may mean "repo-wide scope," but methodology uses root to mean "top of the contract graph." Agents can misread this as permission to create many root graph entities, weakening the capability/constraint spine.

Fix options:

1. Rename the implementation table column from `Scope` to `Allocation scope` or `Namespace`.
   This avoids conflict with graph-root semantics.

2. Add a separate `Graph root?` column and mark only capabilities and constraints as true.
   This makes the distinction explicit.

3. Remove scope from the prefix table and define derivation rules separately.
   This is concise but may make ID allocation harder to scan.

Recommended fix:

Use options 1 and 2 together. Rename the ambiguous column and add a binary graph-root marker. This preserves the useful registry while removing a serious semantic ambiguity.

## CANON-05: Component and bounded-context cardinality is not consistently specified

Severity: High

Evidence:

- Methodology describes a component as a deployable unit that may host one or more bounded contexts.
- Implementation component frontmatter uses `hosted_bounded_contexts`.
- Skill artifact references and templates use singular `bounded_context` and say domain-layer components belong to exactly one bounded context.

Why this is an issue:

This affects decomposition, graph derivation, and code generation. An agent cannot reliably decide whether to split components by bounded context or group several contexts in one deployable component.

Fix options:

1. Canonize multi-context components: components may host one or more bounded contexts, and each bounded context belongs to exactly one component.
   This matches the implementation frontmatter and current methodology wording.

2. Canonize one bounded context per domain component.
   This is simpler and aligns with common DDD practice, but it requires changing implementation examples and some methodology text.

3. Allow both temporarily and require a mapping rule in context artifacts.
   This preserves flexibility but makes generation less deterministic.

Recommended fix:

Use option 1 for v03. It aligns with the existing implementation schema and avoids a wider redesign. If the project later wants stricter DDD alignment, make that a deliberate v04 change.

## CANON-06: Vibe mode is conceptually minimal but runtime cache/status behavior is fuzzy

Severity: Medium

Evidence:

- Methodology says `vibe` mode has no graph, no code-sync, and no formal status model.
- Implementation says `vibe` has approval and decision traces and may have a lightweight `status.json`.
- The skill `init` task says it creates a generation trace and updates the cache graph.

Why this is an issue:

Vibe mode is the on-ramp. If minimal mode still creates graph/cache-like artifacts, the user's mental model breaks early. This also risks reintroducing full-mode mechanics under a lighter label.

Fix options:

1. Clarify that `vibe` can emit ephemeral status summaries but never writes graph cache.
   This preserves helpful status without violating the mode.

2. Allow a lightweight cache in `vibe` and update methodology to say so.
   This is more powerful but weakens the "no graph" promise.

3. Remove all persistent status/cache from `vibe`.
   This is cleanest conceptually but may reduce practical usefulness.

Recommended fix:

Use option 1. Preserve the minimal promise: approval and decision traces are durable; graph cache is not. Status can be computed or summarized without making `vibe` a hidden full-mode.

## CANON-07: The implementation acceptance checklist is stale state inside a canonical spec

Severity: Medium

Evidence:

- `vibeloom-implementation.md` contains an unchecked acceptance checklist.
- Separate build reports indicate major implementation work has been shipped and validated.

Why this is an issue:

A canonical implementation spec should not contain stale project-management state. Readers cannot tell whether unchecked boxes are normative requirements, incomplete work, or simply old status.

Fix options:

1. Convert the checklist into timeless acceptance criteria without checkboxes.
   This keeps the quality bar without implying current state.

2. Move implementation status into build reports only.
   This separates spec from execution history.

3. Update the checkboxes.
   This is quick but will become stale again.

Recommended fix:

Use option 1 and keep live build state in reports. Canon should define what "done" means, not whether a specific pass once completed it.

## CANON-08: The manifesto is strong but too evidence-heavy for a durable canon document

Severity: Medium

Evidence:

- The manifesto includes market claims, 2026 evidence, productivity ranges, cognitive-surface calculations, and competitor-adjacent framing.
- Some of these claims also appear in the marketing site.

Why this is an issue:

Evidence makes the thesis credible, but it ages faster than the thesis. A manifesto that embeds too many time-bound facts becomes harder to maintain and less concise. It also creates duplicate claim surfaces with the site.

Fix options:

1. Split the manifesto into a durable thesis and a separate evidence appendix.
   This keeps the manifesto stable while preserving proof.

2. Keep only the strongest two or three proof points in the manifesto.
   This reduces maintenance while retaining persuasion.

3. Leave evidence in the manifesto but add a dated evidence ledger.
   This improves maintenance but keeps the manifesto long.

Recommended fix:

Use option 1. Keep the manifesto as the durable "why"; move time-bound market evidence to an appendix or site evidence page.

## CANON-09: The same concepts are repeated across all three canon documents

Severity: Medium

Evidence:

- The manifesto, methodology, and implementation all discuss contract-as-eval, contract-as-memory, cognitive surface, delegation, and the same escalation ladder.

Why this is an issue:

Some repetition is useful, but repeated definitions create drift pressure. The reader has to infer which wording is normative. The docs become longer without adding new precision.

Fix options:

1. Assign each concept a single normative home.
   For example: manifesto owns the thesis, methodology owns terms and invariants, implementation owns file/trace/runtime mechanics.

2. Add a short "defined in" cross-reference whenever a concept appears outside its home.
   This allows light repetition without redefining.

3. Merge overlapping sections.
   This improves concision but may weaken the three-document architecture.

Recommended fix:

Use options 1 and 2. Do not merge the canon. Instead, make every repeated concept either a short reminder or a link back to its normative home.

## CANON-10: Small polish defects reduce trust

Severity: Low

Evidence:

- The manifesto uses `hommage` instead of `homage`.
- The implementation says "The plan is build once" instead of "built once."

Why this is an issue:

These are small, but canon documents are authority documents. Typos in core docs create avoidable doubt, especially in a methodology that asks agents to treat wording precisely.

Fix options:

1. Fix the known typos directly.
   Fast and sufficient for current defects.

2. Add a spelling/prose lint pass to review prompts.
   Useful if the docs will keep changing.

3. Ignore until larger structural edits are complete.
   Avoids churn now but leaves visible defects.

Recommended fix:

Use option 1 during the interactive fix pass, then add light prose linting if canon edits continue.

## Recommended Fix Order

1. Resolve identity/cardinality decisions first: decision IDs, root scope, component-to-bounded-context rules.
2. Remove stale implementation task inventory and stale acceptance state.
3. Tighten the methodology/implementation boundary.
4. Split or shorten manifesto evidence.
5. Apply typo/polish fixes.

