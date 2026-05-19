# Adversarial Review the Canon

A prompt for Claude Code or an equivalent agentic coding tool. Runs a systematic adversarial review of the canonical VibeLoom source-of-truth documents, then walks every issue with the user before editing.

The goal is not a general polish pass. The goal is to make the canon precise, concise, internally consistent, and operationally dependable enough that downstream site, skill, and engine work can trust it.

**Time budget.** Audit packet: 1-3 hours. Interactive fixes: 2-5 minutes per issue, longer for authority decisions.

---

## Purpose

Audit the v03 canon:

- `v03/codæ-manifesto.html` — WHY: durable thesis and motivation.
- `v03/vibeloom-methodology.md` — WHAT: concepts, modes, operations, status, traces, governance semantics.
- `v03/vibeloom-implementation.md` — HOW: runtime model, schemas, IDs, dispatch, trace I/O, validation, operation pseudocode.
- `v03/vibeloom-templates.md` — MATERIALIZATION EVIDENCE: bundled templates and skill content that must faithfully realize methodology + implementation.

Produce a prioritized adversarial issue packet. Each issue must explain why it matters, present 2-3 bounded fix options, recommend one option with rationale, and define how the fix will be verified. Then walk the user through every issue before applying edits.

## Authority Model

Use ownership by concern, not "lower tier wins."

| Concern | Canonical owner | Other docs may do this |
|---|---|---|
| Why the paradigm exists | Manifesto | Reference the thesis without adding mechanics |
| Concepts, terms, modes, operations, status semantics | Methodology | Cite methodology and avoid redefining |
| Runtime behavior, schemas, IDs, caches, validation, dispatch | Implementation | Cite implementation and avoid motivation |
| Concrete templates, task prompts, SKILL.md, reference docs | Templates | Materialize methodology + implementation only |

When ownership conflicts, surface the conflict. Do not silently make one document match another.

## Preconditions

- The four canon inputs exist.
- Inspect `git status --short`; do not require a clean tree, but record unrelated dirty files and avoid reverting them.
- Do not commit unless the user explicitly asks.
- The user wants an interactive issue-by-issue review.

## Adversarial Review Protocol

Run these passes in order. Do not start editing until the issue packet is ready and the user chooses the first issue.

### 1. Source Map

Build a compact map of the canon:

- Heading outline for each document.
- Major definitions and their canonical owner.
- Major schemas, ID rules, trace families, status categories, and operation semantics.
- Repeated claims or repeated definitions across documents.
- Downstream surfaces likely affected by changes: site, skill, templates, engine, helper prompts.

Write or update `canon-review-packet.md` with the map summary. Keep it concise; the map is audit evidence, not a new canon document.

### 2. Attack Passes

For each pass, look for concrete findings with file/section evidence.

**A. Authority and separation**

- Methodology contains implementation details, file layout, runtime grammar, or schema tables.
- Implementation explains motivation instead of runtime behavior.
- Manifesto relies on low-level implementation mechanics to make the thesis.
- Templates define concepts that methodology should own.
- One fact appears in multiple tiers without a clear canonical owner.

**B. Internal consistency**

- Manifesto promises something methodology or implementation does not deliver.
- Methodology and implementation disagree on modes, operation names, status categories, trace families, graph semantics, approval semantics, or scope semantics.
- Implementation examples contradict their own schemas.
- Template inventory or task names in implementation do not match `vibeloom-templates.md`.
- Forward references and section citations do not resolve.

**C. Concision and load-bearing value**

- A paragraph, table, example, or section can be removed without breaking a downstream consumer.
- The same concept is explained repeatedly within one document.
- A proof point, market claim, or example belongs in the site or evidence appendix, not durable canon.
- A detailed example obscures the rule it is supposed to clarify.

**D. Operational adequacy**

- Runtime rules are too vague for an agent or engine to implement.
- Schema examples omit required fields, include noncanonical fields, or use inconsistent IDs.
- Operation pseudocode has hidden side effects or misses required validation.
- Acceptance criteria are mixed with stale project status.

**E. Known v03 failure probes**

Explicitly check these classes even if the broad checklist seems to cover them:

- Decision trace identity: event ID vs rendered decision-record ID.
- Component to bounded-context cardinality.
- `root` as graph root vs repo/allocation scope.
- Vibe mode: whether it writes graph/cache/status artifacts.
- Task-template inventory names vs extracted template names.
- Task-template versioning promises vs actual templates.
- Stale acceptance checklists or build-status claims inside canon.
- Dated evidence and competitor claims embedded in durable canon.

### 3. Finding Quality Bar

Every finding must include:

- `id`: `CANON-001`, `CANON-002`, etc.
- `severity`: Critical, High, Medium, or Low.
- `location`: exact file and section; include line numbers when practical.
- `issue`: what is wrong.
- `why it matters`: the downstream consequence for readers, agents, site, skill, or engine.
- `fix options`: 2-3 options, each with the tradeoff.
- `recommended fix`: one option and why.
- `verification`: how to prove the fix worked.
- `downstream impact`: site, skill, templates, engine, helper prompts, or none.

Reject vague findings such as "tighten wording" unless the finding includes the exact current wording and a proposed replacement direction.

### 4. Priority Rules

Walk findings in this order:

1. Identity/schema contradictions that can break generated artifacts or trace replay.
2. Authority-boundary violations that cause future drift.
3. Stale or false implementation claims.
4. Concision cuts that reduce repeated or non-load-bearing text.
5. Local prose polish.

Group duplicates into one finding with all affected locations.

## Interactive Fix Loop

For each issue:

1. Show the issue summary, evidence, options, recommendation, and verification plan.
2. Ask the user to choose **Accept**, **Edit**, **Defer**, or **Reject**.
3. On Accept/Edit, apply only the approved change.
4. Record the decision and rationale in `canon-review-report.md`.
5. After every batch of up to five accepted edits, rerun the relevant attack passes on the affected area.

If an accepted fix changes canonical ownership, update downstream-impact notes before moving on.

## Output

- `canon-review-packet.md`: source map + prioritized adversarial findings.
- Edits to canon files only after user approval.
- `canon-review-report.md`: final disposition, applied changes, deferred items, downstream propagation list, and verification results.

## Postconditions

- Every finding in the packet has a recorded disposition.
- Every accepted edit has been applied and verified.
- No site or skill propagation occurs in this prompt; propagation is scheduled.
- The final report names all downstream surfaces that need follow-up.

## Constraints

- Agents propose; humans approve.
- Do not auto-apply fixes during packet creation.
- Do not commit unless explicitly requested.
- Do not fix the site or skill from this prompt.
- Do not fix canon to match implementation if implementation is wrong; surface the authority decision.
- Preserve frozen baselines and unrelated user changes.

## Validation Gates

- `git status --short` captured before and after.
- All forward references touched by accepted edits resolve.
- If template inventory or extracted-template claims are touched, run `python3 extract-templates.py --check` from `v03/` when available.
- If runtime/schema claims are touched, verify against the relevant implementation sections and, where useful, engine CLI or tests.

## Failure Modes

- **Too many issues.** Keep the packet complete, then ask the user whether to walk Critical/High first or all issues.
- **Cascade larger than ten dependent edits.** Pause and propose a batch decision.
- **User rejects a correctness fix.** Record the rationale and add a "known risk" note.
- **Evidence is ambiguous.** Present the competing readings and recommend the minimum clarifying edit.

## Anti-Patterns

- General commentary without concrete fix options.
- Treating lower-tier materialization as conceptually canonical.
- Turning methodology into implementation detail.
- Rewriting across many sections under one vague finding.
- Doing downstream propagation before canon decisions are settled.
