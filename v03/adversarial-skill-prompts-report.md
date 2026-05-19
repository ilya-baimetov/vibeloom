# VibeLoom v03 Adversarial Skill and Helper Prompt Review

Scope: `v03/vibeloom-templates.md`, extracted `v03/templates/`, `v03/templates/skill/SKILL.md`, `v03/templates/skill/references/*.md`, `v03/templates/tasks/*.md`, artifact templates, and helper prompts such as `build-engine.md`, `build-skill.md`, `review-canon.md`, `review-site.md`, and `review-skill.md`.

Review posture: adversarial. This report focuses on whether the skill is efficient for agents, whether helper prompts are concise and current, and whether templates faithfully implement the canon.

## Executive Summary

The skill bundle is promising because it is packaged as a canonical extracted template set and `extract-templates.py --check` passes. The main problem is not extraction; it is semantic drift. Several references and task templates disagree with the implementation canon on artifact frontmatter, decision IDs, component-to-bounded-context mapping, routing, task versioning, and side effects. The helper prompts are also too ceremonial for frequent use and contain stale lifecycle assumptions from before the current v03 engine existed.

The recommended direction is to reduce copied canon inside the skill, make routing explicit, and add mechanical checks for links, task versions, and artifact-frontmatter consistency.

## SKILL-01: Artifact frontmatter reference contradicts implementation canon

Severity: Critical

Evidence:

- `templates/skill/references/artifacts.md` describes contract artifact frontmatter with `approval_mode`.
- `vibeloom-implementation.md` says contract artifacts carry `approval_unit`; approval mode is event-level, not artifact-level.

Why this is an issue:

Agents use the skill references at generation time. If the skill tells an agent to emit `approval_mode`, the agent will create artifacts that do not match the runtime model. This is exactly the kind of small schema drift that contract-driven tooling is supposed to prevent.

Fix options:

1. Update `artifacts.md` to match implementation canon exactly.
   This is the fastest correction.

2. Remove the reproduced frontmatter tables from `artifacts.md` and point agents to the implementation doc.
   This reduces drift, but it may increase context loading.

3. Generate the skill reference tables from the implementation doc or a shared schema file.
   This is the strongest long-term fix but requires tooling.

Recommended fix:

Use option 1 immediately, then consider option 3. The current reference is actively wrong and should be corrected before broader prompt optimization.

## SKILL-02: Decision trace templates use conflicting ID models

Severity: Critical

Evidence:

- Implementation examples use `trace_id: DEC-...`.
- Skill references and `artifact/decision-trace.md` use `ADR-...`, `PDR-...`, `UDR-...`, and `IDR-...` as primary IDs.

Why this is an issue:

Decision traces are replay inputs. If the skill writes one ID family and the engine expects another, rendered decisions, backlinks, and trace replay can diverge.

Fix options:

1. Change skill templates to use only `DEC-*`.
   Simple and machine-consistent.

2. Add both `trace_id: DEC-*` and `record_id: ADR-*` or equivalent.
   Preserves human decision-record labels while keeping replay identity stable.

3. Change implementation canon to make ADR/PDR/UDR/IDR the primary trace IDs.
   Human-friendly but less aligned with the current unified trace-family model.

Recommended fix:

Use option 2 after the canon decision is confirmed. The skill should mirror that decision everywhere: artifact template, reference doc, runtime reference, and task instructions.

## SKILL-03: Component bounded-context fields are inconsistent

Severity: High

Evidence:

- Implementation component frontmatter uses `hosted_bounded_contexts`.
- `templates/skill/references/artifacts.md` and component templates use singular `bounded_context`.
- Some text says a domain component belongs to exactly one bounded context.

Why this is an issue:

This changes how agents decompose the system. It also affects graph derivation, context maps, and code generation boundaries.

Fix options:

1. Standardize on `hosted_bounded_contexts` as a list.
   Aligns with current implementation canon.

2. Standardize on singular `bounded_context`.
   Simpler for agents, but requires changing implementation and methodology language.

3. Allow both and normalize internally.
   Backward-compatible but creates unnecessary schema complexity in v03.

Recommended fix:

Use option 1 if v03 keeps the current implementation model. Do not let the skill carry a stricter DDD interpretation than the canon.

## SKILL-04: Skill routing is incomplete and sometimes wrong

Severity: High

Evidence:

- `SKILL.md` lists engine commands but omits `decisions render`, which exists in the engine CLI.
- `generate <target>` routes to `tasks/generate-<target>.md`, but code generation is `generate-code-component.md`.
- `references/modes.md` mentions `help`, but there is no corresponding task template or explicit routing behavior.

Why this is an issue:

The skill is the agent-facing command surface. Ambiguous routing wastes tokens, causes wrong template loads, and makes the system feel less deterministic.

Fix options:

1. Replace pattern-based routing with an explicit command-to-template mapping table.
   This is clearest for agents and avoids filename inference bugs.

2. Add aliases or shim task files for the inferred names.
   This preserves current routing but adds maintenance artifacts.

3. Remove unsupported command mentions such as `help`.
   This is clean unless those commands are intentionally planned.

Recommended fix:

Use option 1 and remove unsupported commands unless they are implemented. Explicit routing is cheap and improves agent efficiency.

## SKILL-05: Skill reference links are broken

Severity: High

Evidence:

- `references/eval.md` links to `../../vibeloom-methodology.md`, which does not resolve from the extracted skill path.
- `references/runtime.md` links to `../vibeloom-implementation.md`, which does not resolve.
- `references/troubleshooting.md` links to `../vibeloom-methodology.md`, which does not resolve.

Why this is an issue:

The skill intentionally uses load-on-demand references. Broken reference links make that strategy unreliable and force agents to guess or search.

Fix options:

1. Fix the relative paths in the extracted templates and canonical template bundle.
   Direct and sufficient.

2. Use repository-root-relative path notation in references.
   More readable, but agents still need to resolve paths correctly.

3. Remove markdown links and name the source docs in plain text.
   Avoids broken links but reduces navigation usefulness.

Recommended fix:

Use option 1 and add a link-check script. Broken links are machine-detectable and should not require manual review.

## SKILL-06: Task templates lack required task-template-version trailers

Severity: High

Evidence:

- `vibeloom-implementation.md` says every task template carries a `task-template-version` trailer.
- Most `templates/tasks/*.md` files do not contain such a trailer.

Why this is an issue:

Task-template versions are needed for trace reproducibility. Without them, a future approval or generation trace cannot reliably say which prompt contract produced the result.

Fix options:

1. Add `task-template-version: 0.3.0` or equivalent to every task template.
   Directly matches implementation canon.

2. Move versioning into YAML frontmatter at the top of each task.
   Easier to parse, but it changes the specified trailer model.

3. Remove the trailer requirement from implementation.
   Simpler, but weakens replay and auditability.

Recommended fix:

Use option 1 for v03. It is the smallest change and keeps the implementation promise intact.

## SKILL-07: Some task templates add side effects that the canon does not define

Severity: High

Evidence:

- `tasks/init.md` says it emits a generation trace and updates the cache graph.
- `tasks/approve.md` auto-invokes downstream generation after approval.
- `tasks/review.md` says reviewing an approved item auto-reopens it to draft.
- The methodology and implementation describe these operations more conservatively.

Why this is an issue:

Hidden side effects reduce interactive control. They also blur mode boundaries: approval becomes generation, review becomes mutation, and vibe init starts to look like graph initialization.

Fix options:

1. Trim each task to the side effects explicitly defined by canon.
   This makes operations predictable.

2. Keep side effects but mark them as orchestrator policies, not task-template obligations.
   This allows automation while preserving operation semantics.

3. Update canon to bless the side effects.
   This may be appropriate later, but it should be a deliberate product decision.

Recommended fix:

Use option 1 now, with option 2 for auto-advance behavior. The skill should not surprise the user or mutate state beyond the invoked operation.

## SKILL-08: Severity and gate vocabulary drifts across references

Severity: Medium

Evidence:

- Some references use `blocking`.
- Eval references use `breaking` and `advisory`.
- Approval guardrails talk about zero blocking semantic findings.

Why this is an issue:

Approval gates depend on vocabulary. If `breaking` and `blocking` are synonyms, the docs should say so. If they are different, the decision boundary must be explicit.

Fix options:

1. Define one severity taxonomy and update all references.
   Best for simplicity.

2. Use two axes: semantic severity (`breaking`/`advisory`) and gate effect (`blocking`/`non-blocking`).
   More precise but slightly more complex.

3. Keep both terms and add a mapping note.
   Quick but less clean.

Recommended fix:

Use option 2 only if the distinction is real. Otherwise use option 1. Approval logic should not depend on inferred synonyms.

## SKILL-09: Helper review prompts are too long and duplicate the same ceremony

Severity: Medium

Evidence:

- `review-canon.md`, `review-site.md`, and `review-skill.md` all contain long setup, clean-worktree, packet, report, and commit/checkpoint workflows.
- They repeat similar interactive loops instead of sharing one short review protocol.

Why this is an issue:

Long helper prompts consume context and slow agents down. They are useful for formal passes, but inefficient for frequent adversarial review or small fixes.

Fix options:

1. Factor the common review loop into one shared reference and make each review prompt domain-specific.
   Reduces duplication while preserving rigor.

2. Add concise "lite" variants for fast audits.
   Gives agents the right tool for small work.

3. Keep the prompts as-is and rely on agents to skim.
   This wastes context and increases inconsistent behavior.

Recommended fix:

Use option 1 and add a short adversarial-audit mode. The domain prompts should mostly specify scope, issue schema, and domain-specific checks.

## SKILL-10: Helper prompts contain stale lifecycle assumptions

Severity: High

Evidence:

- `build-engine.md` assumes there is no `engine/` directory, but v03 now has one.
- `review-skill.md` says behavioral testing is deferred until engine v0.4+, while v03 already has an engine and build-skill smoke tests.
- `build-skill.md` references exact implementation line numbers that have drifted.

Why this is an issue:

Helper prompts are executable instructions. Stale preconditions cause agents to redo work, skip available verification, or trust line numbers that no longer point to the intended sections.

Fix options:

1. Update stale instructions to reflect current v03 state.
   Fast and necessary.

2. Mark build prompts as historical "from scratch" prompts and create separate maintenance prompts.
   More honest and less confusing.

3. Replace line-number references with section names or anchors.
   Reduces future drift.

Recommended fix:

Use options 1, 2, and 3. Build prompts should say whether they are historical rebuild prompts or current maintenance prompts.

## SKILL-11: Build reports give false confidence relative to current defects

Severity: Medium

Evidence:

- Build reports claim checks passed.
- Current static inspection found broken reference links, missing task-template-version trailers, and schema mismatches.

Why this is an issue:

Reports that look final but miss material defects become misleading artifacts. Future agents may treat them as proof that the skill is sound.

Fix options:

1. Mark build reports as historical and dated.
   This prevents them from being mistaken for current validation.

2. Regenerate build reports after the interactive fix pass.
   This restores confidence.

3. Add an "audit deltas" section that lists known defects after the build report.
   Useful if reports must remain in place.

Recommended fix:

Use option 1 immediately and option 2 after fixes. Historical reports should not read like current certification.

## SKILL-12: The skill reproduces too much canon, increasing drift risk

Severity: Medium

Evidence:

- Skill references reproduce artifact frontmatter, ID allocation rules, operation semantics, mode rules, and runtime details.
- Several reproduced copies now disagree with canon.

Why this is an issue:

The skill needs concise operational summaries, but copied canon tables become a second source of truth. Every copied rule needs a validation strategy or it will drift.

Fix options:

1. Replace reproduced tables with short operational deltas and source-document pointers.
   Most concise and least drift-prone.

2. Generate copied references from canonical schemas or source sections.
   Stronger for agent ergonomics but requires tooling.

3. Keep copies and add manual review instructions.
   Better than nothing, but manual checks already failed.

Recommended fix:

Use option 1 for prose-heavy rules and option 2 for schema tables. Agents should get compact guidance, while exact schema should come from one canonical source.

## Recommended Fix Order

1. Align schema-critical references: artifact frontmatter, decision IDs, component bounded-context fields.
2. Fix routing, broken links, and task-template-version trailers.
3. Remove hidden side effects from task templates.
4. Normalize severity/gate vocabulary.
5. Refactor helper prompts into concise current maintenance prompts and clearly historical build prompts.
6. Regenerate or supersede build reports after fixes.

