# VibeLoom Methodology

**Status:** v03 draft. Subject to change. Companion: [`vibeloom-implementation.md`](vibeloom-implementation.md). Predecessor: [`codæ-manifesto.html`](codæ-manifesto.html).

VibeLoom governs long-lived AI-generated software through a human-mendable contract stack: a traceable graph of mutually derived semantic items with stable IDs. Agents generate, evaluate, review, reconcile, and compile downstream from approved upstream truth. Humans hold the wheel at approval gates and bounded review surfaces.

This document defines **what VibeLoom is**. The case for the paradigm is in the manifesto; the technical realization is in the implementation doc.

---

## 1. Relationship to codæ

codæ is the paradigm: contract-driven agentic engineering. VibeLoom is one concrete instantiation. The paradigm could be instantiated by other methodologies + skills + engines + template systems; VibeLoom is the reference implementation in the codæ family.

What VibeLoom defines:

- the contract stack (tiers and artifact families),
- the Contract Graph,
- operating modes,
- review and reconciliation workflows,
- context and traces,
- subagent loading and generation rules,
- conformance evidence and code-sync.


---

## 2. Principles

1. **Live contract, not stale specs.** The system is defined by a living contract stack, not one-off planning documents that decay after the first feature.
2. **Contract as eval.** The same upstream items that drive generation also serve as the basis against which downstream output is checked.
3. **Human-mendable review surface.** Humans review affected contract cuts, approval packets, and reconciliation choices — not full generated code.
4. **Traceability by ID.** Every governed semantic item has a stable ID and an explicit derivation basis.
5. **Scoped generation.** Agents work from bounded load sets derived from the graph, not from the whole repo.
6. **Traces are evidence, not truth.** Trace data may propose improvements; it never silently mutates contract or context.
7. **False positives beat false negatives.** Over-marking drift wastes work; under-marking lets incoherence leak through.
8. **Contract aspires toward decidability.** Eval operates on a verification ladder (§14.3) of *decidable* structural checks, *mechanical* validation runners, and *heuristic* semantic eval. The trajectory is to promote checks upward — heuristic dimensions become mechanical runners; mechanical runners become structural rules. The decidable share of the contract grows as the engine matures.

---

## 3. When to use VibeLoom

Use VibeLoom when:

- the system must survive more than one generation step,
- multiple contributors or agents may work on it,
- product, domain, UX, or architecture decisions matter,
- drift would be expensive or dangerous,
- you need traceability from intent to implementation.

Do not use VibeLoom for:

- throwaway prototypes,
- single-file utilities,
- weekend demos,
- tasks where reviewing the generated code is plainly faster than governing a contract.

A heuristic: if the system is single-author, single-cycle, and small enough that re-reading it end-to-end before each change is faster than maintaining a contract about it, prompt-only is faster. Once any of those breaks — second contributor, second iteration, or the cost-of-rereading exceeds the cost-of-governing — the contract overhead pays back.

---

## 4. Layers and traces

VibeLoom organizes everything into the contract / context / code stack plus a parallel trace stream.

### 4.1 Contract

Governed semantic truth. Contract artifacts have lifecycle state: `draft` or `approved`. Only approved contract items may drive downstream generation.

### 4.2 Context

Active generation guidance derived from approved contract. Context is not approved like contract. It may be reviewed or evaluated, but the normal fix path for bad context is to amend the upstream contract and regenerate.

### 4.3 Code

Executable output: source, tests, runtime, deployment, migrations, operational wiring. Code is **synchronized and validated**, not approved like contract.

### 4.4 Traces

Durable provenance and learning data, running parallel to the contract / context / code stack above. Traces are not normal generation context. See §11.

```text
intent-specs
   ↓
product-specs  ↔  ux-specs
   ↓       jointly constrain
system-specs
   ↓
context
   ↓
code

traces run alongside as durable provenance.
```

`product-specs` and `ux-specs` are peer/co-informing tiers during generation. The approved Contract Graph is acyclic.

---

## 5. Modes

A mode controls contract depth, approval gates, and UX surface.

| Mode | Lead | User-owned approval stops | Delegated tiers | Internal structure |
| --- | --- | --- | --- | --- |
| `vibe` | solo | `intent-specs` | system + code | minimal — no graph, no code-sync, no per-item status (lightweight `where am I?` status report only) |
| `pm` | product | `intent-specs`, `product-specs`, optionally `ux-specs` | `system-specs` | full graph + traces |
| `dev` | tech | `intent-specs`, `system-specs` | `product-specs`, optionally `ux-specs` | full graph + traces |
| `ux` | design | `intent-specs`, `ux-specs`, optionally `product-specs` | `system-specs` | full graph + traces |
| `expert` | architect | all contract tiers | none | full graph + traces |

`intent-specs` are always user-owned. Delegated auto-advance is allowed only when structural eval passes and no semantic judgment requires escalation.

### 5.1 vibe is intentionally minimal

`vibe` is not a stripped-down full mode — it's a different operating point. The compact stack: `intent.md`, an inferred flat `system.md`, an `AGENTS.md` for the model. No IDed graph, no code-sync trace, no per-item status taxonomy; `status` in vibe is a lightweight one-screen "where am I?" report computed from intent + trace tails (see implementation §15.6). A modern model keeps the small system coherent on its own.

vibe still emits approval traces — approval provenance survives for the future upgrade — but skips the heavyweight machinery.

### 5.2 Upgrade is a feature

VibeLoom watches lightweight heuristics during a vibe project — number of components emerging, approximate LOC, number of contributors, frequency of reconciliation pain — and recommends upgrade when the system has clearly outgrown vibe. Upgrade (`init --upgrade --mode <pm|dev|ux|expert>`) is one-way and produces an explicit migration trace. The compact stack expands into the full graph; existing code is import-analyzed against the freshly generated full contract.

### 5.3 ux mode is designer-led + PM peer

`ux` is the design-led counterpart to `pm` (product-led) and `dev` (tech-led). It exists for products where the designer drives discovery — where mockups, flows, and user-visible behavior are authored *first* and product specs follow.

In `ux` mode:

- the user (designer) owns and approves `intent-specs` and `ux-specs`;
- `product-specs` is generated from approved intent + ux evidence and presented to the PM as a *peer review* gate (the PM reviews and approves but does not by default author);
- `system-specs` is delegated to auto-advance when structural and semantic eval are clean;
- mockups are first-class input evidence and may directly drive product-spec generation via the `generate-product-specs-from-ux` task variant.

`ux` and `pm` modes are mirror images: each makes one tier (ux-specs vs product-specs) the primary author surface and the other a peer-review surface. Choose based on which discipline drives discovery on your team.

---

## 6. Contract artifacts

### 6.1 Intent-specs

| Artifact | Purpose | Principal entities |
| --- | --- | --- |
| `intent` | prose-first user intent: capabilities, hard constraints | `CAP-####`, `CST-####` |
| `defaults` | always-on repo-wide rules normalized from intent, including the **Tech Stack** section | `DEF-####` (or `CST` depending on template) |

`intent` is the only root source of user-authored semantic intent. Free prose is allowed; structured capabilities and constraints are IDed.

**Tech Stack section in `defaults`.** `defaults` includes a structured Tech Stack section organized by DDD architectural layer (Presentation / Application / Domain / Infrastructure). Each layer names its binding choices; empty fields signal "agent decides reasonably given other constraints." Stack choices made here are inherited by all containers in the matching layer; per-container overrides are allowed. Per-layer field shape is normative in [`vibeloom-implementation.md §6`](./vibeloom-implementation.md) and the `defaults.md` template in `vibeloom-templates.md`.

### 6.2 Product-specs

| Artifact | Purpose | Principal entities |
| --- | --- | --- |
| `prd` | objectives, requirements, metrics, NFRs | `OBJ`, `KR`, `MET`, `FR`, `NFR` |
| `usm` | epics, flows, stories, acceptance criteria | `EPIC`, `FLOW`, `STORY`, `ACC`, `MS` |
| `dm` | domain model: ubiquitous language, bounded contexts, invariants | `TERM`, `BC`, `AGG`, `ENT`, `VO`, `INV` |

EARS-style normalized statements (Easy Approach to Requirements Syntax) may be attached as a structured field on requirements (`FR`, `NFR`) and acceptance criteria (`ACC`). EARS is a structured complement, not a replacement for prose. The agent generates EARS from prose; the user can edit either.

### 6.3 UX-specs

UX-specs are a peer/co-informing tier with product-specs. They may be generated from user intent, product specs, designer-provided mockups, and existing application evidence.

| Artifact | Purpose | Principal entities |
| --- | --- | --- |
| `ux` | user-visible surfaces, interactions, UX constraints, mockup references | `VIEW`, `INT`, `UXC`, `MOCK` |
| `ux-specs/mockups/` | designer-provided images, Figma snapshots, references | referenced by `MOCK-####` |

Mockups are critical input evidence. Good mockups often reveal entities, flows, stories, labels, states, and constraints. Mockups may influence product-spec generation. **Mockups do not become normative truth until their extracted obligations are represented as IDed contract items.**

In `ux` mode (§5.3), mockups can drive product-spec generation directly via the `generate-product-specs-from-ux` task variant. The generated product-specs still go through PM peer review and approval before becoming load-bearing.

### 6.4 System-specs

| Artifact | Purpose | Principal entities |
| --- | --- | --- |
| `system` | system context, external actors and systems, trust boundaries, global NFR boundaries | `EXT`, `TB`, `SNFR` |
| `containers` | runtime/deployment topology and container inventory | `CONT` |
| `container.md` (per container) | one runtime/deployment home and its resident component inventory; carries a required `layer` field (see §6.5) | `CMP` |
| `component.md` (per component) | terminal technical ownership boundary | `IF`, `DEP`, `BEH`, `NOTE` as structured content |

### 6.5 Layered architecture

Every container carries a `layer` field — a required enum drawn from the DDD architectural layers. The layer determines what the container hosts and what generation rules apply.

| Layer | Hosts BCs? | Components are... | Notes |
| --- | --- | --- | --- |
| `presentation` | No | UI components (pages, layouts, widgets) | Inherits stack choices from `defaults` Presentation section. Typically one container; micro-frontends are a minority pattern. |
| `application` | No | API surfaces, orchestration handlers, BFF endpoints | Inherits Application stack. Often one container per UI surface (web, mobile, admin); changes with screens, so not a "microservice" in the autonomous-business-capability sense — more a thin orchestration layer. |
| `domain` | **Yes** | Service-shaped components, each hosting exactly one bounded context | Inherits Domain stack. Decomposition: `monolith` (all components in one container, one BC per component) or `multi-service` (one container per component = canonical microservices). |
| `infrastructure` | No | No internal components — declares consumed platform services as dependencies | Inherits Infrastructure stack. |

**Key invariants.** Component is the smallest owned technical boundary for generation, communication, and change. **Each domain-layer component hosts exactly one bounded context**; each bounded context belongs to exactly one component (1:1 mapping in the domain layer). Bounded contexts are domain partitions, not runtime deployment units.

Bounded-context relationships (Customer-Supplier, Conformist, Anti-Corruption Layer) and cross-layer interaction graphs are tracked in the [roadmap](roadmap.md#c2-ddd-context-maps) for a future version.

---

## 7. Context artifacts

| Artifact | Purpose |
| --- | --- |
| `config` | active generation guidance for an agent scope, e.g. `AGENTS.md` / `CLAUDE.md` |
| `bdd` / `scenarios` | non-executable behavioral scenarios; later usable for executable tests |

Context is purely active generation guidance. Decisions — including ADR/PDR-style records — are anchored in append-only traces (§11), with per-record markdown renderings under `/decisions/<record_type>/` as derived views (see implementation §8.5.1). The active "decision context" for a packet is a queried view over decision traces filtered by `load_bearing: true`. Binding decisions should be promoted to IDed contract items.

---

## 8. Contract Graph

The **Contract Graph** is the parsed, queryable model of relationships between all entities defined in the contract. The term is stable; the implementation evolves.

Nodes are IDed semantic items (entities). In v0.3, edges are `derives_from` relationships, and the graph is a DAG — i.e. the v0.3 Contract Graph is essentially a derivation DAG. Future implementations may add provenance, typed relations, and other materializations (see roadmap CGKG-B).

v0.3 ships the Contract Graph as a **knowledge graph**: instantiated ontology only — entities and typed relations as they are now. Provenance (decisions, generation events, eval findings, code-sync evidence, brownfield import history) lives in traces, not in the graph. Trace schemas (§11) carry enough metadata to promote those relationships to graph form later (roadmap CGKG-B).

The Contract Graph answers:

- what derives from what,
- what is affected if a node changes,
- which artifacts own affected nodes,
- what context to load for a scope,
- what code-sync evidence claims realization,
- what review or reconciliation packet should be shown.

### 8.1 Boundary principle

Component is the terminal contract node for technical ownership. Interfaces, dependencies, behaviors, notes, scenarios, and UX items may be addressable, but implementations may choose whether each becomes a graph node or structured content depending on churn risk.

Code does not require deep graph carriers in v03. Code-sync traces (§11) bridge graph items to code paths and file hashes.

### 8.2 Derivation rules

Root items are capabilities and constraints (`CAP`, `CST`). **Every other item derives, directly or transitively, from at least one root.** Downstream items derive from one or more approved upstream items or accepted input evidence (e.g., mockups). Product and UX may co-inform generation, but the approved Contract Graph remains acyclic.

---

## 9. Status categories

Use distinct categories instead of overloading "stale":

| Category | Meaning |
| --- | --- |
| `current` | synchronized to approved basis; no findings |
| `stale` | downstream depended on changed approved truth |
| `uncovered` | approved upstream item lacks required downstream realization |
| `dangling` | downstream references a removed upstream item |
| `drifted` | semantic mismatch, direct edit, or unvalidated divergence |
| `obsolete` | upstream basis was superseded conceptually (not just hash-different); the item describes a behavior nobody is asking for anymore |

`uncovered` is distinct from `stale`: newly approved upstream items create downstream obligations even though no downstream item can yet depend on them.

`obsolete` requires explicit user marking or a heuristic signal (e.g., the only downstream consumers were themselves removed). It catches ghost items before they accumulate unflagged.

---

## 10. Cognitive surface

The **cognitive surface** of a project is the set of items a human must hold in working memory to govern it: contract items in the affected review cut — capabilities, constraints, requirements, flows, bounded contexts, interfaces, behaviors, decisions, obligations — as opposed to code items (files, classes, functions, branches, tests, dependency edges) in the corresponding implementation. Working memory is hard-bounded (Brooks's essential complexity thesis; Miller's 7±2 constraint), so the only durable lever is to keep the *governed* set small enough to fit while the *generated* set scales with features.

VibeLoom's bet — and the codæ partition — is that the contract surface stays at human scale while implementation grows under it. The empirical anchor is in [manifesto §5](codæ-manifesto.html#surface): a 108K-LOC C# system governed by a contract surface roughly 24% of the code volume (Vasilopoulos 2026). v0.3 surfaces this as an architectural principle; **item-count compression as a measurable per-cycle metric** — review compression ratio, review time per packet, defect-detection rate at review vs after merge, downstream-rework frequency per approval — is engine-side instrumentation deferred to v04+ ([roadmap A4](roadmap.md#a4-cognitive-surface-instrumentation)).

---

## 11. Traces

Traces are append-oriented provenance records. They are durable and not silently regenerated from current state. Schemas are designed so the relationships they capture — decision provenance, code-sync mapping, generation lineage, and others — can be promoted to graph form in a future release without information loss (see roadmap CGKG-B).

Canonical trace families:

| Trace | Purpose |
| --- | --- |
| `approval` | who/what approved which contract basis |
| `generation` | what task generated what artifact from which basis |
| `eval` | what checks ran and what findings resulted |
| `code-sync` | source-map-like connection from code paths/hashes to contract IDs and validation evidence |
| `decision` | human-authored decision history (ADR / PDR / UDR / IDR / general) |
| `import` | evidence and confidence for brownfield inference |

ID allocation state and retired IDs are not a trace family — they are durable mutable state under `.vibeloom/state/id-registry.json`. See implementation §3.3 and §5.2.

Traces can propose improvements via mediated proposals ([roadmap §D](roadmap.md#d-trace-derived-learning)) but never become contract truth without review and approval.

### 11.1 Decision trace classification

`decision` traces are the single home for human-authored decision history. Every decision trace carries a `record_type` tag classifying which contract tier it primarily affects:

| `record_type` | What it records | Primary tier |
| --- | --- | --- |
| `IDR` | Intent Decision Record | intent-specs (capabilities, constraints, defaults, Tech Stack) |
| `PDR` | Product Decision Record | product-specs (requirements, stories, domain model) |
| `UDR` | UX Decision Record | ux-specs (UI patterns, mockup choices, design tokens) |
| `ADR` | Architecture Decision Record | system-specs (containers, components, layer/stack architecture) |
| `general` | process, methodology, or operational decision | none — does not change contract content |

Classification by **primary** tier (not all tiers a decision ripples to). Multi-tier impact is captured in the trace's `affects: [item_ids]` field, not in the `record_type`.

Each entry carries a `load_bearing` flag (default `false`); the active subset is a queried view. Flag a decision `load_bearing: true` only if it answers one of: what must be preserved, what must be avoided, why a design or product choice still binds, which tempting alternative was rejected. When it stops binding, flip to `false` (the entry remains immutable). Promote truly normative decisions to IDed contract items.

`general` decisions don't change contract content — they record team conventions, methodology choices, operational choices. They typically have empty `affects` and remain `load_bearing: false`; they're preserved for human reference, not for graph promotion.

---

## 12. Operations

VibeLoom's operations are orthogonal: none does another's job.

### `init`

Bootstrap an ungoverned repo with draft `intent-specs` in the selected mode.

### `import`

Bootstrap from existing code and evidence. Brownfield import produces candidate contract artifacts in `draft` with confidence and evidence. Imported items are not trusted until reviewed and approved.

### `generate`

Regenerate **affected/stale/uncovered** downstream artifacts from approved upstream truth. It does not attempt to preserve manual downstream edits — for that, use `reconcile`. Generation is basis-idempotent: the same approved basis converges to equivalent output, but exact text/code equality is not promised unless model and runtime are deterministic and pinned.

### `eval`

Read-only validation of a target against approved upstream truth. Produces findings; modifies nothing.

### `review`

Interactive findings loop on a single target:

```text
eval → findings → propose bounded fixes → human approves or edits → repeat
```

`review` fixes the target. It does **not** propagate changes downward. After approving the reviewed target, `generate` is the next operation if downstream needs to follow.

### `reconcile`

Interactive stale/drift loop:

```text
detect → propose direction → human steers → regenerate or patch → eval → repeat
```

`reconcile` exists when existing downstream content may carry signal worth preserving. Direction options include: preserve contract and regenerate downstream, amend contract to preserve downstream behavior, or user-defined.

### `approve`

Advance a reviewed contract approval unit from `draft` to `approved`. Requires structural eval pass. Records an approval trace.

### `status`

Read-only report over lifecycle, freshness, uncovered items, dangling references, drift findings, obsolete items, affected scope, traces, and current mode. Recommends the next operation.

---

## 13. Review and reconciliation packets

A **review packet** is the bounded human review surface for findings on a target.

A **reconciliation packet** is the bounded human review surface for stale/drift cases and preservation/regeneration choices.

Both are generated by the engine, presented by the skill, and editable by the user.

The user should not review raw whole artifacts unless they choose to drill down. The default surface is:

- changed IDs,
- upstream basis,
- findings (blocking and advisory),
- proposed bounded fixes (review packet) or direction options (reconciliation packet),
- downstream impact,
- recommendation,
- evidence and traces.

Packets are write-capable: the user can add a finding, modify a recommendation, or note a decision before deciding.

---

## 14. Eval

Eval has structural and semantic layers, organized on a verification ladder (§14.3).

### 14.1 Structural eval

Deterministic or mostly deterministic checks:

- lifecycle consistency,
- required fields,
- ID validity and registry consistency,
- reference integrity,
- tier order and DAG validity,
- coverage and uncovered items,
- dangling references,
- component/container ownership rules,
- context sufficiency,
- trace and code-sync consistency where available.

### 14.2 Semantic eval

Agent-judged checks:

- faithful representation of upstream meaning,
- naming consistency with ubiquitous language,
- implicit dependency detection,
- capability gaps,
- UX/product mismatch,
- mockup extraction gaps,
- target-platform mismatch.

Ambiguous semantic cases escalate. Findings are categorized as `blocking` or `advisory`.

### 14.3 Verification ladder

Eval operates on a ladder of decidable, mechanical, and heuristic tiers. Decidable is the most rigorous and the cheapest (pure compute, no LLM); heuristic is the least rigorous and the most expensive (LLM-judged). The codæ trajectory: *promote* checks upward as the engine matures — heuristic dimensions become mechanical runners, mechanical runners become structural rules — so the cheap-and-rigorous share grows over time.

| Tier | What it is | v0.3 today | Trajectory |
| --- | --- | --- | --- |
| **Decidable** | Structural eval — deterministic checks the engine performs without an LLM | Checks include: lifecycle consistency, required fields, ID validity & registry consistency, reference integrity, tier-order/DAG validity, coverage, dangling references, ownership rules, context sufficiency | grows as new structural rules are codified (e.g. `derives_from` multi-source rules, BC/component/container topology rules, code-sync invariants) |
| **Mechanical** | Validation runners — project-defined commands the orchestrator runs against generated artifacts | declared in `validation-registry.md`. Standard families: typecheck, lint, unit/integration tests, contract conformance, generated BDD, security checks, smoke/deploy | grows as a runner library accumulates and as task templates emit expected runners; some heuristic dimensions become mechanical when they can be expressed as runners |
| **Heuristic** | Semantic eval — agent-judged dimensions | Dimensions include: faithful representation, naming consistency, implicit dependency detection, capability gaps, UX/product mismatch, mockup extraction gaps, target-platform mismatch | shrinks over time as dimensions are promoted into mechanical runners or structural rules; the residue (genuinely judgment-call cases) escalates to user |

The ladder is the honest answer to "what does semi-formal verification mean in v0.3?" — and the measurable trajectory: a future release ships when its decidable + mechanical share has grown.

The ladder is conscious of an old dream. As agentic engineering matures and the decidable share grows, codæ contracts may revive the long-standing aspiration of formally verifiable software at system scope. That destination is years away. The ladder is the climb.

---

## 15. Change classification

Not every edit is automatically breaking, but every edit is approval-relevant.

| Change | Default classification |
| --- | --- |
| typo, formatting, editorial cleanup | non-breaking if semantic hash and eval confirm no meaning change |
| clarifying wording | approval-relevant, usually non-breaking |
| behavioral change | breaking |
| `derives_from` change | usually breaking |
| ID, scope, container, or component move | breaking |
| deletion | breaking |
| new consistent item | non-breaking; may create uncovered downstream obligations |

Ambiguous mutations escalate as breaking by default.

---

## 16. Workflow shapes

Operations compose into a small set of recurring chains. The table summarizes the shapes; full worked examples with embedded artifact content live in [`examples/`](examples/).

| Workflow | Operation chain |
| --- | --- |
| New project | `init --mode <mode>` → `review intent-specs` → `approve intent-specs` → `generate` → `status` |
| Brownfield import | `import --mode <mode>` → `review` (top-down) → `approve` (top-down) → `generate` (uncovered) → `reconcile` (drifted code) → `status` |
| Product + UX co-synthesis (`pm` or `ux` mode) | `approve intent-specs` → `generate product-specs ⇄ ux-specs` (iterative, mockups + prose as evidence) → `approve` both → `generate system-specs` |
| ux-led project | `init --mode ux` → drop mockups into `ux-specs/mockups/` → `approve intent-specs` + `approve ux-specs` → `generate product-specs --from ux` → PM peer-reviews + approves → `system-specs` auto-advances → `generate code` |
| Reconciliation | `status` (detect drift) → `reconcile` (user chooses direction per case) → bounded `generate`/patch → `eval` → traces |

Reading: each chain is the canonical sequence; mode-specific approval gates and auto-advance behavior are defined in §5. Branches and edge cases (failed eval, mid-stream amendments, partial-wave failures) are covered in the corresponding `examples/` walkthrough.

---

## 17. Non-goals

VibeLoom is not:

- a formal verification system (though see the [roadmap](roadmap.md) for the trajectory toward more decidable contracts),
- a TDD methodology (though it requires conformance evidence; tests are one form of evidence),
- a UI design tool (though UX evidence and mockups are first-class inputs),
- a deterministic compiler (though the compiler analogy clarifies the intended control surface),
- a replacement for human judgment at approval gates,
- a guarantee that humans never inspect code in v03 — that is the dark-factory trajectory, not the v03 promise,
- a claim about how DDD must be implemented universally — the layer/component/bounded-context topology in §6.5 is VibeLoom's governance choice, not a normative claim about DDD at large.

---

## 18. See also

- [`codæ-manifesto.html`](codæ-manifesto.html) — the case for contract-driven agentic engineering
- [`vibeloom-implementation.md`](vibeloom-implementation.md) — technical realization (engine, layout, schemas, operations, dispatch)
- [`vibeloom-comparison.html`](vibeloom-comparison.html) — VibeLoom vs Kiro, Spec Kit, BMAD
- [`getting-started.md`](getting-started.md) — 30-minute on-ramp for new users
- [`roadmap.md`](roadmap.md) — features and capabilities considered for v04+
- [`examples/`](examples/) — worked examples (greenfield, brownfield, ux-led, multi-component reconciliation, parallel dispatch)
