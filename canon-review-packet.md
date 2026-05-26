# VibeLoom v03 Canon Review Packet

**Generated:** 2026-05-18 by re-executing `v03/review-canon.md` against the current edited worktree.

**Scope:** `v03/codæ-manifesto.html`, `v03/vibeloom-methodology.md`, `v03/vibeloom-implementation.md`, `v03/vibeloom-templates.md`.

**Posture:** adversarial. This packet does not apply canon edits. It is the current issue packet to walk interactively.

**Mechanical checks run:**

- `git status --short` -> clean.
- `python3 v03/extract-templates.py --check` -> `OK: 41 templates match disk`.
- `python3 v03/site/scripts/check_consistency.py` -> `Consistency check OK`, with an existing Python `SyntaxWarning` for an invalid backtick escape in the checker docstring.
- `html.parser` accepted `v03/codæ-manifesto.html`.

---

## 1. Source Map

### 1.1 Document outlines

| Document | Current role | Major sections |
|---|---|---|
| `v03/codæ-manifesto.html` | WHY: paradigm thesis and evidence | destination, contract, paradigm, blocker, mendable surface, durable object, ladder, bet, references |
| `v03/vibeloom-methodology.md` | WHAT: concepts and governance semantics | relationship to codæ, principles, use cases, layers/traces, modes, artifacts, Contract Graph, status, cognitive surface, traces, operations, packets, eval, change classification, workflows, non-goals |
| `v03/vibeloom-implementation.md` | HOW: runtime model and schemas | architecture, layouts, cache/traces/state, engine, IDs/registry, frontmatter, validation registry, trace schemas, graph cache, status, operation packets, task templates, dispatch, patch writes, operation pseudocode, acceptance criteria, templates |
| `v03/vibeloom-templates.md` | MATERIALIZATION: skill and templates | template inventory, `SKILL.md`, subagent prompt, six references, fourteen task templates, eighteen artifact templates |

### 1.2 Authority map

| Concern | Canonical owner | Materialized surfaces |
|---|---|---|
| Why contract-driven agentic engineering exists | Manifesto | Public site, `llms.txt`, pitch material |
| Modes, operations, status meanings, trace families, approval semantics | Methodology | `references/modes.md`, `references/operations.md`, task prompts |
| Layouts, caches, traces, state, schemas, IDs, registry, dispatch, engine behavior | Implementation | `references/artifacts.md`, `references/runtime.md`, engine |
| Prompt/task/reference/artifact wording agents execute | Templates | Extracted `v03/templates/**`, skill bundle |

### 1.3 Current state after edits

| Probe | Result |
|---|---|
| `id-registry` as trace exception | Fixed. Methodology and implementation now place it under `.vibeloom/state/id-registry.json`. |
| Import evidence home | Mostly fixed. Evidence now lives in `imports.jsonl.per_candidate`; remaining issue is ID timing. |
| Vibe `status` | Mostly fixed. `tasks/status.md` branches by mode and does not write cache in vibe. |
| Manifesto living evidence | Present. References include dated-evidence policy and May 2026 freshness note. |
| Template extraction | Clean. 41 templates match disk. |

### 1.4 Drift-pressure surfaces

| Surface | Drift pressure |
|---|---|
| `vibe` mode | Status is fixed, but generation/import/eval/approve still leak graph/component/code-sync assumptions. |
| Import | `per_candidate` is item-ID keyed, but the task says imported candidates have no IDs until approval. |
| UX-led product generation | Task asks for `ux_evidence` fields not defined by product artifact templates. |
| ID registry/root terminology | Implementation distinguishes allocation namespace vs graph root; skill reference collapses it. |
| BC/component topology | Methodology/implementation say 1:1 in the domain layer; some templates still permit multi-BC components. |
| Template provenance | Implementation examples use `0.3.1`; actual task trailers are all `0.3.0`. |
| Section citations | Some extracted task text uses bare or misleading `§5.1` references after extraction. |

---

## 2. Findings

### CANON-001: `vibe` mode still leaks full-mode graph, component, and code-sync machinery

**Severity:** High

**Location:**

- `v03/vibeloom-methodology.md:106` says `vibe` has "minimal -- no graph, no code-sync, no per-item status".
- `v03/vibeloom-methodology.md:116-118` says `vibe` has no IDed graph and no code-sync trace.
- `v03/vibeloom-implementation.md:90` says `vibe` has no graph cache, no code-sync trace, and no status cache.
- `v03/vibeloom-templates.md:243-249` lists engine commands as graph/cache/status-persisting, without mode qualification.
- `v03/vibeloom-templates.md:282` routes `generate code` to `tasks/generate-code-component.md`, "one subagent per affected component".
- `v03/vibeloom-templates.md:1651-1680` defines code generation as a per-component task with full lineage and approved component-level `system-specs`.
- `v03/vibeloom-templates.md:1716` requires writing a `code-sync` trace.
- `v03/vibeloom-templates.md:1765-1799` says `generate-context` loads graph, emits per-container/per-component context and BDD, and updates the Contract Graph.
- `v03/vibeloom-templates.md:1527-1535` says `approve` refreshes the Contract Graph cache.
- `v03/vibeloom-templates.md:1591-1603` says `eval` requires/builds `.vibeloom/cache/contract-graph.json`.
- `v03/vibeloom-templates.md:2361` says `import` initializes `.vibeloom/cache/contract-graph.json`, with no `vibe` exception.

**Issue:** `status` is mode-aware now, but adjacent operation templates still route `vibe` through full-mode graph/component/cache/code-sync behavior.

**Why it matters:** `vibe` is supposed to be the low-ceremony path from intent to a small generated system. If the forward path depends on component specs, graph cache, structural eval, or code-sync traces, the documented mode cannot execute without silently growing into full mode.

**Fix options:**

1. Add explicit `vibe` branches to `approve`, `eval`, `import`, `generate-context`, and `generate-code`.
   - Keeps one command surface. The cost is conditional complexity in several templates.
2. Add dedicated compact tasks: `generate-vibe-system.md`, `generate-vibe-context.md`, `generate-vibe-code.md`, plus a `vibe` branch in `import`/`approve`/`eval`.
   - Cleanest mental model. More files and routing changes.
3. Restrict `vibe` to `init`, `review intent-specs`, `approve intent-specs`, `status`, and `upgrade`; require upgrade before code generation/import-generated graph behavior.
   - Simplest runtime. Weakens the product promise of `vibe`.

**Recommended fix:** Option 2. `vibe` is not a stripped full mode; separate compact tasks prevent full-mode assumptions from leaking back in.

**Verification:**

- `SKILL.md` command routing has explicit `vibe` routes or explicit `vibe` refusal rules.
- No `vibe` path writes `.vibeloom/cache/contract-graph.json`, `.vibeloom/cache/status.json`, or `.vibeloom/traces/code-sync.jsonl`.
- `tasks/approve.md`, `tasks/eval.md`, `tasks/import.md`, `tasks/generate-context.md`, and code-generation routing state full-mode vs `vibe` behavior explicitly.
- `python3 v03/extract-templates.py --check`.

**Downstream impact:** skill routing, engine behavior, extracted templates, getting-started docs, site if `vibe` is marketed as intent-to-code.

---

### CANON-002: Import ID allocation is contradictory

**Severity:** High

**Location:**

- `v03/vibeloom-implementation.md:614` says `per_candidate` is keyed by the same item IDs that appear in produced draft artifacts.
- `v03/vibeloom-implementation.md:1267` says the import trace is keyed by IDs the orchestrator allocated to each draft.
- `v03/vibeloom-templates.md:2351-2353` says evidence is collected for each candidate item ID and trace `per_candidate` is keyed by item ID.
- `v03/vibeloom-templates.md:2360` says the import trace has a `per_candidate` map keyed by allocated item IDs.
- `v03/vibeloom-templates.md:2368` says "no IDs allocated yet to imported candidates (engine assigns final IDs at approval time)."

**Issue:** Import requires allocated item IDs for draft artifacts and trace evidence, then says no IDs are allocated until approval.

**Why it matters:** Review packets need stable candidate IDs before approval. If IDs only appear at approval time, `per_candidate` cannot be keyed by item ID and reviewers cannot safely accept/reject individual candidates. If IDs are allocated at import time, the registry must advance before approval and the canon must say so.

**Fix options:**

1. Allocate draft IDs during import and persist them immediately.
   - Aligns with current implementation text and enables stable review/evidence joins. Rejected IDs remain spent/retired.
2. Use temporary candidate IDs during import, then remap to final IDs at approval.
   - Preserves semantic ID space, but requires a remap trace and complicates review tooling.
3. Key import evidence by content fingerprints until approval.
   - Avoids ID spending, but makes review and patch application brittle.

**Recommended fix:** Option 1. Stable IDs are the review surface; spending IDs for rejected drafts is cheaper than remapping.

**Verification:**

- `tasks/import.md` no longer says IDs are unallocated until approval.
- Implementation §15.8 explicitly allocates draft IDs before writing draft artifacts and `imports.jsonl.per_candidate`.
- Registry semantics say rejected draft IDs are retired or remain spent.
- `rg -n "no IDs allocated|approval time|allocated item IDs|per_candidate" v03/vibeloom-implementation.md v03/vibeloom-templates.md`.

**Downstream impact:** import engine, review packet rendering, ID registry behavior, extracted import task.

---

### CANON-003: UX-led product generation introduces a noncanonical `ux_evidence` field

**Severity:** Medium

**Location:**

- `v03/vibeloom-methodology.md:131-133` says UX evidence may drive product-spec generation.
- `v03/vibeloom-methodology.md:237` allows downstream items to derive from approved upstream items or accepted input evidence.
- `v03/vibeloom-templates.md:1962` says each FR/NFR cites UX backing in a structured `ux_evidence` field.
- `v03/vibeloom-templates.md:1995` says `ux_evidence` on each generated item enables traceability.
- `v03/vibeloom-templates.md:3147-3181` defines PRD tables without a `ux_evidence` column.
- `v03/vibeloom-templates.md:3248+` defines USM tables without `ux_evidence` columns.

**Issue:** The `generate-product-specs-from-ux` task tells agents to add a structured field that product artifact templates do not define.

**Why it matters:** This is exactly how schema drift starts: one task emits fields that the parser, templates, and validation rules do not know about. The intended evidence relationship can be represented by `derives_from` (`VIEW`, `INT`, `UXC`, `MOCK`) and/or generation trace metadata; adding ad hoc row fields makes product-specs harder to parse and validate.

**Fix options:**

1. Remove `ux_evidence` from product artifacts; use `derives_from` plus PM peer-review packet evidence.
   - Keeps artifact schemas clean and uses existing graph/traces.
2. Add `ux_evidence` as a canonical optional column to relevant product tables.
   - Makes review evidence visible in-place, but expands product schema and requires parser support.
3. Put per-item UX evidence in the generation trace, analogous to import `per_candidate`.
   - Clean provenance model, but requires a generation trace schema extension.

**Recommended fix:** Option 1 for v03. It is the smallest correct fix: product rows cite UX IDs in `derives_from`; the review packet can render those links with evidence detail.

**Verification:**

- No product-generation task instructs agents to write a `ux_evidence` field into product artifacts.
- PM peer-review packet still shows UX/mockup backing by joining `derives_from` IDs.
- `rg -n "ux_evidence" v03/vibeloom-templates.md v03/templates`.

**Downstream impact:** product artifact templates, parser/structural eval, UX-mode generation task, PM peer-review packet.

---

### CANON-004: The skill reference loses the `root` namespace vs graph-root distinction

**Severity:** Medium

**Location:**

- `v03/vibeloom-implementation.md:176-181` explicitly separates allocation namespace (`root`) from graph root, and says only `CAP` and `CST` are graph roots.
- `v03/vibeloom-implementation.md:183-185` starts a table with separate `Namespace` and `Graph root?` columns.
- `v03/vibeloom-templates.md:624-628` says the prefix registry is reproduced for runtime load-on-demand.
- `v03/vibeloom-templates.md:628-673` collapses the reproduced table to one `Scope` column and omits `Graph root?`.

**Issue:** The implementation fixed the known ambiguity, but the extracted agent-facing reference drops the column that makes the fix durable.

**Why it matters:** Agents are instructed to load `references/artifacts.md`; they may never load the full implementation table. In that context, `FR | ... | root` can again look like a graph-root entity instead of a repo-wide allocation namespace.

**Fix options:**

1. Mirror the implementation table shape in `references/artifacts.md`: `Namespace` plus `Graph root?`.
   - Best fidelity. Slightly wider table, but this is a schema reference.
2. Keep the compact table but add a prominent note before it defining `Scope=root` and listing graph roots.
   - Lower churn, but weaker because the distinction is not carried per row.
3. Remove the reproduced prefix registry and force agents to load implementation §5.1.
   - Avoids duplication drift, but hurts context efficiency.

**Recommended fix:** Option 1. Runtime references should preserve the discriminating columns.

**Verification:**

- Extracted `skill/references/artifacts.md` has separate `Namespace` and `Graph root?` columns or equivalent per-row representation.
- `CAP` and `CST` are the only rows marked graph root.
- `rg -n "Graph root|Namespace|Scope" v03/vibeloom-templates.md v03/templates/skill/references/artifacts.md`.

**Downstream impact:** skill reference, structural eval guidance, graph construction, generated artifact derivation.

---

### CANON-005: Domain bounded-context cardinality is still loosened in templates

**Severity:** Medium

**Location:**

- `v03/vibeloom-methodology.md:192-195` says each domain-layer component hosts exactly one bounded context and each bounded context belongs to exactly one component.
- `v03/vibeloom-implementation.md:327-331` repeats the exact 1:1 domain-layer mapping.
- `v03/vibeloom-templates.md:3388-3395` repeats the exact-one rule in `component.md`.
- `v03/vibeloom-templates.md:3496` says every domain CMP references "at least one BC".
- `v03/vibeloom-templates.md:3497` says "Components from the same BC must be co-located in this container."
- `v03/vibeloom-templates.md:3553` repeats "at least one BC" for domain CMPs.

**Issue:** The template guidance permits multiple bounded contexts per domain component, while methodology and implementation define a 1:1 mapping.

**Why it matters:** The BC/component mapping is a core decomposition rule. If a generated domain component spans multiple BCs, ownership, dispatch, context loading, and reconciliation become ambiguous.

**Fix options:**

1. Tighten template guidance to "exactly one BC per domain CMP" and delete "components from the same BC" language.
   - Minimal and aligns templates with methodology.
2. Relax methodology to allow multiple components per BC or multiple BCs per component.
   - More flexible, but changes the architecture model and weakens dispatch ownership.
3. Keep 1:1 as default and add an explicit exception field for legacy/transition cases.
   - Useful for brownfield import, but adds schema complexity before a proven need.

**Recommended fix:** Option 1. The canon already chose 1:1; templates should enforce it.

**Verification:**

- No template text says domain CMPs derive from "at least one BC".
- No template implies multiple components can share one BC.
- Structural eval checklist explicitly enforces one domain CMP per BC and one BC per domain CMP.
- `python3 v03/extract-templates.py --check`.

**Downstream impact:** system-spec generation, structural eval, component dispatch, context loading.

---

### CANON-006: Extracted templates still use weak or ambiguous derivation-rule citations

**Severity:** Medium

**Location:**

- `v03/vibeloom-templates.md:1603` cites implementation §5.1 for per-prefix derivation rules and methodology §8.2 for the universal rule.
- `v03/vibeloom-templates.md:2085`, `2215`, and `2283` cite "implementation §5.1 derivation rules".
- `v03/vibeloom-templates.md:2352` says "per the §5.1 derivation rules" with no document named.
- `v03/vibeloom-templates.md:3021`, `3214`, `3296`, `3381`, `3602`, `3660`, and `3803` use bare "per §5.1" inside artifact templates.

**Issue:** Some citations only work when read inside `vibeloom-templates.md`. After extraction, bare `§5.1` has no target. Named citations also overstate implementation §5.1 as "derivation rules" when the conceptual rule is methodology §8.2 and implementation §5.1 is the prefix registry with row-level constraints.

**Why it matters:** Extracted tasks are the agent-executed surface. Ambiguous citations make agents guess where to look, or validate row-level prefix constraints while missing the universal derivation rule.

**Fix options:**

1. Standardize wording: "per methodology §8.2 plus implementation §5.1 row-level constraints."
   - Precise and small.
2. Define a named "Derivation Rules" anchor in `references/artifacts.md` and cite only that from tasks/artifacts.
   - Best for extracted context efficiency, but creates another condensation surface to maintain.
3. Remove section references from task templates and rely on loaded references.
   - Concise, but weaker if the reference is not loaded.

**Recommended fix:** Option 2. This citation appears in many extracted artifacts; a local reference anchor is cleaner than repeating cross-doc citations everywhere.

**Verification:**

- No extracted template contains a bare `§5.1`.
- Every derivation citation names both the conceptual rule owner and the row-level registry owner, or points to one local reference that does.
- `rg -n "§5\\.1 derivation|per §5\\.1|implementation §5\\.1 derivation" v03/vibeloom-templates.md v03/templates`.

**Downstream impact:** extracted tasks/artifacts, structural eval behavior, helper review prompts if they quote task wording.

---

### CANON-007: Template provenance examples disagree with actual template versions

**Severity:** Medium

**Location:**

- `v03/vibeloom-implementation.md:471` example generation trace uses `"task_template_version": "0.3.1"`.
- `v03/vibeloom-implementation.md:949` subagent header example uses `template_version: 0.3.1`.
- `v03/vibeloom-implementation.md:836` says each template carries a `task-template-version` trailer.
- `v03/vibeloom-templates.md:1570`, `1644`, `1749`, `1832`, `1919`, `2014`, `2112`, `2226`, `2310`, `2396`, `2477`, `2567`, `2654`, and `2761` show all current task templates at `0.3.0`.

**Issue:** Implementation examples imply current dispatch/provenance can use `0.3.1`, while the canonical template source declares `0.3.0` everywhere.

**Why it matters:** Template version is supposed to answer "which instructions produced this artifact?" If examples and trailers disagree, traces become misleading and future replay/migration tooling cannot trust provenance.

**Fix options:**

1. Change implementation examples to `0.3.0`.
   - Lowest churn if no template has actually been bumped.
2. Bump changed task templates to `0.3.1`.
   - Appropriate if accepted fixes change task behavior. Requires deciding which templates changed.
3. Replace concrete versions in examples with placeholders like `<task-template-version>`.
   - Avoids example drift, but loses realism in schema examples.

**Recommended fix:** Option 2 after we accept template behavior changes in this packet. If we defer all template edits, use Option 1.

**Verification:**

- Generation trace examples, subagent header examples, and task trailers agree.
- `rg -n "task_template_version|template_version: 0\\.3\\.1|task-template-version" v03/vibeloom-implementation.md v03/vibeloom-templates.md`.
- Template extraction still passes.

**Downstream impact:** generation traces, replay/debug tooling, skill bundle, release notes.

---

### CANON-008: v03 review/fix workflow conflicts with the repo-level frozen-version model

**Severity:** Medium

**Location:**

- `v03/review-canon.md:1-20` frames the prompt as reviewing v03 and then walking issues before applying edits.
- `v03/review-canon.md:133-140` says accepted fixes are applied and recorded in `canon-review-report.md`.
- `v03/review-canon.md:148-149` lists edits to canon files as an output after user approval.
- `file-layout.md:5-7` says `v01/`, `v02/`, and `v03/` are frozen legacy layout versions.
- `vibeloom-dev/SKILL.md:96-103` says v03 is read-only and new work should bootstrap v04.
- `vibeloom-dev/SKILL.md:137-138` repeats that frozen versions must not be modified by `vibeloom-dev`.

**Issue:** The old v03 review prompt says "review, then edit v03 after approval." The new repo-level maintainer model says v03 is frozen/read-only and v04+ is mutable.

**Why it matters:** This gates the interactive fix loop. Applying accepted fixes to v03 may violate the current repo policy; refusing to edit v03 may violate the prompt the user explicitly asked to execute.

**Fix options:**

1. Treat this as a legacy v03 audit only; apply accepted fixes to v04 after bootstrapping/migrating.
   - Aligns with the repo model. Requires v04 before edits land.
2. Make an explicit one-time exception and keep editing v03 in this session.
   - Fastest path. Weakens the frozen-version rule.
3. Update `v03/review-canon.md` to report-only for frozen versions, and move real fix flow into `vibeloom-dev review canon`.
   - Cleans future behavior. Does not by itself fix canon issues.

**Recommended fix:** Option 1. Use this packet to decide the fixes, then apply them to the next mutable version rather than rewriting frozen v03.

**Verification:**

- Before applying accepted canon edits, decide whether target is v03 or a new v04 layout.
- If v04: create/copy/migrate first, then apply fixes there.
- If v03: record an explicit exception in `canon-review-report.md`.

**Downstream impact:** interactive fix loop, branch/version workflow, `vibeloom-dev`, file layout docs.

---

## 3. Suggested Walk Order

1. CANON-008 -- decide whether fixes target frozen v03 or new v04. This gates all edits.
2. CANON-001 -- `vibe` operation leakage. Highest execution risk.
3. CANON-002 -- import ID allocation. Highest schema/provenance risk.
4. CANON-003 -- noncanonical `ux_evidence` field.
5. CANON-004 -- root namespace vs graph root.
6. CANON-005 -- BC/component 1:1 cardinality.
7. CANON-006 -- derivation citations.
8. CANON-007 -- template version provenance.

After accepted fixes, rerun:

```bash
python3 v03/extract-templates.py --check
python3 v03/site/scripts/check_consistency.py
rg -n "code-sync|contract-graph|status.json|no IDs allocated|ux_evidence|Graph root|at least one BC|per §5\\.1|task_template_version|task-template-version" v03
```
