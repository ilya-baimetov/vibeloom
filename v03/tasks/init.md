<!--
VibeLoom task template: init
Operation: init
Invoked by: SKILL.md when user runs `/vibeloom init --mode <mode> "<intent prose>"`
-->

# Task: init

## Purpose

Bootstrap an ungoverned repo with a draft `intent-specs` tier in the chosen mode.

## Inputs

- `--mode`: required. One of `vibe | pm | dev | ux | expert`.
- `--upgrade` (optional): if present, upgrade an existing vibe project to a full mode. Vibe → full is one-way.
- Intent prose (positional argument): one-sentence to one-paragraph description of what the project is for.
- Existing repo state: zero or more files at `./` (for upgrade case, includes prior `intent.md`, `defaults.md`, `system.md`, `.vibeloom/traces/`).

## Preconditions

- Working directory is writable.
- For non-upgrade: `./intent.md` does not exist (new project).
- For `--upgrade`: `./intent.md` exists, `./.vibeloom/traces/approvals.jsonl` exists, current mode is `vibe`.

## Steps

1. Validate mode + flags.
2. Materialize `intent.md` from the appropriate template:
   - `vibe`: `templates/artifacts/intent-specs/vibe-intent.md`
   - All other modes: `templates/artifacts/intent-specs/intent.md`
3. Materialize `defaults.md` from `templates/artifacts/intent-specs/defaults.md`. Pre-fill the Tech Stack section with empty fields (the user fills in or the agent infers from intent prose).
4. For `ux` mode: also create empty `ux-specs/mockups/` directory.
5. For full modes (pm/dev/ux/expert): create empty `prd.md`, `usm.md`, `dm.md` (and `ux.md` for ux mode), `system.md`, `containers.md` placeholders to make the structure visible.
6. For full modes (pm/dev/ux/expert): run engine `parse` to extract IDed items from the new `intent.md` and `defaults.md` into the contract-graph cache; then run engine `eval --target intent-specs` for structural checks. For `vibe`: run compact checks over visible artifacts; the engine may derive private scaffolding, but no public graph is exposed.
7. Emit traces recording the init invocation. Full modes record generation plus decision provenance; vibe at minimum records the init decision and may record generation/private-scaffold provenance if produced.
8. Surface findings to user; recommend next operation (`/vibeloom review intent-specs` or `/vibeloom approve intent-specs` if eval is clean).

## Output

- New artifacts: `intent.md`, `defaults.md`, mode-specific placeholders, optional `ux-specs/mockups/`.
- New trace entry in `.vibeloom/traces/generations.jsonl` when generation/scaffolding work is performed.
- Full modes: `.vibeloom/cache/contract-graph.json` updated. Vibe: optional private scaffolding may be updated, but no public graph surface is created.
- Status report emitted; in vibe it remains a one-screen orientation report.

## Postconditions

- Mode is set; selected layout (full or compact per implementation §2) is scaffolded.
- Draft `intent.md` and `defaults.md` exist (or seeded from `--upgrade` source).
- ID registry is initialized at `.vibeloom/state/id-registry.json` with empty next-counters.
- One `decision` trace written with `record_type: general`, `topic: init`, `payload: {mode}`.

## Constraints

- Never overwrite an existing `intent.md` unless `--upgrade` is set.
- The Tech Stack section in `defaults.md` is structured per layer (presentation / application / domain / infrastructure); fields left empty signal "agent decides reasonably."
- For `--upgrade`: preserve prior approval traces; emit a new generation trace with `task_template_id: init-upgrade` for migration audit.

## Invariants

- Only writes to a greenfield repo (`.vibeloom/` did not exist before invocation), unless `--upgrade` is in effect.
- Existing files outside the scaffolded layout are not touched.

## Validation

- Structural eval runs and must pass before recommending approval.
- Mechanical runners are not invoked at init (no code yet).
- Heuristic semantic eval is skipped at init unless intent prose is long enough to warrant it.

## Failure modes

- Existing `intent.md` and not `--upgrade`: surface conflict, abort.
- Mode invalid: surface error, list valid modes.
- Engine parse fails: surface parse error with line numbers, abort before writing further artifacts.

<!-- task-template-version: 0.3.0 -->
