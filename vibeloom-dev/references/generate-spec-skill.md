# Spec: generate skill

Target-specific procedure for `vibeloom-dev generate skill`. Loaded on demand by `tasks/generate.md`.

Produce/update `vNN/skill/` from current `vNN/canon/vibeloom-implementation.md` + `vNN/canon/vibeloom-templates.md`. Mostly mechanical (run the template extractor); also regenerates the engine when implementation introduces a structural skill-bundle refactor.

## Purpose

- Materialize the skill bundle from canon.
- Two phases: (a) mechanical extraction of templates into the bundle file layout; (b) engine regeneration if implementation has changed in ways that warrant it.

## Inputs

- `--version <vNN>` (optional, default = latest mutable).
- Upstream: `vNN/canon/vibeloom-implementation.md`, `vNN/canon/vibeloom-templates.md`.

## Preconditions

- implementation.md and templates.md exist and are consistent (user's responsibility).
- `vibeloom-dev/scripts/extract-templates.py` exists and is executable.
- The user has committed or stashed any recent skill/ edits (so `reconcile skill` can show what changed).

## Steps

1. **(Optional) Pre-extraction drift check.** If `vNN/skill/` already exists with extracted content from a prior run, you can detect drift between the current source and the on-disk tree:
   ```bash
   python3 vibeloom-dev/scripts/extract-templates.py --check --source vNN/canon/vibeloom-templates.md --dest vNN/skill/
   ```
   The `--check` mode is a **drift detector**, not a parse validator: it materializes templates in-memory and compares each one to its disk counterpart, reporting missing/different files. If the destination is empty or stale (e.g., first extraction, or you just rewrote templates.md), `--check` will report large drift — that is expected, not an error. Skip this step if you are doing a fresh extraction.

2. **Extract templates into `vNN/skill/`.** This is the actual extraction step, and it ALSO acts as the parse validator (if any fenced block is malformed, the extractor exits with an error before writing):
   ```bash
   python3 vibeloom-dev/scripts/extract-templates.py --source vNN/canon/vibeloom-templates.md --dest vNN/skill/
   ```
   This produces:
   - `vNN/skill/SKILL.md`
   - `vNN/skill/subagent-prompt.md`
   - `vNN/skill/references/*.md`
   - `vNN/skill/tasks/*.md`
   - `vNN/skill/artifacts/<tier>/*.md`
   
   The extractor is deterministic: it parses fenced blocks tagged `template:<path>` and writes their bodies to `<dest>/<path>`, creating directories as needed. If extraction succeeds end-to-end, every fence is well-formed.

3. **Assess engine regeneration need.** Run this five-point detection checklist; record findings as you go:

   | # | Compare implementation section | Against engine module | Trigger if mismatch |
   |---|---|---|---|
   | 3.1 | `## Operations` (list of operations exposed via CLI) | `vNN/skill/engine/vibeloom_engine/cli.py` — the argparse command registry | Operation added, removed, or renamed |
   | 3.2 | `## Trace schemas` (trace families and their JSON shape) | `vNN/skill/engine/vibeloom_engine/traces.py` (or `cache.py` if traces live there) | New trace family, field added/removed, or schema shape changed |
   | 3.3 | `## ID schema` (entity-type → prefix mapping; ID format rules) | `vNN/skill/engine/vibeloom_engine/registry.py` or `ids.py` | Prefix added, format rule changed |
   | 3.4 | `## Dispatch plan` (wave assembly logic, parallel semantics, subagent task header) | `vNN/skill/engine/vibeloom_engine/dispatch.py` | Plan/wave logic changed, header schema changed |
   | 3.5 | `## Schemas` (artifact frontmatter shape; layer-aware fields) | `vNN/skill/engine/vibeloom_engine/models.py` | Field added/removed/renamed in any frontmatter type |

   **Decision:**
   - If ALL five rows match (no mismatches): engine is up-to-date. **Skip step 4.**
   - If ANY row mismatches: engine is stale. Proceed to step 4 AFTER user confirmation.

   **Surface to user** with concrete evidence:
   ```
   Engine assessment:
     3.1 Operations:   [match | MISMATCH: <what differs>]
     3.2 Traces:       [...]
     3.3 IDs:          [...]
     3.4 Dispatch:     [...]
     3.5 Schemas:      [...]
   Engine status: <up-to-date | STALE — see mismatches above>.
   Regenerate engine? (y/n)
   ```
   If user says no (or all rows match): skip step 4. Otherwise: proceed.

4. **Regenerate engine (only if step 3 deemed it necessary).**
   - For each engine module that needs changes, generate updated code. The engine is deterministic Python (no LLM at runtime); the regeneration is offline. Modules to consider: parser, registry, models (schemas), graph, dispatch, eval, staleness, cache, traces, validation_registry, status, affected, cli.
   - Write updates in place.
   - Keep tests in sync: any new operation needs a test in `vNN/skill/engine/tests/`.
   - Ensure the package still imports: `vibeloom_engine` must be importable from the `engine/` directory.

5. **Sanity checks.**
   - SKILL.md frontmatter parses (valid YAML between `---` markers).
   - Every routing entry in SKILL.md points to an existing `tasks/<file>.md`.
   - Every reference in SKILL.md's "Runtime references" points to an existing `references/<file>.md`.
   - Every artifact template path mentioned in SKILL.md exists in `artifacts/`.
   - If engine was regenerated: `python3 -m vibeloom_engine --help` (from `vNN/skill/engine/`) prints usage without error.

6. **Print summary.**
   - Templates extracted: count, list of new/modified/unchanged files.
   - Engine: untouched OR regenerated (with list of modified modules).
   - Validation gate results (pass/fail per gate).
   - Suggested next: `git diff vNN/skill/` then `vibeloom-dev reconcile skill`.

## Output

- `vNN/skill/**` updated in place (SKILL.md, subagent-prompt.md, references/, tasks/, artifacts/, optionally engine/).
- A printed summary.

## Postconditions

- skill/ matches what templates.md materializes (zero drift between source-of-truth canon and extracted skill).
- If engine was regenerated, it imports cleanly and tests run.
- No canon (implementation.md, templates.md, manifesto, methodology, intent) is modified.
- No site artifact is modified.

## Constraints

- **Extractor is deterministic.** No LLM judgment in step 2. If the extractor produces wrong output, the bug is in the extractor or in templates.md (malformed fence), not in the skill.
- **Engine regen is non-trivial.** Only do it when implementation clearly warrants. When in doubt, ask the user.
- **Engine package name is fixed.** `vibeloom_engine` (the importable module name = the folder name). Never rename.
- **Don't touch tests beyond what's necessary** to keep them passing for new operations.
- **No side effects on the running agent's environment.** Don't `pip install` anything. The engine is `python3 -m vibeloom_engine` only.

## Invariants

- After step 2: re-running `extract-templates.py --check --source vNN/canon/vibeloom-templates.md --dest vNN/skill/` reports no drift (the just-extracted tree matches the source).
- After step 5: SKILL.md is loadable by Claude/Codex skill loaders (frontmatter valid, no broken internal links).
- engine/ folder name = `vibeloom_engine` (the importable package name).

## Failure modes

- **Extractor fails during extraction (step 2).** The fence convention in templates.md is broken (missing 4-backtick close, wrong tag format, etc.). Surface the specific line and tag.
- **`--check` reports unexpected drift (step 1, when the destination was thought to be in sync).** Compare the differing files manually; either the source changed and you need a full extraction (step 2), or the destination was manually edited (review the edits before overwriting).
- **A fence-tag path is malformed** (e.g., uses old-layout `template:skill/SKILL.md` prefix). Halt at step 2 with the specific tag; the user must fix templates.md.
- **Engine regen breaks tests.** Halt. Show which tests failed; ask the user how to proceed. Options: rollback engine changes, accept failing tests temporarily, or iterate on the regen.
- **Engine regen would require restructuring** (e.g., implementation adds a whole new trace family that needs a new module). Surface the scope; ask user to confirm.

## Validation gates

- After step 2: `python3 vibeloom-dev/scripts/extract-templates.py --check --source vNN/canon/vibeloom-templates.md --dest vNN/skill/` exits 0.
- After step 2: `find vNN/skill -type f -name "*.md" | wc -l` matches the count of `template:` fenced blocks in templates.md.
- After step 4 (if engine regenerated): `python3 -m vibeloom_engine --help` succeeds.
- After step 5: SKILL.md frontmatter validates with the target skill loaders.
- Summary's counts match actual file counts.
