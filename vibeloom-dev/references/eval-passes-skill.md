# Reference: eval-passes-skill

Adversarial review passes for `eval skill`.

Adapted from v03's `review-skill.md`.

## Goal

Check that the skill bundle (`vNN/skill/**`) faithfully materializes canon (implementation + templates), is internally consistent (SKILL.md routing matches actual tasks/), and is operationally adequate for Claude/Codex skill loaders.

## Scope

The skill bundle includes:
- SKILL.md (the manifest)
- subagent-prompt.md
- references/ (load-on-demand docs)
- tasks/ (one prompt per operation)
- artifacts/ (templates per spec layer)
- engine/ (Python package)

## Source map (build first)

For the skill bundle, extract:
- SKILL.md frontmatter (name, description, and any loader-supported metadata).
- Authoritative sources block (which canon files it cites).
- Runtime references list and what each covers.
- Templates inventory (artifact + task + helper).
- Engine command list.
- Substrate definition (cache vs traces).
- Command routing table (operation → first load + task template + notes).
- Guardrails list.

## Attack passes

### A. Coverage and load map

- Every operation listed in SKILL.md routing has a corresponding `tasks/<op>.md` that exists.
- Every reference listed in SKILL.md exists in `references/`.
- Every artifact template path mentioned in SKILL.md exists in `artifacts/`.
- The engine command list in SKILL.md matches what `vibeloom_engine/cli.py` actually exposes.
- No orphaned files in skill/ (file exists but isn't referenced anywhere — likely dead).

### B. Canon and implementation alignment

- Skill's modes list matches methodology's modes.
- Skill's operations list matches methodology's operations.
- Skill's trace families match implementation's trace schemas.
- Skill's status taxonomy matches methodology's status taxonomy.
- Schema examples in skill match implementation's schemas (field names, ID prefixes, frontmatter shape).

### C. Agent efficiency

- SKILL.md is concise enough to live in the agent's context window without crowding out per-task templates.
- Per-task templates are scoped (don't redundantly include load-on-demand reference content).
- Subagent prompt template uses scoped load sets (doesn't ask the subagent to load the whole skill).
- Late-fetch policy is stated in references/runtime.md and respected by per-task templates.

### D. Inter-template consistency

- Every task template that says "load <reference>" — the reference exists and contains what the task expects.
- Every artifact template's frontmatter matches the schema in implementation.md.
- Cross-references between task templates (e.g., review.md mentions reconcile.md) point to actual files.
- Decision vocabulary in reference files matches what task prompts use.

### E. Helper prompt quality

- subagent-prompt.md correctly wraps the task header from implementation §13.4.
- Any other helper prompts (extract-templates input, etc.) match what scripts/ actually consumes.

### F. Known failure probes

- SKILL.md frontmatter is valid YAML (parses without error).
- SKILL.md has no unsupported frontmatter keys for the target loaders.
- Every link in SKILL.md (markdown link `[text](path)`) resolves to an existing file.
- Engine package imports cleanly (`from vibeloom_engine import X` works in tests).
- Engine `python3 -m vibeloom_engine --help` runs without exception.
- Templates inventory in implementation matches extracted templates in skill bundle (run `extract-templates.py --check` and verify zero drift).

## Finding quality bar

Same as eval-passes-canon.md. Per finding: id (`SKILL-001`), severity, location, issue, why, fixes, recommended, verification, downstream.

## Priority order

1. SKILL.md frontmatter or load failures (skill won't load at all).
2. Routing → task template mismatches (commands won't dispatch).
3. Canon/implementation alignment violations (skill says one thing, canon says another).
4. Engine import/CLI failures.
5. Inter-template consistency.
6. Concision / polish.

## Anti-patterns

- Asking the skill to be "self-contained" (it should NOT duplicate canon content — references suffice).
- Adding new concepts in skill that don't exist in implementation (skill is a materialization, not a definition).
- Confusing "skill bundle docs" with "user-facing site" (different audiences, different registers).
