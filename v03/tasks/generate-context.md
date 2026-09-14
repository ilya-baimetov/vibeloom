<!--
VibeLoom task template: generate-context
Operation: generate
Invoked by: SKILL.md when user runs `/vibeloom generate context` or as part of a top-down generation cascade after system-specs is approved
-->

# Task: generate-context

## Purpose

Generate or repair context artifacts from approved contract. Full modes generate root + per-container + per-component AGENTS.md / CLAUDE.md plus per-component BDD scenarios. Vibe generates only root assistant guidance from compact artifacts. Context is regenerable from approved contract — never approved as its own tier.

## Inputs

- `target_tier`: `context` (fixed)
- `mode`: pm / dev / ux / expert (any full mode; in vibe, only root AGENTS.md is generated, no BDD)
- `affected_ids`: optional. Item IDs that triggered the regeneration.
- Approved upstream: full contract in full modes; compact intent/defaults/system in vibe.
- Mode-specific assistant slugs (e.g. `claude`, `codex`) for which to generate config files.

## Preconditions

- All contract tiers in scope for the mode are `approved`.
- Full modes: working directory contains the materialized container/component directory tree.
- Vibe: root project directory exists; no public container/component tree is required.

## Steps

1. Load approved contract:
   - Full modes: via engine `parse + graph`.
   - Vibe: from compact artifacts; private scaffolding may help generation but is not user-facing contract.
2. For each (assistant slug × scope), generate the corresponding config artifact:
   - **root**: `AGENTS.md`, `CLAUDE.md` (one per assistant) at repo root. Includes governance summary, mode, contract inventory pointers, current run state.
   - **per-container**: `<container>/AGENTS.md`, `<container>/CLAUDE.md`. Includes container layer + deployment target + resident BCs (domain only) + component inventory + dependency edges.
   - **per-component**: `<container>/<component>/AGENTS.md`, `<container>/<component>/CLAUDE.md`. Includes component IFs / DEPs / BEHs / NOTEs + ownership boundary + load-set hints.
3. For each component (full modes only — not vibe), generate per-behavior `<container>/<component>/context/bdd/BEH-####.md` Gherkin scenarios:
   - SCN-#### derives from ACC, INV, BEH, STORY.
   - Non-executable Gherkin (Given / When / Then) — runnable later via the contract-conformance or bdd validation runners.
4. Run structural checks:
   - Full modes: engine `parse + eval --target context` (frontmatter validity, derives_from references resolve to approved upstream).
   - Vibe: root assistant guidance references compact intent/defaults/system and stays concise.
5. Run heuristic semantic eval for context-sufficiency (does each component have enough context for a subagent to act in scope without late-fetching?).
6. Emit a `generation` trace recording basis_ids, output_artifact_ids (the config + bdd files generated).

## Output

- AGENTS.md, CLAUDE.md at root + per container + per component.
- BDD scenario files in <container>/<component>/context/bdd/.
- New trace entry in .vibeloom/traces/generations.jsonl.
- Derived runtime state updated as appropriate for the mode.
- Findings.

## Postconditions

- Scope-appropriate `AGENTS.md` / `CLAUDE.md` files exist for the targeted scopes (root, container, component).
- Full modes: BDD scenarios materialized as `BDD-####-<slug>.md` files under `<container>/<component>/context/bdd/` for relevant components.
- Vibe: no BDD files are generated.
- Generation trace written.

## Constraints

- Context is NOT approved like contract. The fix path for bad context is to amend the upstream contract and regenerate. Don't introduce content that isn't traceable to approved contract.
- Per-scope configs reference contract item IDs but don't restate contract content (avoid duplication).
- Decision context (load-bearing decisions) is a queried view over decision traces, not a duplicated section in config files. Configs link to the live query (`vibeloom decisions list --load-bearing --affecting <scope-id>`).
- BDD scenarios are generated only in full modes. Vibe mode skips BDD entirely.

## Invariants

- Contract artifacts (intent/product/ux/system) are not modified.
- Context artifacts carry no `status` or `approval_unit` — no approval gate applies.

## Validation

- Structural eval must pass.
- Semantic eval includes context sufficiency check ("can a subagent act in scope CMP-0012 from this load set alone, without late-fetching?").
- Mechanical runners not invoked at this tier (BDD scenarios are runnable via contract-conformance or bdd runner once code exists).

## Failure modes

- Missing approved contract: abort, surface "approve all contract tiers in scope first."
- Per-component context too large (exceeds practical token budget): surface advisory; consider decomposing the component.
- BDD generation produces redundant or contradictory scenarios: surface as findings; user resolves via review.

<!-- task-template-version: 0.3.0 -->
