# Adversarial Fix Pass Report — 2026-05-11

Resolution of issues identified in:

- `v03/adversarial-canon-report.md`
- `v03/adversarial-site-report.md`
- `v03/adversarial-skill-prompts-report.md`

Each row records the disposition and the artifact touched. Disposition keys: **fixed** (issue closed), **mitigated** (partial fix with documented residual), **kept-as-is** (issue acknowledged, design choice retained).

## Canon

| ID | Severity | Disposition | Notes |
|---|---|---|---|
| CANON-01 | High | mitigated | Tech Stack code block in `vibeloom-methodology.md §6.1` collapsed to one-paragraph reference; full field shape now lives in `vibeloom-implementation.md` and the `defaults.md` template. Other concept/field crossover deferred — flagged for v04. |
| CANON-02 | Critical | fixed | Stale task inventory in `vibeloom-implementation.md §12` removed. `vibeloom-templates.md` now owns the single inventory. `task_template_id: generate-component-code` renamed to `generate-code-component` in plan example. |
| CANON-03 | Critical | fixed (Phase 3) | Dual decision-ID model: `trace_id: DEC-YYYYMMDD-NNN` (event identity) + `record_id: <ADR|PDR|UDR|IDR>-YYYYMMDD-NNN` (rendered record). Applied in `vibeloom-implementation.md §8.5` and `vibeloom-templates.md` decision-trace template. |
| CANON-04 | High | fixed | `vibeloom-implementation.md §5.1` prefix registry: column header renamed `Scope` → `Namespace`; new `Graph root?` column added; explanatory prose distinguishes the two; populated all 43 rows (only `CAP` and `CST` = Yes). |
| CANON-05 | High | fixed (Phase 2) | Singular `bounded_context` everywhere. `hosted_bounded_contexts` removed; methodology §6.5 invariant updated to "Each domain-layer component hosts exactly one bounded context; each bounded context belongs to exactly one component (1:1)". |
| CANON-06 | Medium | fixed | `init.md` task template branches on mode: vibe skips `parse`, generation trace, and graph cache write; full modes do them. Aligns with implementation §3 and §3.1 promise. |
| CANON-07 | Medium | fixed | `vibeloom-implementation.md §16` acceptance checklist converted to timeless acceptance criteria (declarative, no checkboxes). Header explains: these describe what "v03" means structurally, not project-management status. |
| CANON-08 | Medium | kept-as-is | Evidence stays in the manifesto. Rationale: manifesto-with-evidence is the artifact we're shipping; building a parallel evidence appendix would create the very dual-source-of-truth problem CANON-09 warns about. Manifesto is dated (2026) and not pretending to be timeless. |
| CANON-09 | Medium | mitigated | Surgical cross-reference pass on the methodology→implementation handoff in §6.1. Deeper "single normative home" refactor would touch every chapter and risks regression; deferred to v04 where it can be done holistically. |
| CANON-10 | Low | fixed (Phase 3) | "is build" → "built" fixed in implementation. "hommage" → kept (intentional French-flavored homage to Meyer, called out in §12.1 introduction). |

## Skill / templates

| ID | Severity | Disposition | Notes |
|---|---|---|---|
| SKILL-01 | Critical | fixed (Phase 1) | `templates/skill/references/artifacts.md` and the canonical `vibeloom-templates.md` use `approval_unit` for the artifact-level approval grouping. Event-level `approval_mode` (user/delegated) preserved on approval-trace entries — that's a different concept. |
| SKILL-02 | Critical | fixed (Phase 3) | Decision trace template carries both `trace_id: DEC-*` and `record_id: <ADR/PDR/UDR/IDR>-*`. Skill references aligned. |
| SKILL-03 | High | fixed (Phase 2) | Singular `bounded_context` in templates and references; matches CANON-05. |
| SKILL-04 | High | fixed | `SKILL.md` routing table replaced with explicit command→task mapping. 14 rows covering every supported command. Stale `help` mentions removed (no template exists). Documented that decision-record rendering is engine-side. |
| SKILL-05 | High | fixed (Phase 1) | Broken relative-depth links in `references/eval.md`, `references/runtime.md`, `references/troubleshooting.md` corrected (`../../../`). |
| SKILL-06 | High | fixed (Phase 1) | `<!-- task-template-version: 0.3.0 -->` trailer added to all 14 task-template blocks in `vibeloom-templates.md`. |
| SKILL-07 | High | fixed | `tasks/approve.md` step 8 (auto-invoke downstream generation) reframed as orchestrator policy, not task obligation. `tasks/review.md` preconditions clarified — review does not auto-reopen approved items; the engine's lifecycle-drift detector does. |
| SKILL-08 | Medium | fixed | Two-axis severity introduced in `vibeloom-templates.md` "Severity Classification": semantic axis `severity ∈ {breaking, advisory}`, gate axis `gate_effect ∈ {blocking, non-blocking}`. Default mapping documented; orchestrator may override. Finding schema table updated. |
| SKILL-09 | Medium | kept-as-is | Helper review prompts (`review-canon.md`, `review-site.md`, `review-skill.md`) consolidation deferred. Adversarial reports just produced (this very pass) prove the current prompts work; consolidation can wait for next review cycle. |
| SKILL-10 | High | mitigated | Build prompts (`build-engine.md`, `build-skill.md`, `review-skill.md`) flagged for revision via the historical-record admonition added in Phase 1 at top of `engine-build-report.md` and `skill-build-report.md`. Detailed line-number drift in build prompts unresolved — recommend marking as historical "from-scratch" prompts in next pass. |
| SKILL-11 | Medium | mitigated | Build reports carry a historical-record admonition. Full regeneration after this fix pass deferred — fixes are tracked here in this report instead. |
| SKILL-12 | Medium | partial | The skill still reproduces some canon. Stronger fix (generate references from canonical schemas) requires tooling and is deferred. Mitigation: every reference now points at its canonical source via the link fixes in SKILL-05. |

## Site

| ID | Severity | Disposition | Notes |
|---|---|---|---|
| SITE-01 | Critical | fixed (prior pass) | `llms.txt` rewritten from v03 canon — 5 modes, 8 ops, Contract Graph, 6 trace families. |
| SITE-02 | High | kept-as-is | Both manifesto pages remain public (user pushback). Cross-link relationship established: `codae.html` description and footer link to full manifesto; `codæ-manifesto.html` declares `<link rel="alternate">` to `/codae`. Canonical tags present on both. |
| SITE-03 | High | fixed | `methodology.html` broken anchor `implementation.html#snapshot` → `implementation.html#approval-traces`. All other internal links pass the static checker. |
| SITE-04 | High | fixed (prior pass) | JSON-LD FAQ softened; homepage competitor language tightened. |
| SITE-05 | Medium | kept-as-is | Homepage stat ordering — current placement after convergence strip reads as proof, not memo. Reordering risks weakening the structural argument for less concrete gain. |
| SITE-06 | Medium | fixed (prior pass) | Hero H1 made static: "Contract-driven agentic engineering." Word cycle removed. |
| SITE-07 | Medium | mitigated | Drift between the two manifesto pages mitigated by metadata cross-links + the canonical manifesto being the single source the short essay summarizes. Generated-from-canon pipeline deferred. |
| SITE-08 | Medium | kept-as-is | Implementation site page already links to canonical implementation §8 trace schemas and §13 dispatch sections. Trimming further would weaken the narrative; the page is explainer, not spec. |
| SITE-09 | Low | fixed (prior pass) | No remaining occurrences of "contract-driven development for AI-coded projects" in `v03/site/public/`. |
| SITE-10 | Medium | fixed | New `v03/site/scripts/check_site.py` validates: internal links, fragment anchors, canonical tags, sitemap coverage, llms.txt freshness, duplicate titles. Currently passes clean. Run via `python3 v03/site/scripts/check_site.py [--root v03/site/public]`. |

## Post-fix verification

- `python3 v03/extract-templates.py --check` → OK: 41 templates match disk.
- `python3 v03/site/scripts/check_site.py --root v03/site/public` → Site check OK.
- `python3 v03/site/scripts/check_site.py --root site/public` → Site check OK (deployed mirror).

## Residual items recommended for v04

1. **CANON-01 deep refactor** — full migration of field/schema material from `vibeloom-methodology.md` into `vibeloom-implementation.md` with each concept assigned a single normative home (CANON-09).
2. **SKILL-09 prompt consolidation** — extract the shared review-loop ceremony from `review-canon.md` / `review-site.md` / `review-skill.md` into one reference plus three domain-specific scope files.
3. **SKILL-10 build-prompt cleanup** — explicitly mark `build-engine.md` and `build-skill.md` as historical from-scratch prompts; replace line-number references with section anchors.
4. **SKILL-12 generated references** — generate the schema-heavy skill references from canonical implementation-doc sections to eliminate the copy.
5. **CANON-08 dated-evidence policy** — when 2026 evidence ages out, decide whether to refresh in place or carve out a dated-evidence appendix.
