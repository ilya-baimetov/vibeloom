# VibeLoom Adversarial Review — Good / Bad / Ugly

**Date:** 2026-08-07
**Reviewer posture:** adversarial, pre-investment diligence. Seeking one reason to say *yes* and one reason to say *no*.
**Scope:** `README.md`, `file-layout.md`, `v01/`+`v02/`+`v03/` full canon (manifesto, methodology, implementation, templates, engine, skill, site, examples, roadmap, comparison), `site/public/`, `pitch-deck/`, `ideas.md`, `research/sdd-landscape.md`, `canon-review-*`, prior `adversarial-*.md` + `adversarial-fix-pass-report.md`, `v02/engine/`, `v03/engine/`.
**Status of artifact:** v03 is **spec-only** — engine catches up in v03.x (per `README.md`). v02 is runnable (`vibeloom-engine 0.2.0`).

---

## Executive Verdict

VibeLoom is the most intellectually serious entry in the 2026 spec-driven governance wave. The codæ thesis — *contract as eval, humans mend the contract while agents operate the factory* — is positioned above the category rather than inside it, and the methodology/implementation split is genuinely buildable. The site and comparison work are sharper than any competitor's narrative spine.

It is also, today, an unfunded solo-founder spec with zero validated demand, a governance surface that is heavier than the systems it wants to govern, and a runnable substrate (v02) that is materially behind its own spec (v03). **If VibeLoom shipped exactly as spec'd, a strong architect would love it and almost nobody else would adopt it.** The path to adoption is not more spec — it is a killer demo, a demand signal, and a ceremonial diet.

**One reason to say yes:** The lifecycle-governance diagnosis is correct, structurally ahead of Kiro/Spec Kit/BMAD/Tessl (all of which are per-feature or per-file and go stale by construction), and the implementation sketch — graph-backed staleness, dispatch waves, patch-staged validation, trace-derived learning substrate — is the only one in the landscape that even attempts whole-system governance.

**One reason to say no:** No one has asked for it yet, and the onboarding tax makes sure no one will stumble into it. 41 templates, 43 ID prefixes, 5 modes, 6 status categories, 6 trace families, 14 task templates — for a benefit (drift detection) that only pays back *after* the second or third generation cycle. Without a 30-second visceral demo of that payback, distribution never starts.

---

## GOOD — What is genuinely strong

### G1. Thesis is above the category, not inside it

`site/public/index.html:238-286` + `codæ-manifesto.html` converge four independent 2026 large-N studies (Storey intent/cognitive debt, Faye scaffolding fragility, Kos'myna, plus DORA/Anthropic/BCG) into a single structural diagnosis: *intent debt compounds as context fragments.* Competitors argue about spec shape; VibeLoom argues about lifecycle position. That framing — *contract-driven beyond spec-driven* — is the only one that survives a "why not just write a better prompt?" challenge. The FAQ answer at `site/public/index.html` JSON-LD — citing Baltes tragedy-of-commons framing — is the strongest paragraph in the site.

### G2. Contract-as-eval is a real lever

Methodology §2 / §10-14 makes the contract *both* the generation basis *and* the validation oracle. `derives_from` edges are typed against the §5.1 prefix registry, cycles are blocking eval findings, and every non-root item must transitively reach `CAP`/`CST` (§8.2 universal-trace). This is more than "specs before code" — it is a *checkable* invariant. GitHub Spec Kit and Kiro cannot detect when spec #31 contradicts spec #7; VibeLoom's graph can, by construction (even if runtime enforcement is currently structural-only).

### G3. Verification ladder is intellectually honest

Methodology §14.3 names three tiers — *decidable* (structural eval, no LLM), *mechanical* (validation runners from `validation-registry.md`), *heuristic* (agent-judged semantic eval) — and commits to the trajectory: *promote checks upward* over releases. The ladder explicitly refuses to claim formal verification in v03 (see §14.3 closing: "the ladder is the climb"). That modesty is credibility.

### G4. Five modes are a considered product decision

`vibeloom-methodology.md: §5` — `vibe` (solo, outcome-approved), `pm`/`dev` (mirror-image delegated tiers), `ux` (designer-led with PM as peer reviewer, mockups as first-class `MOCK-####` evidence), `expert` (all-gated). The `ux` mode is not a cosmetic add — `generate-product-specs-from-ux` task variant (§6.3, implementation §12) routes mockup evidence into product specs with peer review. No competitor has a designer-led governance path; this is a defensible wedge for design-heavy teams.

### G5. Engine substrate is clean and stdlib-only

`v03/engine/pyproject.toml` — `dependencies = []`, Python 3.10+. `v02/engine/vibeloom_engine/graph.py:canonical_item_hash` hashes sorted-keys JSON with `derives_from` sorted lexicographically (derivation as set, not sequence). `graph.py: reachable_forward` / `upstream_closure` are BFS with reverse adjacency, deterministic. Tests `v03/engine/tests/test_dispatch.py`, `test_eval.py`, `test_status.py`, `test_graph.py` actually exercise the spec invariants (disjoint ownership, derivation precedence, cycle blocking, dangling, stale-after-approval). Most methodology startups never get this far.

### G6. Dispatch + wave assembly is buildable, not hand-waved

Implementation §13.1-13.4 specifies `dispatch_plan` → `waves` (disjoint `owned_paths`, derivation precedence, `max_wave_size=5`, reconciliation singletons), `execute_plan` with deterministic `scope_id` ordering and per-wave `subagent.spawn(header)`, patch staging under `.vibeloom/runs/RUN-.../tasks/TASK-.../` then atomic apply + trace emission. `dispatch.py: _paths_overlap` handles `**` glob prefix normalization. No competitor specifies parallel semantics at this depth.

### G7. Trace schemas are forward-compatible

Implementation §8.1-8.7 — every trace carries `schema_version`, extension is additive (minor = optional fields, major = required fields), older traces stay readable. Reconstructability principle (§8 intro) ensures `basis_ids + output_item_ids`, per-item fingerprints, `per_candidate: {confidence, evidence_refs, uncertainty}` on import traces (v1.1), and dual-ID decision traces all preserve enough metadata to promote relationships to graph nodes later (roadmap CGKG-B). The six families (`approval`, `code-sync`, `generation`, `eval`, `decision`, `import`) are distinct, not conflated.

### G8. Template materialization is elegant

Implementation §17 + `vibeloom-templates.md:1-50` — templates *do not exist as source files*. Single canonical `vibeloom-templates.md` with ````template:<path>` fenced blocks, four-backtick outer fences so inner ` ```yaml` doesn't collide, `extract-templates.py --check` for CI. 41 templates in 6 families, each family with a stated contract (see §17.3 table). This prevents the "which copy is truth?" drift that kills most spec-heavy repos.

### G9. Vibe mode is framed as a distinct operating point

Methodology §5.1 + implementation §2.2 + §15.6 now correctly frame vibe as *surface simplicity, not internal absence*: required user-facing layout is `intent.md`, `defaults.md`, `system.md`, `AGENTS.md`, `CLAUDE.md`, `state/id-registry.json` plus traces — but private scaffolding (graph memoization, code-sync-like evidence) is allowed as runtime optimization, not user ceremony. This resolves the earlier "no graph at all" absolutism that made upgrade unimplementable. Upgrade heuristic (§5.2 / `getting-started.md:51-68`) is concrete: components, LOC, contributors, reconciliation frequency.

### G10. Site and comparison are best-in-class for the category

`site/public/index.html` and `methodology.html` ship correct `schema.org` (`Organization`, `SoftwareApplication`, `FAQPage`, `HowTo`, `TechArticle`, `BreadcrumbList`), canonical tags, OG images via `scripts/render-og-image.cjs`, shared `styles.css`. `research/sdd-landscape.md` is a genuinely fair three-phase narrative (prototype → real app → two-pizza team) with a sourced "who it works for" per competitor rather than a win-table. The site FAQ at 8 entries is tight.

### G11. Prior adversarial reviews actually improved the canon

`adversarial-fix-pass-report.md` tracks 10 CANON + 12 SKILL + 10 SITE issues with disposition keys (fixed/mitigated/kept-as-is). CANON-02 (stale task inventory vs `vibeloom-templates.md` §17.3) and CANON-04 ( `Scope` → `Namespace` + `Graph root?` column) were root-caused. `site/scripts/check_site.py` now validates internal links, fragments, canonical tags, sitemap, `llms.txt` freshness. Few early projects invite this level of self-critique.

---

## BAD — Design debt, friction, and half-built promises

> Bad = real issues that increase cost, slow adoption, or cause bugs — but don't by themselves make the thesis unworkable.

### B1. Ceremony tax is heavier than the systems it wants to govern

Count the user-facing vocabulary in v03: **41 templates** (`vibeloom-templates.md:76` — 14 tasks + 18 artifacts + 6 references + skill manifest + subagent prompt + README), **43 ID prefixes** (`ids.py:PREFIX_FAMILIES`), **6 tiers** (`intent-specs` → `product-specs` ↔ `ux-specs` → `system-specs` → `context` → `code`), **5 modes**, **6 status categories** (`current`/`stale`/`uncovered`/`dangling`/`drifted`/`obsolete`), **6 trace families**, **5.1 §5.1 namespace kinds** plus `layer` enum (presentation/application/domain/infrastructure). A new adopter must hold this taxonomy before they can ship. The "30-minute on-ramp" in `getting-started.md:1-8` is fiction for full modes — the upgrade path alone budgets "a half-day to a day for the first import + review cycle on a 50K-LOC project" (`getting-started.md:82-86`) plus "plan ~1 hour for the first review pass after upgrade" (`getting-started.md:70`). That is honest but disqualifies casual evaluation.

**Signal in the repo:** `adversarial-canon-report.md:CANON-01` already flagged that `vibeloom-methodology.md` carries implementation fields (Tech Stack per-layer shape, DDD cardinality rules) — the fix-pass mitigated only the §6.1 code block (fix-pass: CANON-01 = mitigated, deferred to v04). `ideas.md` and `roadmap.md` share ~80% overlap (both list A1/A2/A3/A4/C0...), indicating the brainstorm layer lacks a single backlog.

### B2. v03 is spec-only; the runnable artifact is v02 behind it

`README.md` banner: "Spec-only — engine catches up in a v0.3.x release." `v03/engine/vibeloom_engine/` exists with ~20 modules + 17 test files, but `v02/engine/` is the runnable `vibeloom-engine 0.2.0` (no `ux-specs`, no `traces/`, no `state/`, `context-graph.json` snapshots instead of approval traces, `hosted_bounded_contexts` vs `bounded_context` mismatch). `v03/getting-started.md:14-18` says "point your agent at `v03/`" — the agent will load a skill whose engine is not yet runnable at the spec it promises. A prospect who clones and follows the on-ramp hits this seam within minutes.

### B3. Methodological / implementation authority is still split

CANON-01 deep-refactor is deferred to v04 (fix-pass Residual #1). Concrete symptoms remain: `vibeloom-methodology.md:§6.1` still describes a per-layer Tech Stack section shape normatively, while `vibeloom-implementation.md:§6` and the `defaults.md` template normatively repeat it. An adopter editing `defaults` has three normative homes to reconcile. `review-canon.md` / `review-site.md` / `review-skill.md` / `tasks/review.md` share the same review-loop ceremony in four places with slightly different vocabularies (roadmap E6 calls this out; fix-pass SKILL-09 deferred consolidation). Four copies = four drift vectors.

### B4. 43 prefixes and a 1:1 BC→component invariant over-engineer the domain

`vibeloom-methodology.md:§6.5` — "Each domain-layer component hosts exactly one bounded context; each bounded context belongs to exactly one component (1:1 mapping in the domain layer)." This is a governance choice presented as a universal. Real DDD teams debate BC granularity for weeks; mandating 1:1 at the methodology layer turns a modeling decision into a blocking eval finding (`eval_.py:_layered_invariants`). The per-prefix `allowed_upstream` derivation table (`ids.py:allowed_upstream`) with entries like `FR ← (CAP, OBJ, STORY)` and `VIEW ← (CAP, STORY, FLOW)` looks authoritative but is largely *prose judgment* — no adopter will memorize that `MET` may derive from `KR|FR|NFR` but not from `CST`. The pair `CAP`/`CST` as the only graph roots is principled; the downstream refinement past `FR/STORY/BC` into `AGG/ENT/VO/INV/INT/UXC/MOCK/EXT/TB/SNFR/CONT/CMP/IF/DEP/BEH/NOTE/BDD/SCN` is where governance becomes taxonomy.

### B5. Code-sync is shallow — source-map-shaped evidence, not a guarantee

Implementation §8.2 + §11's `code-sync` trace connects `[CMP, IF, BEH, VIEW]` IDs to `owned_paths` + `file_hashes` + `validation{typecheck, unit, contract-conformance, bdd}`. The prose is honest: "v03 doesn't require deep function-level graph carriers — this trace bridges them." In practice this means: the system validates that *some file under `owned_paths` hashes to X* and *a runner named `typecheck` passed*, not that line 42 realizes `BEH-0031`. A subagent can claim `realizes: [CMP-0012]` and emit plausible hashes; `detect_direct_edits` in `staleness.py` compares current hashes to approval trace hashes, but no structural eval checks that the claimed realization is faithful. The "dark factory" promise — humans never inspect code — rests on a trace that is itself a human-unverified claim.

### B6. Verification ladder's trajectory is faith-based

Methodology §14.3: heuristic → mechanical → decidable promotion "as the engine matures." No metric ties a release to that claim beyond "the decidable share has grown" (`A4. Cognitive-surface instrumentation` is roadmap-deferred to v04+). Today, `_coverage` in `eval_.py` returns `out={}` under a TODO ("Heuristic per impl §6... kept simple in v0.3"), and `_required_downstream` returns empty — meaning `uncovered` is only surfaced via `status.py:classify_items`'s per-basis "basis_unapproved" path, not via the "every non-terminal upstream item appears downstream" definition in methodology §9. The six status categories double-cover the same ground: `stale` (basis hash mismatch), `dangling` (basis retired), `uncovered` (basis never approved), `drifted` (hash mismatch OR eval finding OR direct edit), `obsolete` (heuristic or user-marked). An operator seeing `drifted` cannot tell without `reason` whether the fix is `reconcile`, `review`, or "you edited a file you shouldn't have."

### B7. Brownfield `import` overpromises; confidence scores are uncalibrated

Implementation §15.8 + `tasks/import.md` describe a single-task subagent that scans the codebase (`engine.scan_codebase`), proposes draft artifacts per tier with `confidence ∈ [0,1]`, `evidence_refs`, `uncertainty`, then `per_candidate` lands in `imports.jsonl`. Confidence is LLM self-report, never calibrated per `tasks/import.md` or `traces.py`. `research/sdd-landscape.md` correctly notes for other tools that per-file spec accuracy is field-measured (Tessl ~35% improvement on API usage), but VibeLoom's import has no comparable benchmark — and its richest outputs (`BC` cohesion, `AGG` boundaries) are exactly where LLMs hallucinate structure. A user who trusts a `0.81` on `BC-0003 "Cohesion across billing/ and invoicing/ is ambiguous; could be split"` (implementation §8.6 example) at face value will approve a wrong domain model into a load-bearing contract.

### B8. Status and staleness are two similar machines

`status.py:classify_items` and `staleness.py:compute_staleness` both compute `latest_approval_per_item` + current-hash comparisons and emit overlapping taxonomies (`STALE` vs `drifted` vs `dangling`). `compute_status` then recomputes `direct_edits` via `detect_direct_edits` and `structural_eval` blocking findings into `drifted`. A diff between `compute_staleness`'s `mismatched_bases[].reason` and `classify_items`'s `status` is possible depending on call order and whether the repo has been `save_graph`'d. The spec says `status` is the recommended-next engine; the existence of a sibling `staleness` CLI command invites confusion about which to call.

### B9. Decision traces: dual-ID model is specified coarsely, rendered inconsistently

Implementation §8.5 specifies `trace_id: DEC-YYYYMMDD-NNNN` (event identity, dated) plus `record_id: <ADR|PDR|UDR|IDR>-NNNN` (rendered, sequence-only per record_type, absent for `general`). CANON-03 + fix-pass codified this, but residue remains: `tasks/decisions` rendering logic in `decisions.py` and the markdown frontmatter template in `artifacts/decision-trace.md` still carry the older dated `ADR-YYYYMMDD-NNNN` examples in prose; `traces.py:REQUIRED_FIELDS["decision"]` lists only `(topic, payload)` and does not enforce `trace_id`/`record_id` co-presence. The `general` type's missing `record_id` makes the rendering tri-state (dated trace, sequence record, null record) — easy to mishandle.

### B10. Comparison is thorough but still inside its own frame

`vibeloom-comparison.html` + `research/sdd-landscape.md` disclosure line — "Claims about VibeLoom are based on methodology design — real-world case studies are not yet public as of March 2026. Where a claim is aspirational rather than evidenced, it is marked as such" — is admirable. But the site FAQ at `site/public/methodology.html` still ships the blunt: "Spec Kit, Kiro, and BMAD keep humans on the factory floor — per-feature specs that drive one generation cycle, then ship and go static. Tessl pivoted... VibeLoom is the only one with a whole-system, graph-connected contract" — without sourcing or aging the "went static" claim per competitor docs. Prior `adversarial-site-report.md:SITE-04` flagged this; fix-pass softened JSON-LD but left page-level FAQ sharp.

### B11. Getting-started and docs sprawl

`getting-started.md` is a 30-minute on-ramp that branches to manifesto → methodology → implementation → 5 examples → comparison → roadmap — a funnel that never narrows. The v03 canon alone is ~15k lines (`vibeloom-templates.md: 4365` + `vibeloom-implementation.md: ~1600` + `vibeloom-methodology.md: ~800` + manifesto CSS/HTML + comparison). `file-layout.md` then adds the v04+ repo layout spec on top. An adopter who wants "just run it" meets `v02/SKILL.md` (4 modes, no `ux`), `v03/SKILL.md` (5 modes), and `vibeloom-dev/SKILL.md` (orthogonal maintainer skill with `init/eval/review/generate/reconcile/feedback` but *different* targets). Two skills in one repo with orthogonal command surfaces (`README.md` callout) is correct but cognitively doubles the onboarding cliff.

### B12. Vibe-mode "private scaffolding" is specified by absence

Methodology §5.1 + implementation §2.2 §15.6 promise that vibe's derived cache / code-sync-like evidence is "private runtime data, not user-owned canon." No invariant defines *how private*: whether it must be gitignored, whether `status` may ever read it, whether `import` may rely on it for upgrade. The sentence "the engine *may* create derived cache, run, or code-sync-like evidence under `.vibeloom/` when useful" (`vibeloom-implementation.md:§2.2`) is a permission, not a rule — so an engine implementer can ship either extreme (nothing vs full graph) and still claim compliance, with different generation quality.

---

## UGLY — Existential risks that kill the project if not addressed

> Ugly = structural bets that, if wrong, make the other 90% irrelevant.

### U1. No validated demand — the artifact is pre-customer

`pitch-deck/Adversarial-Review-EWOR.md:B2` — "Traction slide: 4 docs, 17 citations, v0.3 reference impl, 5 modes, brownfield import. Zero numbers about anyone outside the founder engaging." `research/sdd-landscape.md` disclosure — "not yet field-validated at this scale" appears twice; `program-proposal-ai-code-governance-practice.md` and `ideas.md` are internal brainstorms. VibeLoom diagnoses *intent debt* well, but has not demonstrated willingness-to-pay, even soft (waitlist count, CTO LOI, stars, Discord). Pre-revenue SDD tooling is a credence good — the prospect cannot evaluate it without living with it for a month — so distribution requires either owned distribution (Cursor/Kiro) or a community flywheel (Spec Kit 83k stars). VibeLoom has neither, and its skill is "forkable in 200 LOC" per `Adversarial-Review-EWOR.md:E2`.

### U2. Solo-founder thesis risk — one architect, no executor complement

`Adversarial-Review-EWOR.md:A2 + B1 + F` — founder appears on slide 11 of 12; "solo. on purpose." reads as defensive rationalization to a founder-bet program. The repository history (v01 May, v02 May, v03 May, 4.3k-line template spec in one month) signals writing capacity, not shipping velocity. No GTM, no community operator, no second pair of eyes on semantic eval quality. The methodology's `approve → generate → status` loop assumes a PM / dev / design counterparty who does not exist yet. If the founder *is* the PM/dev/designer in every example, the ceremony being prescribed has never been stress-tested across real role boundaries.

### U3. The core value proposition is LLM-heuristic with deterministic wrapping

VibeLoom's defensibility is presented as deterministic: graph-validated, staleness-detected, wave-dispatched, trace-indexed. But the value lives in *semantic eval* (methodology §14.2: faithful representation, naming consistency, capability gaps, UX/product mismatch, mockup extraction gaps) — LLM-judged, `blocking` vs `advisory` escalation, arbitration by the human at a review packet. `eval_.py:_coverage` returning `{}` and `_required_downstream` returning `{}` are symptoms: the genuinely hard check — "does this domain model carve the right bounded contexts?" — has no decidable form, no mechanical runner, and no eval dimension that predicts it. So the system governs what is cheap to govern (field presence, edge validity, cycle absence) and asks the human to govern what is expensive — which is exactly the cognitive-surface burden VibeLoom promises to reduce. If LLM semantic eval stays noisy, the packets become either false-positive triage or rubber-stamping.

### U4. Engine state loss is fatal and unrecoverable

Implementation §3 + §3.3 are explicit: `.vibeloom/traces/` is append-only durable, `.vibeloom/state/id-registry.json` is durable mutable, and "State loss is fatal in v03 — there is no recovery procedure. Treat `.vibeloom/state/` like `.vibeloom/traces/` for backup: if it disappears, allocation history disappears — next-counters reset, retired IDs may be reissued against historical traces." `io_.py` exposes `traces_dir`, `cache_dir`, `runs_dir`, `decisions_dir` but no `state_dir` accessor; `registry.py:registry_path` still resolves via `traces_dir(repo_root) / "id-registry.json"` despite the spec's move to `.vibeloom/state/` (fix-pass CANON-01 relocated the doc but left `registry.py` on the old path). Sensitive file lives one `rm -rf .vibeloom/cache` accident away. `cache/` is regenerable; `state/` is not; both sit under `.vibeloom/` with no shell-guard distinguishing them.

### U5. Contract bloat is the new intent debt

Manifesto §5 anchors the cognitive-surface bet at "108K-LOC governed by a contract ~24% of code volume (Vasilopoulos 2026)." That is one project. `roadmap.md:A4` correctly notes the metric is not yet instrumented. Without instrumentation, there is no way to know whether VibeLoom governs systems or meta-governs itself. The artifact count trends upward: `ideas.md` proposes slices-as-atomic-units (`SLICE-####` + `slices.md` + `aggregates`, roadmap C1 `DELTA-####`, C2 `CMAP-####`, C3 compliance mode, C0 CGKG-B context graph). Each proposal adds a prefix family, a template, and a status interaction. No proposal is flagged "adds N templates, increases review surface by X hours." The spend that is easiest to introduce in a solo spec — more contract — is exactly the debt the paradigm is supposed to prevent.

### U6. Distribution is unspecified; the moat is prose

`ideas.md:B1` (pattern library) is flagged as "Ilya has an alternative templates→implementation idea that may differ," with the roadmap noting the registry could be "central or organization-private" and "the natural commercial moat for vibeloom.ai (paid premium patterns)." `pitch-deck/Adversarial-Review-EWOR.md:A1 + F` — no GTM funnel, no channel, no named top-50 targets, no financials beyond a 60/25/15 pie. `vibeloom-comparison.html` concedes that Spec Kit's "83,000+ stars, 40+ extensions" + open-source MIT + agent-agnostic posture are real moats today; VibeLoom's response is deeper theory, not a distribution edge. If Spec Kit's constitution (the one durable idea everyone borrows per `sdd-landscape.md`) is free, VibeLoom's contract stack must demonstrate a weekly payback that justifies its weekly review cost — otherwise the rational adopter takes the constitution and skips the graph.

### U7. Mode coherence across the skill lifecycle is unchecked

`v02/SKILL.md` advertises `[vibe|pm|dev|expert]` with no `ux`. `v03/skill/SKILL.md` + `vibeloom-methodology.md:§5` advertise `[vibe|pm|dev|ux|expert]`. `file-layout.md:§4` describes `vibeloom-dev` targets `intent|manifesto|methodology|implementation|skill|site` (no `ux`). `v03/templates/tasks/init.md` and `generate-*` tasks branch per mode, but `v03/engine/vibeloom_engine/models.py:ArtifactType` still enumerates the v02 artifact family (no `ux` tier). `status.py:_infer_mode` infers mode from layout presence (presence of `ux.md` / `ux-specs/mockups/`), which fails for an expert-mode project that has no ux artifacts. Mode is the user's first decision (`/vibeloom init --mode <mode>`) and it drifts per artifact.

---

## Prior Adversarial Reviews — What they caught, what remains

Four prior reports (`adversarial-canon-report.md`, `adversarial-site-report.md`, `adversarial-skill-prompts-report.md`, `canon-review-report.md` + packet) raised **32 distinct issues** across canon/site/skill:

| Report | Critical / High | Fixed at root | Mitigated / deferred | Kept-as-is (acknowledged) | Regressed by next walk |
|---|---|---|---|---|---|
| `adversarial-canon-report` (CANON-01..10) | 6 | 5 | 2 (CANON-01 deep refactor, CANON-09 handoff pass) | 1 (CANON-08: evidence stays in manifesto) | CANON-02/05 left propagation gaps that Walk 2 flagged as CANON-301/303/304 |
| `adversarial-site-report` (SITE-01..10) | 3 | 5 | 2 (SITE-02 both manifesto pages public; SITE-07 pipeline deferred) | 2 (SITE-05 stat ordering; SITE-08 narrative) | 0 |
| `adversarial-skill-prompts-report` (SKILL-01..12) | 5 | 7 | 3 (SKILL-09/10/12 consolidation & generation) | 1 (SKILL-09 loop factoring) | 0 but residual drift risk high (SKILL-12: generate references from canon requires tooling) |
| `canon-review-report` Walk 2-3 (CANON-001..006, 301..305) | 6 | 6 | 0 | 0 | Walk 2 introduced 5 new findings; 3 were propagation gaps, 2 were reviewer-introduced false claims |

**Fix-pass disposition** (`adversarial-fix-pass-report.md`): ~60% fixed at root cause (CANON-02/04/05/07, SKILL-01..07, SITE-01/03), ~25% mitigated with residual flagged for v04 (CANON-01, CANON-09, SKILL-10/11/12), ~15% kept-as-is by design.

**Meta-finding:** Fixes that patched prose instead of single-sourcing re-introduced drift within one walk. The clearest pattern: a fix that edits `vibeloom-methodology.md` or `vibeloom-implementation.md` without a mechanical check (generated reference, extractor, or lint) reliably leaves one consumer stale. The adversarial reports prove the review machinery *works*; the fix-pass proves the remediation machinery *does not yet enforce single-source-of-truth*.

**Still open after fix-pass:**

1. CANON-01 deep refactor: full migration of normative field/spec material from methodology → implementation.
2. SKILL-09 review-loop consolidation: `review-{canon,site,skill}.md` + `tasks/review.md` shared loop.
3. SKILL-10 build-prompt cleanup: `build-engine.md` / `build-skill.md` line-number drift.
4. SKILL-12 generated references: generate `skill/references/*.md` from implementation spec sections.
5. CANON-08 dated-evidence policy: when 2026 evidence ages out, refresh vs appendix.
6. `registry.py` path: spec moved `id-registry.json` to `state/`, engine still reads `traces/` (found in this review).

---

## Actionable Recommendations

Prioritized by *founder time to first external validation*. No recommendation edits the methodology spec — each is a narrow operation with a defined artifact and gate.

### P0 — Fix before any outbound distribution (2-4 days of focused work)

**R0. Fix the engine/spec path divergence.**
Spec moved `id-registry.json` → `.vibeloom/state/`; `engine/vibeloom_engine/registry.py:registry_path` still uses `traces_dir` and `io_.py` exposes no `state_dir`. Every fresh `v03` project and every upgrade will silently split registry state. Action: add `state_dir` to `io_.py`, update `registry.py`, add a one-test `test_registry_path_uses_state` that asserts `registry_path(repo).parent.name == "state"`. Gate: `pytest -k registry` green.
*Effort: 30 min. Impact: closes a fatal data-loss seam.*

**R1. Decide and freeze the distribution ask.**
`pitch-deck/Adversarial-Review-EWOR.md:A1` is still accurate: €750K as "standard EWOR shape" is factually wrong. EWOR Traction is €500K (130 at €1.5M cap + 370 uncapped MFN); Ideation is up to €300K. Action: choose Ideation (€300K) as the honest lane for pre-revenue, pre-team stage and stop calling the shape standard; OR choose Traction and justify why the reference impl counts as product traction — then own that justification explicitly on slide 1. Remove the 60/25/15 pie as a financial model; add monthly burn + runway.
*Effort: 30 min (text) + 2 h (founder bio rewrite). Impact: removes the single issue that gets a diligence reader to stop reading.*

**R2. Move founder to slide 2.**
Per `Adversarial-Review-EWOR.md:A2+F`, EWOR screens founder at 99% weight. Current deck buries founder on slide 11/12. Action: slide 2 = founder (companies/roles/shipped outcomes/verifiable scale) + why solo for v0.3 explicitly as EWOR-network unlock ("solo for v0.3 because the design representation needed one architect; EWOR is the explicit unlock for engineering + GTM co-founders"). Slide 1 keeps thesis/artifact/ask tight. Remove three slogans down to one — keep "AutoCAD for software systems" (`Adversarial-Review-EWOR.md:B4`).
*Effort: 2 h. Impact: meets the program at its actual criterion instead of defending against it.*

**R3. Add one honest "where we lose" row to every competitive comparison.**
`Adversarial-Review-EWOR.md:B3 + C4` and prior SITE-04. Today's comparison matrix reads as 6 rows of VibeLoom = yes, competitors = partial/no — an experienced reader discounts it to zero. Action: add to `site/public/index.html` comparison module and to `pitch-deck/VibeLoom-Pitch-Deck.html` slide 8:

| Dimension | Cursor / Kiro / Spec Kit | VibeLoom |
|---|---|---|
| Distribution & installed base | Millions of devs / AWS account base / GH login | Zero |
| Capital deployed | $600M+ raised, ~$2B ARR | Pre-funding |
| Time-to-first-feature for a weekend hacker | Hours | 1-3 days to first useful contract |

Then add the counterpart: "where VibeLoom wins only if the project survives 3+ cycles."
*Effort: 15 min. Impact: the rest of the comparison becomes credible.*

**R4. Ship one non-synthetic demo before any more spec.**
No report, deck, or site page substitutes for a 90-second Loom. Action: record `vibeloom init --mode vibe` → `generate` on a real public repo (e.g., a note-taking app with search), show `status: current`, then intentionally edit `intent.md`, re-`approve`, re-`generate`, and show the stale → regenerate → reconciliation packet transition. Host at `site/public/demo.html` and link from the title slide. Replace the terminal screenshot with a frame from the actual run.
*Effort: half-day (capture + edit). Impact: moves the artifact from "thesis with a spec" to "thesis with a working trace."*

### P1 — Reduce adoption tax (next 2 weeks)

**R5. Cut the governance surface before you add to it.**
Defer every `ideas.md`/`roadmap.md` addition that introduces a new ID prefix or a new artifact until after first external adoption: specifically defer `SLICE-####`/`DELTA-####`/`CMAP-####` (roadmap C1/C2 §4) to v05+. Action: add a one-paragraph *Surface Budget* gate to `roadmap.md`: any v04 proposal that adds an ID family or an artifact must declare `added templates`, `added prefixes`, `weekly review minutes`, and `deprecation candidate` to offset it. Apply immediately: remove `SLICE`/`DELTA`/`CMAP` from the v04 candidate set in `roadmap.md` header and label them v05+.
*Effort: 1 h. Impact: prevents the contract from outgrowing the systems it governs.*

**R6. Make the 30-minute on-ramp measurable.**
Action: instrument `getting-started.md` with checkpointed timings and define the gate:

- `vibe` path: `init` → `approve intent-specs` → `generate` → `status` must complete in ≤25 min on a clean machine with `python3 -m vibeloom_engine --version` confirming `0.3.x`.
- Add a one-command smoke: `python3 v03/site/scripts/check_site.py` + `python3 v03/extract-templates.py --check` + `PYTHONPATH=v03/engine pytest -q` — all must pass before any docs edit is merged.

If vibe cannot be timed end-to-end, the claim ships as "vibe: governed foundations in ~1 hour" instead of "30 minutes."
*Effort: 2 h (including one timed dry run). Impact: kills the credibility leak where a prospect's first command fails.*

**R7. Single-source the authority split.**
Residuals CANON-01 + SKILL-12. Action:

- (a) generate `skill/references/artifacts.md` and `skill/references/eval.md` schema tables from `vibeloom-implementation.md:§5.1` and §8 via a 60-line extractor (like `extract-templates.py`), checked in CI;
- (b) move the Tech Stack per-layer shape normatively to `vibeloom-implementation.md:§6` + `defaults.md` template only; `vibeloom-methodology.md:§6.1` retains one compact conceptual example plus a "normative shape in implementation §6" pointer.

Gate: `python3 extract-templates.py --check` plus `python3 extract-references.py --check`.
*Effort: half-day. Impact: eliminates the copy-drift vector that produced 3 regressions in Walk 2.*

**R8. Implement the `state`/`cache` shell guard.**
Ugly U4. Action: add `WARN_IF: id-registry.json not in .vibeloom/state/` to `cli.py:_resolve_repo` + a one-line `pre-commit` guard that refuses `git clean -xfd` patterns that would drop `state/` without an explicit `vibeloom export-state`. Document in `getting-started.md: Prerequisites` that `state/` and `traces/` must be backed up; `cache/` is safe to delete.
*Effort: 1 h. Impact: fatal loss moves from "one accident" to "guarded accident."*

**R9. Calibrate or remove `import` confidence.**
Bad B7. Action: either (a) replace `confidence ∈ [0,1]` in `tasks/import.md` with `confidence ∈ {high, medium, low}` + explicit `uncertainty: [string]` only, matching the pre-v03 `import` ergonomics, OR (b) ship a 20-case calibration set (10 repos with hand-labeled "correct BC/CMP/FR" vs LLM-inferred, scored for precision/recall) and gate `confidence` numeric form on passing that set. Until calibrated, the per-candidate map should never be surfaced as "0.81" in a review packet.
*Effort: 1 day (a) vs 3 days (b). Impact: stops approving a wrong domain model into a load-bearing contract.*

### P2 — Prove the thesis outside the repo (next 30 days)

**R10. Replace "traction" as thesis recap with demand capture.**
`Adversarial-Review-EWOR.md:B2`. Action: define a lightweight pipeline — DM-blast 200 senior engineers/CTOs with the manifesto link + one question ("what is the most expensive drift you have shipped in the last 6 months?"), count replies, book 15 30-min calls, annotate each with the role×mode mapping (`vibe` vs `pm` vs `dev` vs `ux`). Publish even the null result: "47 DMs → 12 replies → 4 calls → 1 pilot candidate" is a traction signal; "47 DMs → 2 replies" is market signal too. Put the top two counts on slide 10; link the raw sheet.
*Effort: 3-5 days spread over 2 weeks. Impact: converts "thesis" from founder-authored to market-observed — the single change that moves the EWOR criterion from Low → Medium.*

**R11. Instrument cognitive-surface on the only system you have: VibeLoom itself.**
Roadmap A4 + methodology §10. Action: add to `v03/engine/vibeloom_engine/status.py` the per-cycle metrics that roadmap A4 describes but defers:

- `contract_items_reviewed` (affected-cut count),
- `code_items_generated` (files + `class`/`def`/`interface` counts under `owned_paths`),
- `compression_ratio` (code / contract),
- `review_minutes_per_packet`, `rework_per_approval`.

Report after every `generate`/`review`/`reconcile` cycle on VibeLoom itself (govern the canon with the tooling where possible, or instrument a pilot repo). Publish the 5-cycle trend in `site/public/index.html` "How it feels" section.
*Effort: 1 day (engine) + 1 week (collection). Impact: the manifesto's "24% of code volume" single anecdote becomes a live, per-release metric.*

**R12. Commit to a mode taxonomy experiment with real users.**
Bad B4 + Ugly U7. Action: run 3 pilots, each on a different mode: one solo vibe project, one PM-led (`pm`), one designer-led (`ux`). After 2 weeks, ask each lead: *did the approval gate map match your operating rhythm, or did you rubber-stamp?* If `ux` mode has zero pilots, defer it to v04 and cut the matrix to 3 modes (vibe/pm/expert) — fewer modes, clearer message, less template branching. If `ux` is the wedge, lead the site narrative with it and make the comparison table put `ux-specs` on the same row as product-specs rather than as an addendum.
*Effort: scheduling + 6 hrs of interviews. Impact: replaces founder intuition about mode fit with operating evidence; removes ~15% of the template branching under uncertainty.*

**R13. Name and scope the dark-factory boundary.**
Ugly U3 + B5. Action: add a one-paragraph "What the dark factory is not (in v03)" to `codæ-manifesto.html:§7` and to `site/public/index.html` lead: humans author and approve the contract; agents stage and validate code via patches; `code-sync` traces are *claims* with `validation.runner_id` evidence, not proofs. Healing the manifesto where it says "humans never touch the construction site" (per `Adversarial-Review-EWOR.md:B5`) to "humans never edit code directly in governed scopes; patches are staged, validated, then applied" makes the factory metaphor survive contact with the next bug.
*Effort: 30 min. Impact: defuses the objection that reads the factory as "lights-out" and then finds humans editing markdown all day.*

**R14. Add a GTM funnel, or stop pitching an org moat.**
Ugly U6 + `Adversarial-Review-EWOR.md:E1-E2`. Action: one page — top-50 named target orgs (teams whose AI-generated code is already load-bearing), channel map (whitepaper → waitlist → pilot → charter design partner), conversion assumption per stage, named pilot ask per stage, monthly burn → runway math that matches the chosen Ask (R1). If the funnel cannot be written, the correct move is to reposition the round as *research incubation* (EWOR Ideation, pre-seed from operators) rather than *venture-backed distribution* — different ask, different deck, same thesis.
*Effort: half-day. Impact: answers the only question a founder-bet program asks after "do I believe this person?" — "how does this reach 10 teams who pay?"*

---

## Appendix: Evidence index

| Claim | Source file + anchor |
|---|---|
| v03 spec-only banner | `README.md: "Spec-only — engine catches up in a v0.3.x release."` |
| 41 templates | `vibeloom-templates.md:76` + `vibeloom-implementation.md:§17.3` |
| 43 ID prefixes | `engine/vibeloom_engine/ids.py:PREFIX_FAMILIES` |
| 5 modes, 6 tiers, 6 status categories | `vibeloom-methodology.md:§5`, §6, §9 |
| 14 task templates | `vibeloom-templates.md` task inventory |
| registry path divergence | `engine/vibeloom_engine/registry.py:registry_path` → `traces_dir` vs `vibeloom-implementation.md:§5.2` → `.vibeloom/state/` |
| `_coverage` returns empty | `engine/vibeloom_engine/eval_.py:_coverage` → `return {}` |
| `SLICE/DELTA/CMAP` proposals | `ideas.md:§4`, `roadmap.md:C1/C2/C4` |
| EWOR ask error | `pitch-deck/Adversarial-Review-EWOR.md:A1` + Traction €500K / Ideation €300K terms |
| No demand signal | `pitch-deck/Adversarial-Review-EWOR.md:B2` — "Zero numbers about anyone outside the founder" |
| State loss fatal | `vibeloom-implementation.md:§3.3` — "State loss is fatal in v03" |
| Prior fix-pass residual | `v03/adversarial-fix-pass-report.md: Residual items 1-5` |
| Manual path divergence | `v03/engine/vibeloom_engine/io_.py` — exposes `cache_dir/traces_dir/runs_dir` but not `state_dir` |
| Comparison honesty | `research/sdd-landscape.md` disclosure vs `site/public/methodology.html` FAQ sharp claim |
| Demo gap | No `site/public/demo.html` in `site/public/` listing |

---

*Report written adversarially, per request, against v03 canon + implementation + site + pitch artifacts as of 2026-08-07. No canon, site, skill, engine, template, or pitch-deck file was edited as part of this review. Proposed changes are listed above as operations with gates and expected effects; authorship and sequencing remain with the founder.*
