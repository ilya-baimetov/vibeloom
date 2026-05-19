# VibeLoom ideas

**Status:** brainstorm of features and capabilities for v04+. Each entry is a candidate, not a commitment. The consistent format lets entries be picked up, refined, and promoted into a real specification when the time comes.

Entry sections:

1. **Name** — the short label for the feature.
2. **What it does** — concrete description, one to three paragraphs.
3. **Justification (pain or gain)** — the problem this solves or the gain it unlocks. If the answer is fuzzy, the feature is not ready.
4. **With vs without** — a short worked example or pair of scenarios contrasting today (without) and tomorrow (with).

Entries are grouped by theme, not by priority.

---

## A. Toolchain capabilities (compiler-analogy debt)

The compiler analogy creates an obligation: real compilers come with debuggers, dry-run modes, REPLs, inspectors. codæ should grow the equivalent toolchain over time.

### A1. `generate --dry-run`

**What it does.** Runs the dispatch planner for a `generate` command but does not write. Returns the dispatch plan (which subagents would be spawned, with which load sets, in which waves), the affected/uncovered set, the predicted token cost, and a sample of would-generate output for the smallest task in the plan. Optional `--full` flag emits all would-generate output without committing it to the working tree.

**Justification.** Today, `generate` is a commit-and-pray operation for high-stakes changes (e.g. regenerating system-specs after an intent change). Users have no way to preview cost or dispatch shape before paying for it. This is standard in compilers (`cc -E`, `cc -S`) and shells (`make -n`, `terraform plan`). Without dry-run, large generations are scary; with it, they become routine.

**With vs without.**

- *Without.* User edits `intent.md`, runs `vibeloom generate`. Twenty minutes and $4 of API spend later, the system-specs and code have been regenerated. The user notices that one intent change cascaded into a component rename they did not want. Now they have to either reconcile back or revert the run.
- *With.* User edits `intent.md`, runs `vibeloom generate --dry-run`. Output: "Dispatch plan: 7 subagent tasks across 2 waves; affected scope: 3 components; estimated cost: $4.10; predicted runtime: 18 min. Sample output: …" User sees the unintended component rename in the plan, edits the intent more carefully, dry-runs again. Cost: 30 seconds and a couple of cents.

---

### A2. Contract REPL / scratchpad

**What it does.** An interactive mode where the user drafts a contract change in a sandboxed copy of the contract graph and the engine continuously shows: which downstream items would become stale, which uncovered obligations would appear, which existing items become dangling, what the affected scope of the change would be at each tier. The user can iterate on the draft without committing anything to the real contract until they explicitly leave the REPL with `commit`.

**Justification.** Shaping intent is iterative. Today, the only way to see the impact of an intent edit is to run `generate --dry-run` (which doesn't exist yet), or to run `generate` and see what happened, or to mentally simulate the affected set. None of these are fast enough for the design-loop tempo a designer/PM/architect actually needs.

**With vs without.**

- *Without.* PM is shaping a new requirement. They edit `prd.md`, run `vibeloom status`, see what became stale, edit some more, run `status` again. The loop is too slow; they end up making big batched edits and accepting whatever cascades.
- *With.* PM types `vibeloom repl product-specs`. They draft a new `FR-0042` and immediately see that it would create three uncovered downstream obligations (stories, acceptance criteria, view), affect one bounded context, and conflict with an existing constraint `CST-0007`. They iterate in seconds, not minutes.

---

### A3. Contract debugger

**What it does.** Given a code-level symptom (a failing test, a runtime error trace, a user complaint with a stack pointer), the debugger walks back through code-sync traces to the contract item(s) the code claims to realize, then up the Contract Graph to the contract basis. It surfaces: when each item in the chain was last approved, what eval findings have been recorded against it, what reconciliation history it has, what other code-sync traces realize the same items. The user can pivot from "what broke" to "where in the contract does it really live" in one or two steps.

**Justification.** When generated code misbehaves, the natural instinct is to fix the code. But codæ's premise is that code is downstream — the contract is source of truth. Without a debugger that surfaces the contract chain, users revert to inspecting code, which defeats the model. The debugger makes "fix it upstream" cheap enough to be the default.

**With vs without.**

- *Without.* A test fails on `web/tests/search.test.ts`. The dev opens the test, opens the implementation, traces the bug to a wrong default in a search ranking function, fixes the code. Six weeks later, the same wrong default reappears because the underlying contract item still says the wrong thing and the next regeneration reverted the patch.
- *With.* The dev runs `vibeloom debug web/tests/search.test.ts`. The debugger reports: this test realizes `BDD-0022`, which derives from `BEH-0031` on `CMP-0012`, last regenerated at SYNC-0031 from `IF-0042`. The eval log shows `IF-0042` was approved 8 weeks ago and its definition of "default ranking" is what produces this behavior. The dev fixes `IF-0042`, regenerates, and the bug never comes back.

---

### A4. Cognitive-surface instrumentation

**What it does.** The engine instruments and reports cognitive-surface metrics for every review and reconciliation cycle: contract-item count in the affected scope, code-item count (files + classes/types + methods/functions + endpoints/handlers + tests + integration points) in the affected implementation, and the resulting compression ratio (code items / contract items). Plus secondary metrics collected per session: review time per packet, defect-detection rate at review vs after merge, downstream-rework frequency per approval. Metrics surface in `vibeloom status` and review packets so users can see the cognitive load they're avoiding — and the trend.

**Justification.** The codæ premise — humans mend a small contract while agents extend large implementations — is currently asserted (manifesto §5 visual: 108K-LOC vs 24% contract). Without instrumented metrics, the claim cannot be verified per project, regression cannot be detected, and compression ratio cannot be reported per release. With instrumentation, compression becomes a measurable property of every VibeLoom-governed system; the case becomes evidence; projects flag when their compression ratio degrades (a leading indicator of contract bloat or generated-code creep).

**With vs without.**

- *Without.* PM completes a generation cycle. They have no idea whether they reviewed 12 contract items to govern 4,000 code lines (good) or 200 contract items to govern 800 code lines (bad — contract bloat). The codæ promise stays anecdotal.
- *With.* `vibeloom status` reports "Last cycle: reviewed 14 contract items affecting 3,120 code items (compression ratio 1:223). Trend over last 5 cycles: 1:198, 1:215, 1:208, 1:215, 1:223 — stable." When the ratio drops, the engine surfaces a finding: "Compression ratio trending down — investigate contract bloat or low-leverage edits."

---

## B. Cross-project capabilities

### B1. Contract pattern library

**What it does.** A registry of common contract patterns — for example, "standard SaaS skeleton" with auth/billing/notifications/admin components, "CRUD with search" with the standard ENT/IF/BDD scaffolding, "event-driven pipeline" with producer/topic/consumer wiring. New projects can fork from a pattern; the patterns are versioned; the registry is central or organization-private. Patterns are themselves codæ artifacts and ship with traces, examples, and known-good validation runners.

**Author note.** Ilya has an alternative "templates → implementation" idea that may differ in shape. This entry is a placeholder for that conversation. The shape below is one possible direction; the right one is to be decided.

**Justification.** Most new projects are ~80% boilerplate at the contract level. Auth is auth. Billing is billing. Searching tagged items is searching tagged items. Today, every project re-derives the boilerplate, and the boilerplate quality is whatever the lead can articulate from memory. A pattern library makes the boilerplate a curated, evolving asset — and creates the natural commercial moat for vibeloom.ai (paid premium patterns, organization-private patterns, certified patterns).

**With vs without.**

- *Without.* Founder starts a new SaaS, writes an intent doc that mentions auth/billing/notifications. The agent generates a passable contract for these, but the auth model misses MFA recovery flows because the founder didn't specifically ask. Eight weeks later, the gap shows up in a security review.
- *With.* Founder runs `vibeloom init --pattern saas-standard`. The contract includes auth-with-MFA-recovery, billing-with-dunning, notifications-with-throttling — all curated from previous projects. The founder edits intent to remove parts they don't want; the rest is already correct.

---

## C. New artifacts and graph extensions

### C0. Contract graph → context graph promotion (CGKG-B)

**What it does.** v0.3 keeps the contract graph as a **knowledge graph**: instantiated ontology only (entities + `derives_from` relations). Provenance lives in traces. CGKG-B promotes the contract graph to a full **context graph** by materializing trace-implied relationships as graph nodes/edges:

1. Load-bearing decision traces become `DEC-####` graph nodes with `affects` edges to the contract items they constrain
2. Code-sync traces become `realized_by` edges from contract items to code paths
3. Operations declare a *view* — `KG view` (instantiated ontology only; default for code generation, dispatch, status, structural eval) or `CG view` (full graph with provenance; default for reconciliation, review packets, audit, brownfield import). Subagent load sets respect the chosen view to control runtime context cost.

**Justification.** The KG view answers "what" queries efficiently. The CG view answers "why" queries — "why is this BC the way it is", "what decisions need revisiting if we change this requirement", "show me all code that realizes this BC". v0.3 trace schemas are designed (per methodology principle 9) to be sufficient for this promotion without information loss; CGKG-B is the harvest.

**With vs without.**

- *Without.* Reviewer asks "why is this domain model the way it is?" Six months later, the answer requires walking trace files, cross-referencing decision history with generation events, and hoping the load_bearing flag was set correctly. Slow, manual.
- *With.* From `BC-0008`, the reviewer queries reverse `affects` edges and gets `DEC-20260512-0007` "we chose strict consistency over eventual because of FR-0019". Reconciliation packets surface the decision automatically. Code-sync `realized_by` edges show every file implementing the BC. Graph-traversable explainability.

---

### C0a. Cross-layer interaction graph + stack-aware codegen

**What it does.** v0.3 introduces the per-container `layer` field (presentation / application / domain / infrastructure) and per-layer Tech Stack choices in `defaults`. v0.4+ extends this with two follow-ons:
1. A **cross-layer interaction graph**: explicit declarations of how presentation containers call application containers, how application containers call domain containers, and which infrastructure services each consumes. Surfaced as a new code-sync trace flavor: "presentation `X` calls application `Y` via interface `Z`."
2. **Stack-aware codegen**: per-framework task templates (`generate-react-component`, `generate-fastapi-handler`, `generate-postgres-aggregate-root`, etc.) selected by reading the inherited Tech Stack choices from `defaults`. Today, the agent infers the framework from prose; tomorrow, the template directly reflects the chosen stack.

**Justification.** v0.3 makes the *what* (stack + layer) explicit and queryable. v0.4 makes the *interactions between layers* and the *per-framework idioms* explicit too — closing the loop from contract to code without losing the layered architecture.

**With vs without.**

- *Without.* Agent generates a presentation component that calls a domain microservice directly, bypassing the application layer. No structural eval flags it because there's no graph constraint between layers.
- *With.* The cross-layer interaction graph declares "presentation may only call application; application may only call domain or infrastructure." Structural eval flags presentation→domain calls as violations. Stack-aware codegen produces React + React Query patterns when those are the chosen stack, FastAPI + Pydantic when those are.

---

### C1. ContractDelta as first-class artifact

**What it does.** When approved contract A becomes approved contract B, the diff between them is materialized as a `DELTA-####` artifact: a graph-resident record of which items were added, modified, removed, or moved; with hashes, semantic-eval summaries, and downstream impact. ContractDeltas can be reviewed in isolation, used as the unit for release notes, attached to git tags, fed to compliance audits, and rolled back.

**Justification.** Today, a generation run knows what changed (it computed the affected set), but the change is implicit, scattered across approval traces and generation traces. There is no single artifact that says "between v0.7.0 and v0.7.1 of this contract, this is what changed." That artifact is exactly what change reviews and rollbacks need.

**With vs without.**

- *Without.* Release manager wants to write release notes for v0.7.1. They diff approval traces, cross-reference with generation traces, manually summarize. Easy to miss something. Rolling back requires identifying every artifact touched in the wrong run and restoring its previous version.
- *With.* `vibeloom delta v0.7.0..v0.7.1` returns `DELTA-0042`, which lists changes by tier with semantic summaries. The delta is the release-notes draft and the rollback target.

---

### C2. DDD context maps

**What it does.** Real DDD has relationships between bounded contexts: Customer-Supplier, Conformist, Anti-Corruption Layer, Open Host Service, Shared Kernel, Separate Ways. v03 has bounded contexts as labels but no first-class concept of how they relate. Context maps would add `CMAP-####` artifacts that name the relationship between two BCs, the direction of dependency, the translation strategy at the boundary, and the artifact (interface, ACL component, shared kernel module) that realizes it.

**Justification.** Without context maps, bounded contexts are decorative. With them, BCs become a working DDD model where the agent can answer "what happens at this boundary" and the human can spot "we have an upstream-downstream loop here that needs an ACL." Serious DDD reviewers will dismiss the BC story as half-built without context maps.

**With vs without.**

- *Without.* `BC-0003` (Notes Catalog) and `BC-0008` (Search Index) are both hosted on `CMP-0012`. The agent is asked to add a tag-renaming feature; it modifies both BCs in one component without recognizing that one is upstream of the other. A subtle bug appears at the boundary.
- *With.* `CMAP-0001` records that `BC-0008` is a Customer of `BC-0003` (the search index consumes the notes catalog). The agent treats BC-0003 as authoritative and generates an explicit translation interface for BC-0008. The bug doesn't appear because the boundary is now a contract.

---

### C3. Compliance mode

**What it does.** A new mode (`compliance`) on top of `expert` that adds: mandatory evidence per item (every contract item must reference a regulation, policy, or threat-model item), mandatory approver identity capture (no anonymous approvals), mandatory dual-approval for breaking changes, periodic re-attestation of approvals, and an `audit-bundle` export command that produces a tarball of all traces, approvals, evidence, code-sync results, and validation runs over a date range, signed and timestamped.

**Justification.** Healthcare, finance, government, and increasingly AI-product organizations require auditable engineering practice. Today, vibeloom's traces are durable but the evidence-mapping and audit-bundle features that make audits cheap don't exist. Without them, regulated orgs can adopt vibeloom but pay a per-audit tax to assemble evidence. With them, audits become an export.

**With vs without.**

- *Without.* SOC 2 audit, year 2. The auditor asks "show me the approval chain for this feature including who approved and what evidence supported it." Engineering team spends three weeks assembling a dossier.
- *With.* Engineering runs `vibeloom audit-bundle --since 2026-01-01 --signed`. The bundle is the dossier.

---

## D. Trace-derived learning

The original methodology had a "Learning from traces" section as a wish list. v03 moved it here so it can be specified properly when the time comes.

### D1. Late-fetch → context proposal

**What it does.** Every late-fetch event (a subagent requesting a slice of context not in its initial load set) is a signal that the active context for that scope is missing something. The engine accumulates these signals, and when the same scope/topic is late-fetched N times across distinct generation runs, vibeloom proposes adding the relevant items to active context (or flagging a relevant decision trace as load-bearing so it surfaces in future packets). The proposal is shown to the user as a packet; nothing changes silently.

**Justification.** Late-fetch is currently invisible signal. It tells you exactly where your active context is too thin. Capturing it turns operational friction into a contract-improvement loop.

**With vs without.**

- *Without.* Subagents repeatedly late-fetch the timezone-handling component every time they generate code that touches dates. The user never notices; the late-fetches are buried in run logs.
- *With.* After 5 late-fetches, vibeloom raises a packet: "Late-fetch frequency for `CMP-0019` (timezones) is high during `BC-0002` work. Propose adding interface summary to active context." User accepts; future runs don't need the fetch.

---

### D2. Repeated reconcile choice → load-bearing decision proposal

**What it does.** When the user makes the same reconciliation direction choice (e.g., "preserve downstream behavior, amend contract") for the same kind of conflict more than N times, vibeloom proposes promoting the choice to a `load_bearing: true` decision trace so future reconciliation flows can pre-suggest the same direction. Sufficiently normative choices may be promoted further to IDed contract items.

**Justification.** Reconciliation is friction. Repeated friction is signal. Capturing the pattern reduces future friction and surfaces decisions that are de facto policy.

**With vs without.**

- *Without.* User reconciles the same kind of UX-vs-product mismatch 6 times in three weeks, picking "amend product to match UX" each time. Future runs still surface the same packet, the user still has to click through.
- *With.* After 4 such reconciliations, vibeloom proposes flagging `DEC-20260512-0007` as load-bearing: "When UX evidence and product spec disagree on visual hierarchy, default to UX evidence and amend product." User reviews and approves. Future packets pre-recommend the choice; the trace becomes a queried view in active decision context.

---

### D3. Repeated validation failure → task-template change

**What it does.** When the same validation runner repeatedly fails on the same kind of generated artifact, the engine proposes changes to the relevant task template. For example, if the generated code-component task repeatedly produces TypeScript that fails the strict-null check, the engine proposes adding "always handle null at boundary" to the task template's constraints.

**Justification.** Today, the user keeps fixing the same generation mistake by hand. The mistake is a template bug, but nothing closes the loop. With this, the template gets stronger over time without manual maintenance.

**With vs without.**

- *Without.* Every generated route handler forgets to log structured-error context. User reviews, asks for the fix, eventually edits the task template manually after the third time.
- *With.* Engine proposes the template addition after the second occurrence. User accepts; no third occurrence.

---

### D4. Repeated uncovered UX → product/UX synthesis improvement

**What it does.** When the same kinds of UX items repeatedly appear as `uncovered` after product-spec generation, the engine proposes adding extraction rules or example-pairs to the product+UX co-synthesis task templates so future runs catch them earlier.

**Justification.** Same shape as D3 but for the upstream UX loop.

**With vs without.**

- *Without.* Empty-state copy is uncovered after every PRD update for three months. User adds it manually each time.
- *With.* After two cycles, engine proposes amending the product-specs task template to always extract empty-state copy. Approved; problem solved.

---

## E. Other ideas (early thinking, not fully articulated)

### E1. Cost / time / token budget per operation

Show estimated cost (tokens, dollars, wall-time) for each generate/eval/review/reconcile before committing. Should pair naturally with `--dry-run`.

### E2. Migration scripts as artifacts

`vibe → pm` and other mode upgrades should produce an explicit migration trace artifact. Today the upgrade is described conceptually but not materialized as a graph node or trace.

### E3. Validation-runner library

A shared library of common validation runners (TypeScript strict, Python mypy, Rust clippy, OWASP top-10 for web, SOC 2 for storage). Pairs with the validation-registry pattern in the v03 implementation.

### E4. codæ for non-code artifacts

The same paradigm could govern non-code artifacts: API specs (OpenAPI), infrastructure (Terraform), documentation (technical writing). Most of the methodology generalizes; the templates and validation runners change.

### E5. Cross-organization contract sharing

If an organization has many vibeloom projects, the same domain model often appears across them. A shared-organization contract layer could let multiple projects reference the same approved domain truth (e.g. "the canonical Customer entity for this org").

---

### E6. Factor the reusable review-loop pattern out of consumers

The interactive review loop (build packet → present summary → confirm scope → walk in priority → Accept / Edit / Defer / Reject → re-verify → loop → recommend next) appears in four places: `tasks/review.md` and the three `review-{canon,site,skill}.md` prompts. Each copy uses slightly different vocabulary (contract-artifact "trace" / "eval" vs doc "report" / "checklist"), so editing the loop means editing all four files consistently. Factoring into a single vocabulary-neutral `review-loop.md` with consumers referencing it would establish a single source of truth and remove drift risk; each consumer would shrink by 10–15 lines and gain a clearer specialization-vs-pattern boundary. Trade-off: prompts lose some standalone readability since the loop mechanic moves to a referenced file. Defer until drift between the four copies actually causes pain.
