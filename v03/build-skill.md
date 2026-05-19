# Build the v0.3 vibeloom skill bundle

> **Historical from-scratch prompt.** This document is the original prompt that produced the current `v03/templates/` skill bundle. It was written assuming a **greenfield build** — i.e. no `templates/` directory exists. The extracted bundle now exists. For ongoing maintenance, edit `v03/vibeloom-templates.md` (the canonical source) and re-run `python3 v03/extract-templates.py`. Use this prompt only for full v0.4+ rebuilds against a future spec.

A prompt for Claude Code (or any equivalent agentic coding tool). The agent extracts templates, validates the skill manifest (statically — Step 10a), smoke-tests against fresh repos in two modes, packages the deployable bundle, and queues the live Claude Code load test for the human (Step 10b).

This prompt names **what** must happen, not how. Bundle layout, manifest format choices, packaging strategy, smoke-test orchestration — those are the agent's call. The agent should consult `vibeloom-implementation.md`, `vibeloom-methodology.md`, and the templates source as the authoritative inputs.

This prompt assumes [`build-engine.md`](build-engine.md) has already been run and the engine passes its acceptance checklist. If not, run that first.

This prompt is itself codæ-shaped — Inputs, Preconditions, Steps, Output, Postconditions, Constraints, Invariants, Validation, Failure modes — for the same reason as the engine build: the construction of vibeloom should follow vibeloom's own discipline.

**Time-budget calibration.** This is a half-day build for a focused agent (extraction → manifest validation → smoke tests → bundling → release notes). If a step takes hours, stop and ask whether you're solving the spec or solving something the spec doesn't ask for.

---

## Purpose

Assemble the v0.3 vibeloom skill bundle from canonical sources: the engine (built by `build-engine.md`), the templates (extracted from `vibeloom-templates.md`), and the skill manifest. Verify the bundle works end-to-end in `vibe` and `pm` modes on smoke-test repos (by simulating the skill's routing — the agent itself cannot recursively load the skill). Produce a deployable skill package designed for Claude Code or Codex to load (the human runs the live load test post-handoff).

## Inputs

- **`v03/engine/`** — built by `build-engine.md`, all engine tests passing, §16 engine-related acceptance items checked off.
- **`v03/vibeloom-templates.md`** — canonical source for every template (skill manifest, subagent prompt, skill references, task templates, artifact templates, decision-trace template, validation-registry template, README). Total count is declared in impl §17.3 and may evolve.
- **`v03/extract-templates.py`** — the deterministic extractor with `--check` drift mode.
- **`v03/vibeloom-implementation.md`** — for §16 acceptance checklist and §17 templates inventory + per-family contracts.
- **`v03/vibeloom-methodology.md`** — for smoke-test workflow expectations (§16).

## Preconditions

- `v03/engine/` exists; engine tests pass; engine-related items in impl §16 are checked off.
- All input files present.
- Python 3.10+ and `git` available.
- (For Step 10b only — the human's post-handoff task) a working Claude Code installation will be available for the live load test. The agent itself does not need this; Step 10a is static validation only.
- No partial `templates/` from a prior failed run; if one exists, regenerate from source first.

## Steps

1. **Extract templates and verify round-trip.** Use `extract-templates.py` in default mode then `--check` mode. Drift must be zero. The expected template count is declared in impl [§17.3 Templates inventory](vibeloom-implementation.md#173-templates-inventory) (currently 41, but **the spec evolves and that count may be different at your run-time** — trust the section, not this prompt's frozen number).

   When the extracted count doesn't match §17.3:
   - **If §17.3 was recently updated** (newer than the extracted-count expectation in your scratchpad): the spec changed; trust the spec; update your expectation; proceed.
   - **If §17.3 is unchanged but extraction shows a different count:** the source `vibeloom-templates.md` has drifted from the spec. Stop. Surface the gap in your final report; do not bundle until §17.3 and `vibeloom-templates.md` agree.

   **Verify:** `extract-templates.py --check` exits 0; extracted count matches §17.3 (or you've documented and resolved the gap per the rule above); no leftover `templates/` files from prior runs (regenerate from source if any are present).

2. **Validate the skill manifest** at `templates/skill/SKILL.md`. Confirm:
   - Frontmatter is well-formed YAML and complete per the SKILL.md template's contract (per impl §17.3 and `vibeloom-templates.md`).
   - Body sections are present and ordered as the template requires (when-to-use, authoritative sources, runtime references, templates, engine, substrate, command routing, failure recovery, getting started, guardrails, response shape).
   - Every `references/<file>.md` mentioned is present in `templates/skill/references/`.

   If anything is missing, fix at the source (`vibeloom-templates.md`), re-extract, retry. **Never hand-edit the extracted `templates/` tree.**
   **Verify:** YAML frontmatter parses cleanly; no `{{template-source-placeholder}}` strings or `[TODO]` markers leaked into the body; every reference path resolves to a real file in `templates/skill/references/`.

3. **Verify task-template family contract.** Every template under `templates/tasks/` must have the canonical 10 sections in order: Purpose / Inputs / Preconditions / Steps / Output / Postconditions / Constraints / Invariants / Validation / Failure modes (per impl §12.1 and §17.3). A template with any other shape is a contract violation — fix at the source.
   **Verify:** for each `templates/tasks/*.md`, the 10 H2 headings appear in canonical order. Compute and report a per-template compliance score (10/10 = passing). Any score <10/10 blocks bundling.

4. **Verify artifact-template frontmatter shapes.** For every contract artifact template (intent-specs, product-specs, ux-specs, system-specs), the frontmatter must carry the v0.3 fields including `approval_unit`. For the system-specs templates, the layer-aware fields per impl §6.3 / §6.4. Context artifact templates must not carry `status` or `approval_unit`. Per impl §6 and §17.3.
   **Verify:** every contract-artifact template parses with `status` + `approval_unit` present; every context-artifact template parses without them; every system-specs template carries `layer` (enum from §6.4). Report the per-template frontmatter compliance.

5. **Verify ID prefix registry consistency.** The prefix registry in `templates/skill/references/artifacts.md` must match `vibeloom-implementation.md` §5.1. If they disagree, the implementation doc wins; the skill reference is a bug.
   **Verify:** diff the prefix tables (skill reference vs. impl §5.1) row-by-row. Report any divergence; do not bundle until they match. Fix at the source (`vibeloom-templates.md`'s `references/artifacts.md` block).

6. **Smoke-test the vibe-mode pipeline end-to-end.** The agent running this prompt cannot recursively load and drive the skill within its own session. **Smoke-test = drive the engine CLI calls the skill manifest documents.** Open `templates/skill/SKILL.md`'s `## Command routing` section. For each user command listed there (e.g. `init --mode vibe`, `eval intent-specs`, `approve intent-specs`), extract the underlying engine CLI invocations the skill says it will route to. Execute those exact invocations against a fresh `/tmp` repo. **The smoke test verifies the manifest's routing accuracy, not just the engine's behavior** — if the manifest says route X but the engine has no command X, that's a bundle bug.

   Run on a fresh scratch repo under `/tmp`. At minimum, the scenario covers:

   - `init --mode vibe`: layout per impl §2.2 is materialized; intent / defaults / system / per-assistant configs at root; `.vibeloom/traces/` initialized; **no** `.vibeloom/cache/` (vibe is genuinely minimal — methodology §5.1).
   - `eval intent-specs`: clean state, no blocking findings.
   - `approve intent-specs`: an approval trace appears; lifecycle flips to approved.
   - Direct edit on an approved artifact: `detect-edits` flags it; `status` reflects the drift.

   The smoke test passes when every command emits well-formed JSON, exit codes match the documented semantics, and the documented post-conditions hold.
   **Verify:** capture a transcript of every engine invocation + its JSON response into `/tmp/<scratch-repo>/smoke-vibe.log`. The log is the audit artifact a human can replay.

7. **Smoke-test the pm-mode pipeline end-to-end** on a separate scratch repo. Same routing-driven pattern as Step 6: read `templates/skill/SKILL.md`'s `## Command routing` section, extract the engine CLI invocations the skill routes to, execute them in the order methodology §16's new-project workflow specifies. Sequence: `init --mode pm` → review and approve `intent-specs` → generate `product-specs` (with auto-eval) → review/approve product-specs → generate `system-specs` → run `affected` after a hypothetical CAP-level change → run `dispatch` and confirm a well-formed plan → run `status`.

   Verify on the resulting state:

   - The full layout per impl §2.1 is materialized, including `.vibeloom/cache/`.
   - The graph cache is built; affected-set walks return correct downstream items.
   - Wave assembly per impl §13.2 produces plans with correct ownership and dependency topology.
   - Status classifies items into the six categories per impl §10.

   Failures at any step trace back to engine, template, or spec. Fix at the source; do not hand-patch the smoke-test repo to mask bugs.
   **Verify:** transcript captured to `/tmp/<scratch-repo>/smoke-pm.log`. The log + the scratch repo together must replay deterministically (same source commit + same template extract → same trace files).

8. **Package the bundle.** The skill bundle is a self-contained, reproducible directory containing the skill manifest, subagent prompt, references, task templates, artifact templates, and the engine. Generate a release manifest recording:

   - name, version, build date (UTC ISO-8601), source commit SHA
   - file inventory with sha256 hashes for every file in the bundle
   - engine runtime requirements (Python 3.10+, zero deps)
   - templates count and source
   - smoke-test results (vibe + pm)

   Format of the release manifest is the agent's call (YAML / JSON / TOML / plain text — pick what reads best). Hashes are computed after the bundle is assembled, before the tarball is created.

   Produce a release tarball and a checksum file alongside it.

   **Tarball reproducibility (HOW worth specifying — agents fumble this):** pass `--sort=name`, `--owner=0 --group=0`, `--numeric-owner` to `tar`; use `gzip -n` (omit timestamp). Equivalently, `tar -cf` then `gzip -n` rather than `tar -czf`. Set file mtimes inside the tarball to a fixed reference (e.g. the manifest build date or the source commit timestamp). Without these, tarballs will differ on every run despite identical content.

   **Verify:** rebuild the tarball twice on the same source commit + same template extract; the two tarball sha256s must match exactly. If they don't, fix the build script (most likely an mtime or sort-order issue) before declaring step 8 done.

9. **Generate release notes** capturing what's in the release, smoke-test results, the §16 acceptance checklist (with each box's state — engine items deferred to the engine build's report; skill items checked here), the source commit SHA, and the bundle artifacts (tarball name + sha256). Format is the agent's call.
   **Verify:** the release notes include every item from §16 with explicit state (skill-✓ / engine-deferred / blocked) and a one-line rationale for any unchecked or deferred item.

10a. **Static skill-manifest validation.** The agent running this prompt is Claude Code itself; it cannot recursively load the new skill into its own session. Do the validation it *can* do statically:
    - Parse `templates/skill/SKILL.md` frontmatter against Claude Code's documented skill-frontmatter schema (required fields, types, regex constraints).
    - Confirm every reference path under `references/` resolves to a real file.
    - Confirm no Claude-Code-reserved characters or constructs appear in the body in a way that would break parsing.
    - Confirm `argument-hint` matches the patterns the SKILL.md body promises.

    **Verify:** report each schema field's state (present + valid / present + invalid / missing). Any "invalid" or "missing" blocks shipping until fixed at source.

10b. **(Handoff artifact, not an agent step) Queue the live Claude Code load test for the human.** The agent does **not** execute this. The agent's deliverable is a clear handoff item in the release notes flagging this as the human's first post-handoff task: install the bundle into a clean Claude Code instance and confirm the skill registers, the argument-hint surface is recognized, and no warnings appear. If 10b ever fails post-handoff, the SKILL.md template needs editing in `vibeloom-templates.md`; re-extract and rebuild.
    **Verify (agent side):** the release notes contain an explicit "Pending live load test" section calling out this task with what to install, where to install it, and what success looks like.

11. **Walk impl §16 acceptance checklist line by line.** Every box must be marked. Engine items are pre-validated by `build-engine.md`'s final report (cite the engine commit SHA); skill items verify against the extracted tree + manifest validation; smoke-test items verify against the runs in Steps 6 and 7. Items that depend on Step 10b live-load are marked **pending live load** with a note. Document any unchecked items in the release notes with explicit rationale.
    **Verify:** every §16 item has an explicit state (✓ / engine-deferred / pending-live-load / blocked) with a one-line citation (commit SHA, log file path, or manifest-validation line). No item is unmarked.

## Output

- A self-contained skill-bundle directory.
- A release tarball plus its sha256 checksum.
- Release notes summarizing what's in the bundle, smoke-test results, and the source commit SHA.
- The smoke-test repos under `/tmp` left intact for human inspection.

## Postconditions

- `extract-templates.py --check` exits 0 (round-trip clean).
- Every template under `templates/tasks/` passes the canonical 10-section DbC contract (count must match impl §17.3).
- All contract artifact templates carry the v0.3 frontmatter shape.
- The ID prefix registry in `templates/skill/references/artifacts.md` matches impl §5.1.
- Smoke tests pass for both `vibe` and `pm` modes end-to-end.
- Static skill-manifest validation (Step 10a) passes; no schema-field is invalid or missing.
- Live Claude Code load test (Step 10b) is queued for the human as the first post-handoff task; release notes flag this explicitly.
- Impl §16 acceptance checklist is fully marked (every box has state: ✓ / engine-deferred / pending-live-load / blocked); blocked items are documented in release notes with rationale.
- The bundle is reproducible: same source commit + same templates source + same engine source → byte-identical bundle (modulo timestamps in the manifest).

## Constraints

- Do not modify any canonical source (`vibeloom-templates.md`, `vibeloom-methodology.md`, `vibeloom-implementation.md`, `codæ-manifesto.html`) during this build. Outputs are the bundle and release notes only.
- Do not hand-edit anything under `templates/`. If something must change, change `vibeloom-templates.md` and re-extract.
- Do not introduce runtime dependencies the engine doesn't already have. Bundle stays Python-3.10+-only, zero `pip install` required at runtime.
- Do not skip a smoke-test step. If a step is broken, fix it at the source; do not document around it.

## Invariants

- The skill manifest is what Claude Code / Codex parses to register the skill. It must validate against the platform's expected schema; if the platform's schema drifts, the SKILL.md template in `vibeloom-templates.md` needs updating, not the bundle.
- The bundle is reproducible (same inputs → byte-identical output, modulo manifest timestamps).
- The bundle is self-contained: no file outside the bundle directory is required at runtime.
- Smoke-test repos live under `/tmp`, never inside the vibeloom repo or any project the user cares about.

## Validation

Before declaring the bundle ready to ship:

1. Round-trip clean (`extract-templates.py --check` exits 0).
2. Family contracts pass (10-section task templates; v0.3 contract-artifact frontmatter shape; non-numbered context-artifact frontmatter).
3. Smoke tests pass end-to-end in both `vibe` and `pm` modes.
4. Impl §16 acceptance checklist fully satisfied (paste it into release notes with each box's state).
5. Bundle integrity: manifest hashes match actual file contents; tarball extracts to a directory whose contents match the manifest.
6. Static skill-manifest validation passes (Step 10a); live load test (Step 10b) queued for human post-handoff.
7. Reproducibility spot-check: rerun `extract-templates.py` and the bundle-tarball step on the same source commit; both extracted tree and tarball sha256 should be byte-identical (modulo manifest timestamps).

## Failure modes

- **Drift reported by the extractor.** The source was edited but not re-extracted, or the extracted tree was hand-edited. Re-extract from source; never hand-edit the tree.
- **Skill manifest fails to load in Claude Code.** Either the SKILL.md template is malformed or the platform's schema changed. Identify which; fix the source.
- **Smoke test fails at a specific operation.** Trace to engine bug, template bug, or spec ambiguity. Fix at the source. Re-run from the failing step.
- **Acceptance checklist fails on a specific item.** Surface to the human. Some §16 items reflect design choices, not bugs; do not auto-fix.
- **Bundle integrity check fails.** Hash mismatch — regenerate the manifest after the bundle is final and before the tarball; fix the script ordering if needed.
- **Spec ambiguity vs. spec bug — different responses:**
  - *Ambiguity:* spec is silent or unclear. Prefer the most conservative interpretation, surface in your final report.
  - *Bug:* spec contradicts itself or contradicts a reference (e.g. §17.3 vs. §6.3). **Do not fix the spec.** Stop the affected step. Surface the contradiction with both citations and request human adjudication. The spec author is the only legitimate fixer.

## Anti-patterns to avoid

- Hand-editing the extracted `templates/` tree.
- Patching the smoke-test repo to mask a bug instead of fixing the source.
- Skipping the load test "because the file looks right" — Claude Code's parser is the only judge.
- Generating the manifest before the bundle is final.
- Bundling tests, scratch fixtures, or `__pycache__/`.
- `git push`-ing a release tag from inside the build prompt; tagging is a human decision after inspection.

## Final report

When the bundle passes acceptance, produce a one-page summary covering:

1. **Bundle artifacts:** tarball name, sha256, release manifest path, release notes path.
2. **Per-step state:** each Step 1–11 marked done / partial / blocked, with a one-line citation (log file, commit SHA, etc.).
3. **§16 acceptance checklist:** every item with state (skill-✓ / engine-deferred (cite engine commit) / pending-live-load / blocked).
4. **Smoke-test transcripts:** paths to `smoke-vibe.log` and `smoke-pm.log`; brief summary of what each ran.
5. **Reproducibility check:** confirmation that re-running extract + tarball on the same source commit produces byte-identical artifacts.
6. **Spec ambiguities and bugs surfaced:** citations + chosen interpretations (ambiguities) or surfaced-only contradictions (bugs).
7. **Pending live-load tasks:** explicit list of what the human needs to do post-handoff (Step 10b primarily).
8. **Source commit SHAs:** templates source, engine source, build prompt commit.

## After this build

If everything passes:
- Tag the source commit, push the tag.
- Publish release notes to the marketing site.
- Optionally upload the tarball as a GitHub release asset.
- Run Step 10b (live load test in Claude Code).
- Announce.

If anything failed and you couldn't fix it cleanly: stop, surface the failure in your final report, do not ship a release that didn't pass its own smoke tests.
