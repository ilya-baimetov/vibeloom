# VibeLoom v0.3 Canon Review Report

**Generated:** 2026-05-15. Companion to `canon-review-packet.md`.

This report covers three consecutive walks against the v0.3 canon:

- **Walk 1 (May 14)** — 11 findings (CANON-201..211). Closed; see Appendix A.
- **Walk 2 (May 15)** — 6 findings (CANON-001..006). Closed; see Walk-2 dispositions below. Surfaced defects that included two regressions from Walk-1's incomplete fixes (CANON-002 cleanup of CANON-208; CANON-005 cleanup of CANON-211).
- **Walk 3 (May 15)** — 5 findings (CANON-301..305). Closed; see Walk-3 dispositions below. Specifically targeted Walk-2 regression risk; surfaced 3 propagation gaps (CANON-301/303/304 — Walk-2 fixes that didn't cascade to all related prose) and 2 self-introduced defects (CANON-302/305 — claims I added in Walk-2 that turned out to be wrong on closer reading).

**Convention.** Disposition keys: **fixed** (issue closed by edit), **revised** (the underlying issue is real but was reframed during the walk), **kept-as-is** (issue acknowledged, design choice retained), **subsumed** (resolved as a side-effect of another finding's fix), **deferred** (entry kept; no edit this pass).

---

## Walk 2 summary

| ID | Severity | My pre-walk verdict | Disposition | One-line |
|---|---|---|---|---|
| CANON-001 | High | Accept | fixed (Option 1) | Added 4-part substrate `.vibeloom/{cache,traces,state,runs}/`; moved `id-registry.json` to `state/`; removed "structured exception" prose from impl §3.2; methodology trace-family table no longer lists id-registry. |
| CANON-002 | High | Accept | fixed (Option 1) | Cleaned up regression from Walk-1 CANON-208. impl §8 reconstructability prose now correctly describes `per_candidate`; tasks/import.md steps 5/7/Output/Postconditions rewritten — artifacts stay clean of import-only fields; trace is the single source of truth. |
| CANON-003 | High | Accept | fixed (Option 1) | tasks/status.md branches on mode — full modes use graph-cache path (unchanged); vibe emits a one-screen "where am I?" report from intent + traces with no graph-cache requirement. impl §15.6 pseudocode + SKILL routing line updated to match. |
| CANON-004 | Medium | Accept with REVISE on one sub-element | fixed (Option 1) | All 4 stale citations corrected: impl L134 §6→§14; impl L732 "templates §17.3"→"this doc §17.3"; templates L304 "methodology §5.1 derivation"→"methodology §8 / §8.2"; templates L1596 + impl §16 "§8.2 universal-trace rule"→"methodology §8.2 universal derivation rule" (impl §5.1 part kept — the prefix table genuinely owns per-row derivation). |
| CANON-005 | Medium | Accept | fixed (Option 2) | User chose 4-digit standardization (over the packet's 3-digit recommendation): impl §5.3 placeholder + 17 example occurrences padded from `NNN`/`001` to `NNNN`/`0001`. Trace IDs uniformly 4-digit; record IDs already 4-digit; consistent. |
| CANON-006 | Medium | REVISE | fixed (REVISE) | Boundary documented on the maintainer side: file-layout.md §4 gained an explicit "Authority boundary" note; root README's "What's in this repo" table grew rows for `vibeloom-dev/` and `file-layout.md`. **v03 canon stays clean** of maintainer-skill mentions (verified: 0 occurrences across all four canon files). |

---

## Walk 2 detailed dispositions

### CANON-001 · High · `id-registry` modeled as trace exception

**Disposition:** fixed (Option 1 — four-part substrate).

**Applied changes:**

- **impl §2.1 layout block** — added `state/` subdirectory under `.vibeloom/`; moved `id-registry.json` from `traces/` to `state/`.
- **impl §2.2 vibe layout** — added `state/id-registry.json` (with a note that it's lazily created on first item allocation; vibe projects with no IDed items past intent may have no `state/` directory yet).
- **impl §3 renamed** to "Cache, traces, state" with a 4-row substrate table (cache regenerable / traces append-only / state mutable / runs per-invocation).
- **impl §3.2** — removed "with `id-registry.json` as the one structured exception" — traces are now uniformly append-only JSONL.
- **impl §3.3 (new section)** — "State (`.vibeloom/state/`)" with semantics: durable mutable, read-modify-write JSON, recoverable from traces in principle but never auto-rebuilt.
- **impl §5.2** — registry path updated to `.vibeloom/state/id-registry.json`; back-reference to §3.3.
- **impl §15.7** — init pseudocode path updated.
- **methodology §11** — removed `id-registry` row from the trace-families table; added a one-line statement: "ID allocation state and retired IDs are not a trace family — they are durable mutable state under `.vibeloom/state/id-registry.json`. See implementation §3.3 and §5.2."
- **templates `references/artifacts.md`** — substrate description grew to 4-row split; layout block moved id-registry to `state/`; trace-families list dropped the "structured exception" mention.
- **templates `tasks/init.md`** — postcondition path updated.

**Verification:**

- `grep -c '\.vibeloom/traces/id-registry' v03/{vibeloom-implementation.md,vibeloom-methodology.md,vibeloom-templates.md}` → 0 / 0 / 0.
- `python3 v03/extract-templates.py --check` → `OK: 41 templates match disk`.

**Downstream impact.**
- Engine: `vibeloom_engine.registry` module path expectation changes from `.vibeloom/traces/id-registry.json` to `.vibeloom/state/id-registry.json`; engine init code must create `state/` directory.
- Site `llms.txt` / implementation page: substrate description needs alignment (deferred to site pass).

---

### CANON-002 · High · Import evidence has two contradictory homes (regression cleanup from Walk-1 CANON-208)

**Disposition:** fixed (Option 1 — import trace authoritative everywhere).

**Applied changes:**

- **impl §8 Reconstructability principle** — rewritten: "import traces carry both an aggregate summary (`evidence_summary`, `candidates_proposed`, `confidence_distribution`) and a per-candidate map (`per_candidate: {<item_id>: {confidence, evidence_refs, uncertainty}}`) — artifacts stay clean of import-only fields, with per-candidate rationale queryable from the trace (see §8.6)."
- **templates `tasks/import.md`**:
  - Step 4: confidence "high/medium/low" → "numeric 0–1 plus uncertainty list".
  - Step 5: relabeled to "Evidence collection per candidate"; explicitly forbids adding `evidence`/`confidence`/`uncertainty` to artifact rows.
  - Step 6: "Draft writing in tier order ... using the standard artifact templates with `derives_from` ... Artifact rows stay clean of import-only fields."
  - Step 7: "Emit one `import` trace per invocation carrying both aggregate summary ... and `per_candidate` ... see implementation §8.6."
  - Output: explicit `schema_version: 1.1`, `per_candidate` map keyed by allocated item IDs.
  - Postconditions: "per-candidate confidence and evidence are queryable from `.vibeloom/traces/imports.jsonl.per_candidate` keyed by item ID."

**Verification:**

- `grep -c 'free-form evidence field\|evidence field on' v03/vibeloom-implementation.md v03/vibeloom-templates.md` → only the unrelated `ux_evidence field` (UX-derived product-spec traceability — different concept).
- `python3 v03/extract-templates.py --check` → `OK: 41 templates match disk`.

**Downstream impact.**
- Engine: import writer must emit `per_candidate` map per the schema in §8.6 (already required by Walk-1 CANON-208; this walk closes the documentation drift).
- Review tooling: when surfacing draft items recently produced by `import`, join against `imports.jsonl.per_candidate` keyed by item ID.

---

### CANON-003 · High · Vibe-mode status semantics conflict

**Disposition:** fixed (Option 1 — branch tasks/status.md by mode).

**Scope clarification (during walk):** confirmed only `tasks/status.md` requires mode-branching. All other vibe-public tasks (`approve`, `generate-code-component`, `reconcile`, `review`, `eval`) are tier-agnostic and work in both vibe and full modes without modification.

**Applied changes:**

- **templates `tasks/status.md`** — fully rewritten:
  - Purpose: explicitly states the mode-branched behavior.
  - Inputs: `--target` and `--verbose` marked "full modes only".
  - Preconditions: split — full modes require graph cache; all modes accept missing approvals as "no approvals yet" advisory.
  - Steps: split into "Full modes" (existing 8-step graph-based flow) and "Vibe mode" (new 8-step lightweight flow: read intent + tail approvals/generations/decisions; compute intent_state, code_state; recommend next; render one-screen report; **never write graph or status cache**).
  - Output / Postconditions / Constraints / Invariants: per-branch.
- **impl §15.6** — pseudocode rewritten to branch on `engine.detect_mode()`. Vibe path: read intent + 3 trace tails, compute states, recommend next, return — no cache.
- **templates SKILL.md routing table** — `status` row's note: "Branches on mode: full modes use graph cache; vibe reads compact artifacts + traces (no cache)."

**Verification:**

- `grep -c 'For full modes\|Vibe mode' v03/vibeloom-templates.md` → 8 (in the rewritten task).
- `python3 v03/extract-templates.py --check` → `OK: 41 templates match disk`.

**Downstream impact.**
- Engine: `status` implementation must detect mode and branch; vibe path must NOT touch `.vibeloom/cache/`.
- `references/modes.md` — vibe public surface still lists `status` (correct).

---

### CANON-004 · Medium · Wrong section citations

**Disposition:** fixed (Option 1, with REVISE on one sub-element).

**Applied changes:**

- **impl §4 line 134** — "patch staging and atomic application (see §6)" → "(see §14)". §14 is the canonical "Patch-based writes" section.
- **impl §12 line 732** — "templates §17.3" → "this document (§17.3) and the SKILL.md template inside `vibeloom-templates.md`". §17.3 lives in implementation, not templates.
- **templates `references/artifacts.md` L304** — "methodology Contract Graph (§5.1 derivation rules + §8 graph)" → "methodology Contract Graph (§8, with derivation rules in §8.2) and the implementation's ID prefix registry (§5.1)". Methodology §5.1 is "Vibe is intentionally minimal" — completely wrong target; methodology §8.2 is the canonical derivation rules.
- **templates `references/eval.md` L1596** — REVISE applied. Original packet finding was "impl §5.1 derivation rules and §8.2 universal-trace rule" both wrong. My REVISE: impl §5.1 IS where per-prefix derivation rules live (in the table's "Notes" column), so that part is correct. But "impl §8.2" is wrong (it's code-sync trace); the universal derivation rule is **methodology §8.2**. Fixed: "implementation §5.1 (per-prefix derivation rules in the registry table) and methodology §8.2 (universal derivation rule — every non-root item must cite valid upstream basis transitively reaching `CAP` or `CST`)."
- **impl §16 acceptance criterion** — same REVISE applied: "Engine validates `derives_from` per §5.1 (per-prefix derivation rules in the registry table) and methodology §8.2 (universal derivation rule)."

**Verification:**

- `grep -nE "see §6\)|vibeloom-templates\.md §17\.3|§5\.1 derivation rules and §8\.2 universal" v03/vibeloom-{implementation,templates}.md` → 0 matches.
- Spot-checked: every cited section now resolves to the claimed topic.

**Downstream impact.**
- Skill bundle re-extracted; agents using `eval.md` or `artifacts.md` references now land on the right canon sections.

---

### CANON-005 · Medium · Decision-trace ID width inconsistency

**Disposition:** fixed (Option 2 — user chose 4-digit standardization, overriding the packet's 3-digit recommendation).

**Applied changes:**

- **impl §5.3 declaration** — `<KIND>-<YYYYMMDD>-<NNN>` → `<KIND>-<YYYYMMDD>-<NNNN>`; "NNN starts at 001" → "NNNN starts at 0001"; declaration examples padded to `APPROVAL-20260502-0001`, `RUN-20260502-0001`, `REVIEW-20260502-0001`.
- **impl §8.5 dual-ID prose (line 488)** — "uniform dated `DEC-YYYYMMDD-NNN`" → "uniform dated `DEC-YYYYMMDD-NNNN`". Also tightened the record_id grouping from "(`IDR | PDR | UDR | ADR-NNNN`, ...)" to "in the sequence-only `<RECORD>-NNNN` family with `RECORD ∈ {IDR, PDR, UDR, ADR}`".
- **17 example occurrences across impl §8.1–8.6, §11.1, §11.2, §13.1, §13.4** — padded via Python regex pass from `KIND-YYYYMMDD-NNN` to `KIND-YYYYMMDD-NNNN` (e.g. `APPROVAL-20260502-001` → `APPROVAL-20260502-0001`, `DEC-20260502-003` → `DEC-20260502-0003`, `RUN-20260502-004` → `RUN-20260502-0004`, `TASK-20260502-014` → `TASK-20260502-0014`).
- Templates already used 4-digit (`DEC-20260512-0007`); methodology has no examples; record IDs (`ADR-0007`) already 4-digit per Walk-1 CANON-211.

**Verification:**

- `grep -nE "(APPROVAL|SYNC|GEN|EVAL|DEC|IMP|RUN|TASK|PLAN|REVIEW|RECON)-[0-9]{8}-[0-9]{3}([^0-9]|\$)" v03/vibeloom-{implementation,templates,methodology}.md` → 0 matches.
- `python3 v03/extract-templates.py --check` → `OK: 41 templates match disk`.

**Downstream impact.**
- Engine: trace-ID writer must zero-pad to 4 digits; trace-ID parser must accept 4 digits (and ideally accept legacy 3-digit IDs in already-on-disk traces during a transition window).
- Tests: any test fixture using 3-digit trace IDs needs regeneration.

---

### CANON-006 · Medium · v03 canon doesn't acknowledge `vibeloom-dev` / `file-layout.md`

**Disposition:** fixed (REVISE — boundary documented in README only; v03 canon untouched).

**My pre-walk REVISE:** the underlying issue was real (a fresh reader of HEAD finds two skill surfaces with no explicit boundary), but the packet's recommended fix put the note inside v03 methodology/implementation — wrong direction. v03 canon is the user-facing project methodology; bolting maintainer-infrastructure awareness onto it pollutes the user surface.

**Iteration during walk.** First attempt added an "Authority boundary" subsection to `file-layout.md §4`. User flagged this as **scope creep**: file-layout.md explicitly says (Status of versions section) it covers v04 onward only, and v01–v03 are frozen in legacy layouts not described there. My addition reached into v01–v03 to make rules about them, violating file-layout.md's stated scope. Reverted and moved the cross-skill statement to the README, which legitimately spans all versions.

**Applied changes (final):**

- **Root `README.md` "What's in this repo" table** — added two rows:
  - `vibeloom-dev/` — Maintainer skill — self-contained boundary text: "Orthogonal Claude/Codex skill for *developing* VibeLoom itself ... Operates against any `vNN/` version. Not the user-facing VibeLoom skill (that's `vNN/SKILL.md`); shares no command surface or schema."
  - `file-layout.md` — Reference (v04+) — explicitly noted as v04+ scope, with the "v01–v03 are frozen in their own legacy layouts and not covered by this doc" caveat.
- **Root `README.md` blockquote callout** — added immediately after the table: a one-paragraph "Two skills in this repo" statement spelling out both command surfaces and asserting orthogonality. Lives at the cross-version layer where it belongs.
- **`file-layout.md` §4** — UNCHANGED from original (the brief "dev skill bundle that develops vibeloom itself" intro). The Authority-boundary addition was reverted.

**v03 canon untouched** — no edits to v03 methodology, implementation, templates, or manifesto.

**Verification:**

- `grep -c 'vibeloom-dev\|file-layout\|maintainer skill' v03/{vibeloom-methodology.md,vibeloom-implementation.md,vibeloom-templates.md,codæ-manifesto.html}` → 0 / 0 / 0 / 0. v03 canon stays clean.
- `file-layout.md §4` opens with "A Claude/Codex skill bundle that develops vibeloom itself..." (original); no scope-creeping boundary subsection.
- README "Two skills in this repo" callout present immediately after the repo-contents table.
- file-layout.md still only mentions v01–v03 in the "frozen, not described here" context (lines 6, 26).

**Downstream impact.**
- Helper prompts (`vibeloom-dev/references/*.md`) may want to point at the README "Two skills in this repo" callout; deferred to a `vibeloom-dev`-side review.

---

## Final Walk-2 verification commands

```
$ python3 v03/extract-templates.py --check
OK: 41 templates match disk

$ grep -c '\.vibeloom/traces/id-registry' v03/vibeloom-implementation.md v03/vibeloom-methodology.md v03/vibeloom-templates.md
0 / 0 / 0

$ grep -nE "(APPROVAL|SYNC|GEN|EVAL|DEC|IMP|RUN|TASK|PLAN|REVIEW|RECON)-[0-9]{8}-[0-9]{3}([^0-9]|$)" v03/...
(no matches)

$ grep -c 'vibeloom-dev\|file-layout\|maintainer skill' v03/vibeloom-{methodology,implementation,templates}.md v03/codæ-manifesto.html
0 / 0 / 0 / 0

$ grep -c "free-form evidence field\|evidence field on" v03/vibeloom-implementation.md v03/vibeloom-templates.md
1 (false positive: ux_evidence field — different concept)
```

---

## Downstream surfaces flagged for follow-up (Walk 2)

1. **Engine** (`engine/` Python package) — runtime consumers of:
   - **Substrate path:** `id-registry.json` location is now `.vibeloom/state/id-registry.json`. Init must create `state/` directory.
   - **Trace ID width:** writer must zero-pad to 4 digits; parser may want to accept legacy 3-digit IDs during transition.
   - **Status branch:** `status` implementation must detect mode and branch (vibe path skips graph cache).
   - **Import trace schema:** writer must emit `per_candidate: {<item_id>: {confidence, evidence_refs, uncertainty}}` — already required from Walk 1; this walk closed the documentation drift.
2. **Site** (`v03/site/public/*.html` and `llms.txt`) — substrate description, status semantics, import evidence model. Defer to a site-side pass (`review-site.md`).
3. **Skill bundle** — re-extracted clean during this pass; deployable.
4. **`vibeloom-dev/references/*.md`** — may want to reference the new `file-layout.md §4 "Authority boundary"` explicitly. Defer to a vibeloom-dev-side review.

---

---

## Walk 3 summary

| ID | Severity | Disposition | One-line |
|---|---|---|---|
| CANON-301 | High | fixed (Option 1) | Reframed "no formal status" → "no per-item status taxonomy; lightweight one-screen status only" in methodology L106 + L116, references/modes.md L948, impl §2.2 prose. Aligns prose with Walk-2 CANON-003 reality. |
| CANON-302 | High | fixed (combined with CANON-301 prose edit) | impl §2.2 "id-registry created lazily" sentence rewritten to reflect eager-init reality from §15.7 + tasks/init.md: "initialized at `init` time with empty counters... grows as intent's CAP/CST items are allocated". |
| CANON-303 | High | fixed (Option 1) | §16 acceptance criteria updated: 4-part substrate split criterion added; per_candidate import-trace criterion added (`schema_version: 1.1`); status mode-branch criterion added; vibe-layout criterion rewritten to drop the stale "ephemeral status.json" claim; ID-registry criterion expanded to mention `state/` path + per-record_type counters; trace-ID width criterion added (uniform 4-digit). 22 criteria total. |
| CANON-304 | Medium | fixed (Option 1) | `references/runtime.md` "Context loading" section now has explicit `Orchestrator (full modes)` and `Orchestrator (vibe)` subsections, symmetric with the existing `Subagent load sets (full modes)` label. |
| CANON-305 | Medium | fixed (Option 1, more conservative than my recommendation) | impl §3.3 state-recovery claim replaced. The packet recommended Option 3 (tag as v0.4+ with algorithm sketch); user chose Option 1 (state loss is fatal in v0.3, no recovery procedure). New prose: "State loss is fatal in v0.3 — there is no recovery procedure. Treat `.vibeloom/state/` like `.vibeloom/traces/` for backup purposes... Trace-replay-based recovery is a v0.4+ candidate." |

---

## Walk 3 detailed dispositions

### CANON-301 · High · Vibe-status prose drift across 4 surfaces

**Disposition:** fixed (Option 1).

**Applied changes:**

- **methodology L106** (modes table cell for vibe): "minimal — no graph, no code-sync, no formal status" → "minimal — no graph, no code-sync, no per-item status (lightweight `where am I?` status report only)".
- **methodology L116** (vibe prose): "No IDed graph, no code-sync trace, no formal status. A modern model..." → "No IDed graph, no code-sync trace, no per-item status taxonomy; `status` in vibe is a lightweight one-screen `where am I?` report computed from intent + trace tails (see implementation §15.6). A modern model...".
- **templates `references/modes.md` L948**: same as methodology L116.
- **impl §2.2 prose**: rewrote the entire post-layout-block paragraph. Replaced "A `status.json` cache may appear after a `status` invocation..." with "No status cache — vibe `status` is recomputed on each invocation from `intent.md` content + tail of `approvals.jsonl` / `generations.jsonl` / `decisions.jsonl`; see §15.6 for the algorithm." Also replaced "id-registry created lazily..." with the eager-init explanation (subsumes CANON-302 — see below).

**Verification:**
- `grep -n "no formal status" v03/vibeloom-{methodology,implementation,templates}.md` → 0.
- `grep -n "status\.json may appear" v03/vibeloom-implementation.md` → 0.
- `python3 v03/extract-templates.py --check` → `OK: 41 templates match disk`.

---

### CANON-302 · High · "id-registry created lazily" claim contradicts always-init

**Disposition:** fixed (subsumed by CANON-301's §2.2 prose rewrite).

**Notes.** I introduced the "lazy" sentence in Walk-2 CANON-001 to soften the §2.2 layout block. But init (per tasks/init.md and §15.7) always creates `id-registry.json` at scaffold time, regardless of mode. The CANON-301 §2.2 prose rewrite replaced both the stale `status.json` claim AND the stale "lazy" claim in a single edit — they were in adjacent sentences of the same paragraph.

New prose: *"The `state/id-registry.json` is initialized at `init` time with empty counters (per §15.7) and grows as intent's CAP/CST items are allocated; vibe never grows it past intent unless the user upgrades."*

**Verification:** `grep -n "lazily on first item allocation" v03/vibeloom-implementation.md` → 0.

---

### CANON-303 · High · §16 acceptance criteria stale post-Walk-2

**Disposition:** fixed (Option 1 — surgical update).

**Applied changes:** §16 grew from 20 criteria to 22, with 4 substantive updates:

1. **Substrate split** (replaced "`.vibeloom/cache/` and `.vibeloom/traces/` are separated"): "The `.vibeloom/` substrate is split into four subdirectories with distinct semantics: `cache/` (regenerable derived state), `traces/` (append-only JSONL provenance), `state/` (durable mutable runtime state — id-registry), `runs/` (per-invocation subagent staging). See §3."
2. **ID registry expansion** (expanded "ID registry persists retired IDs and next counters"): added explicit path `.vibeloom/state/id-registry.json` and per-record_type counter mention.
3. **Trace-ID width** (expanded "Trace families have schemas with a `schema_version` field"): added "Trace and runtime IDs use the uniform 4-digit dated form `<KIND>-YYYYMMDD-NNNN`; rendered decision-record IDs use the sequence-only 4-digit form `<RECORD>-NNNN`."
4. **Import trace per_candidate** (new criterion): "Import traces (§8.6, schema `1.1`) carry both an aggregate summary and a `per_candidate: {<item_id>: {confidence, evidence_refs, uncertainty}}` map; per-candidate inference rationale is queryable from the trace, not from artifact frontmatter (artifacts stay clean of import-only fields)."
5. **Status mode-branch** (replaced "`status` distinguishes `current`, `stale`, ..."): rewritten to make the mode branch explicit — "full modes use the graph cache and distinguish `current`, `stale`, ... ; vibe emits a lightweight one-screen report ... with no cache writes."
6. **Vibe-layout criterion** (replaced the stale "ephemeral status.json" claim): "Vibe layout is genuinely minimal — approval and decision traces and the `state/id-registry.json` (initialized at `init`) are durable; graph cache and status cache are not. Vibe `status` is recomputed on each invocation from artifacts and trace tails — it never writes a status snapshot."

**Verification:**
- `awk '/^## 16/,/^## 17/' v03/vibeloom-implementation.md | grep -c '^- '` → 22.
- `grep -c 'ephemeral.*status\.json' v03/vibeloom-implementation.md` → 0.
- `grep -c 'per_candidate' v03/vibeloom-implementation.md` → 9 (was 7 before §16 update; +2 in new criterion).
- `awk '/^## 16/,/^## 17/' v03/vibeloom-implementation.md | grep -c 'four subdirectories'` → 1.

---

### CANON-304 · Medium · `references/runtime.md` Orchestrator-loads section is mode-blind

**Disposition:** fixed (Option 1).

**Applied changes:** Split the existing "Orchestrator" subsection in `references/runtime.md` into two:

- **`Orchestrator (full modes)`** — keeps the original "Loads: skill instructions, status snapshot, graph cache..." text.
- **`Orchestrator (vibe)`** (new): "Loads: skill instructions, current `intent.md`, recent tails of `approvals.jsonl` / `generations.jsonl` / `decisions.jsonl`. No graph or status cache exists; nothing to load there. Vibe operations rarely dispatch subagents (most are single-task or orchestrator-local), so post-dispatch retention is minimal."

This restores symmetry with the `Subagent load sets (full modes)` label that already existed below.

**Verification:** `grep -c "Orchestrator (vibe)" v03/vibeloom-templates.md` → 1; `python3 v03/extract-templates.py --check` → OK.

---

### CANON-305 · Medium · §3.3 state-recovery claim has no procedure

**Disposition:** fixed (Option 1 — user override of my Option 3 recommendation).

**My pre-walk recommendation:** Option 3 (keep recoverability claim as aspirational, tag with v0.4+, document algorithm sketch). My reasoning: don't strand a useful future capability.

**User chose Option 1:** drop recoverability entirely; state loss is fatal in v0.3.

**Reasoning for the user's choice (correct, more conservative):** "recoverable in principle" is a hand-wave that engine implementers will either (a) build incompletely and fail unpredictably, or (b) ignore. Saying "state loss is fatal; back it up like traces" is honest about v0.3 scope. If recovery becomes a real v0.4 capability, design it then with full operational backing — not as a defer-aspiration in v0.3.

**Applied change:**

> *"State loss is fatal in v0.3 — there is no recovery procedure. Treat `.vibeloom/state/` like `.vibeloom/traces/` for backup purposes: if it disappears, the project's ID allocation history disappears with it (next-counters reset, no awareness of retired IDs, risk of ID reuse against historical traces). Trace-replay-based recovery is a v0.4+ candidate."*

**Verification:** `grep -c 'State loss is fatal in v0.3' v03/vibeloom-implementation.md` → 1.

---

## Post-Walk-3 verification

```
$ python3 v03/extract-templates.py --check
OK: 41 templates match disk

$ grep -c 'no formal status' v03/{vibeloom-methodology.md,vibeloom-implementation.md,vibeloom-templates.md}
0 / 0 / 0

$ grep -c 'lazily on first item allocation' v03/vibeloom-implementation.md
0

$ grep -c 'ephemeral.*status\.json' v03/vibeloom-implementation.md
0

$ awk '/^## 16/,/^## 17/' v03/vibeloom-implementation.md | grep -c '^- '
22

$ grep -c 'per_candidate' v03/vibeloom-implementation.md
9

$ grep -c 'Orchestrator (vibe)' v03/vibeloom-templates.md
1

$ grep -c 'State loss is fatal in v0.3' v03/vibeloom-implementation.md
1
```

---

## Appendix A · Walk 1 (May 14) — closed dispositions

For reference; all closed.

| ID | Severity | Disposition | One-line |
|---|---|---|---|
| CANON-201 | Critical | fixed | Restored `roadmap.md` from HEAD; rewrote 4 in-template references as plain prose. |
| CANON-202 | High | fixed | §17.3 inventory math: 41 = 1+1+6+14+18+1; "six families"; README is its own row. |
| CANON-203 | High | subsumed by CANON-211 | Decision-record path inconsistency in `references/artifacts.md` resolved by the dual-ID redesign. |
| CANON-204 | High | fixed | §15.8 import pseudocode redesigned around the actual single-task `tasks/import.md`. |
| CANON-205 | Medium | fixed | `references/operations.md` cites methodology §15+§16 (drift+workflow) instead of stale §11. |
| CANON-206 | Medium | fixed | Methodology §10 normatively defines "cognitive surface" instead of stub-pointing. |
| CANON-207 | Medium | fixed | Removed misleading `≡` parenthetical in methodology §6.5. |
| CANON-208 | Medium | fixed (Option 4) | Per-candidate import evidence in trace `per_candidate`; artifacts stay clean. *(Walk-2 CANON-002 cleaned up the documentation regression.)* |
| CANON-209 | Low | subsumed by CANON-202 | "Project-level meta" family renamed to "README" with precise contract. |
| CANON-210 | Low | kept-as-is | "hommage" reconfirmed as intentional French-flavored idiom. |
| CANON-211 | High | fixed (Option 2) | Sequence-only `record_id` per record_type (`ADR-0007`); dated `trace_id` stays. *(Walk-2 CANON-005 standardized trace counter width to 4-digit.)* |
