# VibeLoom v03 Canon Review Packet

**Generated:** 2026-05-15 by re-executing `v03/review-canon.md` against the edited worktree.

**Scope:** `v03/codæ-manifesto.html`, `v03/vibeloom-methodology.md`, `v03/vibeloom-implementation.md`, `v03/vibeloom-templates.md`.

**Posture:** adversarial. This packet does not apply canon edits. It is the current issue packet to walk interactively.

**Mechanical checks run:**

- `python3 v03/extract-templates.py --check` -> `OK: 41 templates match disk`.
- `python3 v03/site/scripts/check_consistency.py` -> `Consistency check OK`, with an existing Python `SyntaxWarning` for an invalid backtick escape in the checker docstring.

**Pre-state:** worktree is dirty. `git status --short` includes modified/deleted root review artifacts, modified v03 canon/site/helper files, untracked v03 adversarial reports/backups, and modified `vibeloom-dev` files. No canon files were edited while creating this packet.

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
| Prompt/task/reference/artifact wording agents actually execute | Templates | Extracted `v03/templates/**`, skill bundle |

### 1.3 Drift-pressure surfaces

| Surface | Drift pressure |
|---|---|
| `vibe` mode | Methodology says minimal/no graph/no code-sync; templates still have several full-mode paths. |
| Import | Evidence now lives correctly in `imports.jsonl.per_candidate`, but ID allocation timing is contradictory. |
| ID registry/root terminology | Implementation distinguishes allocation namespace vs graph root; skill reference collapses it. |
| BC/component topology | Methodology/implementation say 1:1 in the domain layer; some templates still permit multi-BC components. |
| Template provenance | Implementation examples use `0.3.1`; actual task trailers are all `0.3.0`. |
| Section citations | Some extracted task text uses bare or misleading section references after extraction. |

---

## 2. Findings

### CANON-001: `vibe` mode still leaks full-mode graph, component, and code-sync machinery

**Severity:** High

**Location:**

- `v03/vibeloom-methodology.md:106` says `vibe` has "minimal -- no graph, no code-sync, no per-item status".
- `v03/vibeloom-methodology.md:116-118` says `vibe` has no IDed graph and no code-sync trace.
- `v03/vibeloom-implementation.md:90` says `vibe` has no graph cache, no code-sync trace, and no status cache.
- `v03/vibeloom-templates.md:282` routes `generate code` to `tasks/generate-code-component.md`, "one subagent per affected component".
- `v03/vibeloom-templates.md:1651-1653` defines `generate-code-component` as a per-component dispatch-plan task.
- `v03/vibeloom-templates.md:1674-1680` requires a full component lineage and approved component-level `system-specs`.
- `v03/vibeloom-templates.md:1716` requires writing a `code-sync` trace.
- `v03/vibeloom-templates.md:1765-1799` says `generate-context` generates per-container/per-component context, loads graph, emits BDD, and updates the Contract Graph.
- `v03/vibeloom-templates.md:1527-1535` says `approve` refreshes the Contract Graph cache.
- `v03/vibeloom-templates.md:1596-1603` says `eval` requires/builds `.vibeloom/cache/contract-graph.json`.

**Issue:** The new `status` path is mode-aware, but adjacent operation templates are not. A `vibe` repo can still be routed into full-mode component dispatch, graph cache refreshes, code-sync traces, BDD generation, and component approval/eval preconditions.

**Why it matters:** `vibe` is the low-ceremony entry point. If its most common forward path (`approve intent-specs` -> `generate code`) depends on component specs, graph cache, or code-sync traces, the documented mode cannot execute. Worse, agents may silently materialize the heavyweight substrate the methodology explicitly excludes.

**Fix options:**

1. Add explicit `vibe` branches to `approve`, `eval`, `generate-context`, and `generate-code`.
   - Keeps one command surface while making each task mode-aware. Highest local edit count, but clearest for agents.
2. Add dedicated compact tasks: `generate-vibe-system.md`, `generate-vibe-context.md`, `generate-vibe-code.md`, and route `vibe` there.
   - Clean separation and less conditional prose inside full-mode tasks. Larger template inventory and routing changes.
3. Restrict `vibe` to `init`, `review intent-specs`, `approve intent-specs`, `status`, and `upgrade`; require upgrade before code generation.
   - Simplest implementation, but contradicts the product promise that `vibe` can take a small project from intent to code.

**Recommended fix:** Option 2. `vibe` is not a stripped full mode; separate compact tasks will keep the mental model clean and avoid contaminating full-mode templates with too many conditional paths.

**Verification:**

- `SKILL.md` command routing has distinct `vibe` routes for code/context/system generation or an explicit refusal policy.
- No `vibe` path writes `.vibeloom/cache/contract-graph.json`, `.vibeloom/cache/status.json`, or `.vibeloom/traces/code-sync.jsonl`.
- `tasks/approve.md`, `tasks/eval.md`, `tasks/generate-context.md`, and code-generation routing state full-mode vs `vibe` behavior explicitly.
- `python3 v03/extract-templates.py --check`.

**Downstream impact:** skill routing, engine command behavior, extracted templates, getting-started docs, site if `vibe` is marketed as intent-to-code.

---

### CANON-002: Import ID allocation is contradictory

**Severity:** High

**Location:**

- `v03/vibeloom-implementation.md:614` says `per_candidate` is keyed by the same item IDs that appear in produced draft artifacts.
- `v03/vibeloom-implementation.md:1267` says the import trace is keyed by IDs the orchestrator allocated to each draft.
- `v03/vibeloom-templates.md:2351-2353` says evidence is collected for each candidate item ID and trace `per_candidate` is keyed by item ID.
- `v03/vibeloom-templates.md:2360` says the import trace has a `per_candidate` map keyed by allocated item IDs.
- `v03/vibeloom-templates.md:2368` says "no IDs allocated yet to imported candidates (engine assigns final IDs at approval time)."

**Issue:** The import task simultaneously requires allocated item IDs for draft artifacts and trace evidence, then says no IDs are allocated until approval.

**Why it matters:** Review packets need stable candidate IDs before approval. If IDs appear only at approval time, the import trace cannot be keyed by item ID and reviewers cannot comment on or accept/reject individual candidates safely. If IDs are allocated at import time, the registry must advance before approval and the canon must say so.

**Fix options:**

1. Allocate draft IDs during import and persist them immediately.
   - Aligns with current implementation text and enables stable review/evidence joins. Retired/rejected IDs remain spent.
2. Use temporary candidate IDs during import, then remap to final IDs at approval.
   - Preserves semantic ID space, but requires a remap trace and complicates every review packet.
3. Make import evidence keyed by content fingerprints instead of item IDs until approval.
   - Avoids ID spending, but makes human review and patch application brittle.

**Recommended fix:** Option 1. Stable IDs are the whole point of a reviewable contract. Spending IDs for rejected draft candidates is cheaper than introducing candidate/final remapping.

**Verification:**

- `tasks/import.md` no longer says IDs are unallocated until approval.
- Implementation §15.8 explicitly allocates draft IDs before writing draft artifacts and before writing `imports.jsonl.per_candidate`.
- Registry semantics say rejected draft IDs are retired or remain spent.
- `rg -n "no IDs allocated|approval time|allocated item IDs|per_candidate" v03/vibeloom-implementation.md v03/vibeloom-templates.md`.

**Downstream impact:** import engine, review packet rendering, ID registry behavior, extracted import task.

---

### CANON-003: The skill reference loses the `root` namespace vs graph-root distinction

**Severity:** Medium

**Location:**

- `v03/vibeloom-implementation.md:176-181` explicitly separates allocation namespace (`root`) from graph root, and says only `CAP` and `CST` are graph roots.
- `v03/vibeloom-implementation.md:183-227` has separate `Namespace` and `Graph root?` columns.
- `v03/vibeloom-templates.md:624-628` says the prefix registry is reproduced for runtime load-on-demand.
- `v03/vibeloom-templates.md:628-673` collapses the reproduced table to one `Scope` column and omits `Graph root?`.

**Issue:** The implementation fixed a known ambiguity, but the extracted agent-facing reference drops the column that makes the fix durable.

**Why it matters:** Agents are instructed to load `references/artifacts.md` on demand; they may never load the full implementation table. In that context, a row like `FR | ... | root` can again look like a root graph entity instead of a repo-wide allocation namespace. That reopens the exact class of derivation bugs the implementation text tried to close.

**Fix options:**

1. Mirror the implementation table shape in `references/artifacts.md`: `Namespace` plus `Graph root?`.
   - Best fidelity. Slightly wider table, but this is a schema reference where precision beats compactness.
2. Keep the compact table but add a prominent note before it defining `Scope=root` and listing graph roots.
   - Lower churn, but weaker because the distinction is not carried per row.
3. Remove the reproduced prefix registry from the skill reference and force agents to load implementation §5.1.
   - Avoids duplication drift, but hurts context efficiency and violates the load-on-demand purpose.

**Recommended fix:** Option 1. This is a runtime reference, not marketing copy; the table should preserve the discriminating columns.

**Verification:**

- Extracted `skill/references/artifacts.md` has separate `Namespace` and `Graph root?` columns or an equivalent per-row representation.
- `CAP` and `CST` are the only rows marked graph root.
- `rg -n "Graph root|Namespace|Scope" v03/vibeloom-templates.md v03/templates/skill/references/artifacts.md`.

**Downstream impact:** skill reference, structural eval guidance, graph construction, generated artifact derivation.

---

### CANON-004: Domain bounded-context cardinality is still loosened in templates

**Severity:** Medium

**Location:**

- `v03/vibeloom-methodology.md:192-195` says each domain-layer component hosts exactly one bounded context and each bounded context belongs to exactly one component.
- `v03/vibeloom-implementation.md:327-331` repeats the exact 1:1 domain-layer mapping.
- `v03/vibeloom-templates.md:3388-3395` repeats the exact-one rule in `component.md`.
- `v03/vibeloom-templates.md:3496` says every domain CMP references "at least one BC".
- `v03/vibeloom-templates.md:3497` says "Components from the same BC must be co-located in this container."
- `v03/vibeloom-templates.md:3553` repeats "at least one BC" for domain CMPs.

**Issue:** The template guidance permits multiple bounded contexts per domain component, while methodology and implementation define a 1:1 mapping.

**Why it matters:** The BC/component mapping is a core decomposition rule. If the generator creates a domain component with multiple BCs, ownership, dispatch, context loading, and reconciliation all become ambiguous: is the component a generation boundary, a domain boundary, or both?

**Fix options:**

1. Tighten container guidance to "exactly one BC per domain CMP" and delete "components from the same BC" language.
   - Minimal and aligns templates with methodology.
2. Relax methodology to allow multiple components per BC or multiple BCs per component.
   - More flexible, but it changes the architecture model and weakens dispatch ownership.
3. Keep 1:1 as default and introduce an explicit exception field for legacy/transition cases.
   - Useful for brownfield import, but adds schema complexity before a proven need.

**Recommended fix:** Option 1. The canon already made the architectural choice. Templates should enforce it instead of reopening it.

**Verification:**

- No template text says domain CMPs derive from "at least one BC".
- No template implies multiple components can share one BC.
- Structural eval checklist explicitly enforces one domain CMP per BC and one BC per domain CMP.
- `python3 v03/extract-templates.py --check`.

**Downstream impact:** system-spec generation, structural eval, component dispatch, context loading.

---

### CANON-005: Several extracted tasks still use weak or ambiguous derivation-rule citations

**Severity:** Medium

**Location:**

- `v03/vibeloom-templates.md:1603` cites implementation §5.1 for per-prefix derivation rules and methodology §8.2 for the universal rule.
- `v03/vibeloom-templates.md:2085`, `2215`, and `2283` cite "implementation §5.1 derivation rules".
- `v03/vibeloom-templates.md:2352` says "per the §5.1 derivation rules" with no document named.
- `v03/vibeloom-templates.md:3381` says "Derivation rules (per §5.1)" inside an extracted artifact template.

**Issue:** Some citations are technically survivable only when read inside `vibeloom-templates.md`. After extraction, bare `§5.1` has no target. Even the named citations overstate implementation §5.1 as "derivation rules" when the conceptual derivation rule is methodology §8.2 and implementation §5.1 is the prefix registry with row-level constraints.

**Why it matters:** Extracted tasks are the agent-executed surface. Ambiguous citations make agents guess where to look, or worse, validate only row-level prefix constraints and miss the universal derivation rule.

**Fix options:**

1. Standardize wording: "per methodology §8.2 plus implementation §5.1 row-level constraints."
   - Precise and small.
2. Define a named "Derivation Rules" anchor in the skill reference and cite only that from tasks.
   - Best for extracted context efficiency, but creates another condensation surface to maintain.
3. Remove section references from task templates and rely on `references/artifacts.md`.
   - Concise, but weaker if the reference is not loaded.

**Recommended fix:** Option 1 now, Option 2 if the same citation pattern keeps recurring. The current problem is concrete and local.

**Verification:**

- No extracted template contains a bare `§5.1`.
- Every derivation citation names both the conceptual rule owner and the row-level registry owner, or points to one local reference that does.
- `rg -n "§5\\.1 derivation|per §5\\.1|implementation §5\\.1 derivation" v03/vibeloom-templates.md v03/templates`.

**Downstream impact:** extracted tasks, structural eval behavior, helper review prompts if they quote task wording.

---

### CANON-006: Template provenance examples disagree with actual template versions

**Severity:** Medium

**Location:**

- `v03/vibeloom-implementation.md:471` example generation trace uses `"task_template_version": "0.3.1"`.
- `v03/vibeloom-implementation.md:949` subagent header example uses `template_version: 0.3.1`.
- `v03/vibeloom-implementation.md:836` says each template carries a `task-template-version` trailer.
- `v03/vibeloom-templates.md:1570`, `1644`, `1749`, `1832`, `1919`, `2014`, `2112`, `2226`, `2310`, `2396`, `2477`, `2567`, `2654`, and `2761` show all current task templates at `0.3.0`.

**Issue:** The implementation examples imply current dispatch/provenance can use `0.3.1`, while the canonical template source still declares `0.3.0` everywhere.

**Why it matters:** Template version is supposed to answer "which instructions produced this artifact?" If examples and actual trailers disagree, traces become misleading and future migration tooling cannot trust provenance.

**Fix options:**

1. Change implementation examples to `0.3.0`.
   - Lowest churn if no template has actually been bumped.
2. Bump the changed task templates to `0.3.1`.
   - Appropriate if these edits are considered a template behavior change. Requires deciding which templates changed.
3. Replace concrete versions in examples with placeholders like `<task-template-version>`.
   - Avoids example drift, but loses realism in schema examples.

**Recommended fix:** Option 2 if the recent edits materially changed behavior; otherwise Option 1. My default recommendation is Option 2 for any accepted changes to task behavior in this packet, because the template semantics are changing.

**Verification:**

- Generation trace examples, subagent header examples, and task trailers agree.
- `rg -n "task_template_version|template_version: 0\\.3\\.1|task-template-version" v03/vibeloom-implementation.md v03/vibeloom-templates.md`.
- Template extraction still passes.

**Downstream impact:** generation traces, replay/debug tooling, skill bundle, release notes.

---

### CANON-007: v03 review/fix workflow now conflicts with the repo-level frozen-version model

**Severity:** Medium

**Location:**

- `v03/review-canon.md:1-8` still frames the prompt as reviewing v03 and then walking issues before editing.
- `v03/review-canon.md:20` says the agent should walk every issue before applying edits.
- `v03/review-canon.md:133-140` says accepted fixes are applied and recorded in `canon-review-report.md`.
- `v03/review-canon.md:148-149` lists edits to canon files as an output after user approval.
- `file-layout.md:5-7` says `v01/`, `v02/`, and `v03/` are frozen legacy layout versions.
- `vibeloom-dev/SKILL.md:96-103` says v03 is read-only and new work should bootstrap v04.

**Issue:** The old v03 review prompt says "review, then edit v03 after approval." The new repo-level maintainer model says v03 is frozen/read-only and v04+ is mutable.

**Why it matters:** The next step after this packet is interactive fixing. Without resolving the authority conflict, applying accepted fixes to v03 could violate the current repo layout policy; refusing to edit v03 could violate the prompt the user explicitly asked to execute.

**Fix options:**

1. Treat this packet as a legacy v03 audit only; apply accepted fixes to v04 after bootstrapping/migrating.
   - Aligns with the repo model. Requires a v04 branch/version workflow before edits.
2. Temporarily allow v03 edits for this session and then freeze it again.
   - Fastest, but undermines the frozen-version rule and creates unclear production history.
3. Move this prompt under `vibeloom-dev` as a legacy evaluator and update it to emit reports only for frozen versions.
   - Cleans up future behavior, but does not itself fix canon issues.

**Recommended fix:** Option 1. Use this packet to decide the fixes, but apply them to the next mutable version rather than rewriting frozen v03.

**Verification:**

- Before applying any accepted canon edits, decide whether target is v03 or a new v04 layout.
- If v04: create/copy/migrate first, then apply fixes there.
- If v03: record an explicit exception in `canon-review-report.md`.

**Downstream impact:** interactive fix loop, branch/version workflow, `vibeloom-dev`, file layout docs.

---

## 3. Suggested Walk Order

1. CANON-007 -- decide whether fixes target frozen v03 or new v04. This gates all edits.
2. CANON-001 -- `vibe` operation leakage. Highest execution risk.
3. CANON-002 -- import ID allocation. Highest schema/provenance risk.
4. CANON-003 -- root namespace vs graph root. Prevents derivation drift.
5. CANON-004 -- BC/component 1:1 cardinality. Prevents decomposition drift.
6. CANON-005 -- derivation citations. Small but agent-facing.
7. CANON-006 -- template version provenance. Should be handled with the accepted template edits.

After accepted fixes, rerun:

```bash
python3 v03/extract-templates.py --check
python3 v03/site/scripts/check_consistency.py
rg -n "code-sync|contract-graph|status.json|no IDs allocated|Graph root|at least one BC|per §5\\.1|task_template_version|task-template-version" v03
```
