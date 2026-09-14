# Verification Ladder + Semantic Eval Reference

Load on demand during `eval`, `review`, `reconcile`, and `approve` when the target needs validation across the verification ladder.

## The verification ladder

The three tiers (Decidable / Mechanical / Heuristic) and the per-tier check inventory are canonically defined in [methodology §14.3](../vibeloom-methodology.md#143-verification-ladder). This reference covers the **heuristic tier** only — agent-judged semantic dimensions, where guidance is needed. The decidable and mechanical tiers are engine-driven and don't require this file.

The codæ trajectory is to promote checks upward as the engine matures — heuristic dimensions become mechanical runners; mechanical runners become structural rules. The decidable share grows over time.

**These checks describe WHAT to validate, not HOW.** Reason with whatever approach works best for the current model; emit findings in the schema below. Do not invent procedural steps, rubrics, or scoring systems.

---

## Finding Schema

Every semantic finding is a JSON object with these fields:

| Field | Type | Notes |
|---|---|---|
| `severity` | `breaking` \| `advisory` | Semantic axis — see Severity Classification below |
| `gate_effect` | `blocking` \| `non-blocking` | Policy axis — whether this finding gates approval. Defaults: `breaking` ⇒ `blocking`, `advisory` ⇒ `non-blocking`. Orchestrator may override. |
| `dimension` | enum | `faithful-representation`, `naming-consistency`, `implicit-dependencies`, `capability-gap`, `ux-product-mismatch`, `mockup-extraction-gap`, `target-platform-mismatch`, `other` |
| `upstream_id` | string \| null | The upstream item the downstream was checked against; null if not tied to a single upstream |
| `downstream_id` | string | The item or artifact being evaluated |
| `message` | string | One-sentence finding. Quote the specific divergent phrasing when possible. |
| `suggested_fix` | string \| null | Optional concrete edit direction; null when not obvious |

If no findings for a check, return an empty list. Do not invent severities, dimensions, or fields.

---

## Severity Classification

VibeLoom uses a **two-axis** model:

- **Semantic severity (`severity`)** — what the finding asserts about meaning. Values: `breaking` | `advisory`.
- **Gate effect (`gate_effect`)** — what the finding does to the approval gate at evaluation time. Values: `blocking` | `non-blocking`.

The two are correlated but distinct: by default, `breaking` ⇒ `blocking` and `advisory` ⇒ `non-blocking`. The orchestrator may override `gate_effect` per project policy (e.g., promote a recurring advisory to blocking until addressed). Older eval traces that emit only `severity` SHOULD be read as `severity=blocking` ⇔ `severity=breaking`; new traces SHOULD set both fields.

- **`breaking`** — the finding alters the meaning of an approved upstream item (narrowing, widening, reversing) or represents a capability entirely unaddressed. Breaking findings are `blocking` by default; they block delegated auto-advance in `pm` / `dev` modes and escalate to explicit user review (methodology ## Generation ### Approval And Auto-Advance).
- **`advisory`** — worth surfacing, but does not reliably indicate a spec defect. Naming drift, suggested implicit edges, and partial capability coverage are typically advisory and `non-blocking`.

When in doubt, classify as `breaking`. False advisories cost a review cycle; false-negative breaking findings let meaning drift past an approval gate.

---

## Dimensions

### Faithful Representation

**What:** For a downstream item and each item it declares in `derives_from`, judge whether the downstream faithfully represents the upstream's meaning.

**Faithful** means the downstream neither narrows, widens, reverses, nor contradicts the upstream. Adding detail or refinement consistent with the upstream is not a violation — that is what downstream tiers are for. Changing the scope, direction, or claim is.

**Breaking signals:**
- Downstream narrows upstream scope (e.g., upstream says "all users," downstream applies to "premium users only")
- Downstream widens upstream scope beyond what's stated
- Downstream reverses or negates upstream meaning
- Component interfaces (`IF-####`): contract, error behavior, or effects differ from the approved version
- Invariants (`INV-####`): rule weakened or strengthened compared to the approved version

**Advisory signals:**
- Downstream picks one plausible reading of an ambiguous upstream; another reading is equally plausible
- Downstream omits a detail that could be a deliberate refinement or a gap (when ambiguity is genuine)

If the downstream faithfully represents the upstream, emit no finding.

### Naming Consistency

**What:** Given the domain model's `TERM-####` items and a downstream artifact, judge whether the artifact's terminology aligns with the ubiquitous language.

**Consistent** means concepts defined by `TERM-####` are referred to using the same word or phrase throughout. Introducing a new word for a defined concept is a drift. Using a defined term with a different meaning than its `TERM` entry is a drift.

**Breaking** when the drift introduces genuine semantic confusion — the same word used for two different concepts in the same artifact, or a defined term used with a contrary meaning. **Advisory** for simple naming inconsistencies that don't obscure meaning.

If terminology aligns with the domain model, emit no finding.

### Implicit Dependencies

**What:** For a downstream item and its declared `derives_from`, judge whether there are upstream items the downstream's meaning depends on but that are not in `derives_from`.

**Candidate upstreams** are items of allowed upstream prefixes for the downstream's type per the Contract Graph (methodology §8). Do not propose edges to disallowed types.

**Depends on** means the downstream's description, constraints, or behavior would change if the candidate were removed or modified. A passing mention is not a dependency; a load-bearing reference is.

Emit one `advisory` finding per missing edge. Do not classify as `breaking` — whether to add the edge is a user decision, not an approval gate.

If no implicit dependencies are detected, emit no finding.

### Capability Gaps

**What:** Given all `CAP-####` and `CST-####` items from `intent` and the full downstream stack, judge whether each capability and hard constraint is substantively addressed somewhere downstream.

**Addressed** means at least one downstream artifact carries meaning that implements or enables the capability — not just a `derives_from` edge pointing at it. The engine's structural coverage check already ensures at least one edge exists; this check asks whether the meaning is actually carried.

**Breaking** for capabilities or hard constraints entirely unaddressed. **Advisory** when partially addressed, or addressed at an unexpectedly shallow level for the current mode.

If all capabilities and constraints are substantively addressed, emit no finding.

### UX/Product Mismatch

**What:** When ux-specs and product-specs are both in scope, judge whether they remain coherent. A VIEW that implies behavior not captured by any FR or STORY, or an FR that implies a UI surface not captured by any VIEW, are mismatches.

**Breaking** when the mismatch represents a substantive functional gap (e.g. "STORY-0019 says users can share notes by email, but no VIEW or INT supports this"). **Advisory** for cosmetic or minor coverage gaps.

If ux-specs and product-specs remain coherent, emit no finding.

### Mockup Extraction Gap

**What:** When mockups (`MOCK-####`) are in the load set, judge whether the contract items (FR, STORY, ACC, BC, TERM) substantively capture what the mockups visibly imply. Designers express user obligations through mockups; if a mockup shows a "recurring" toggle but no contract item captures recurring behavior, that's an extraction gap.

**Breaking** when a clearly visible mockup obligation is entirely missing from the contract (especially in `ux` mode where mockups drive product-spec generation). **Advisory** when the obligation is captured at a different level of abstraction or in a related item.

If mockup-implied obligations are substantively captured, emit no finding.

### Target-Platform Mismatch

**What:** When system-specs containers carry a `layer` field and `defaults.md` declares Tech Stack per layer, judge whether each container's deployment target and its inferred shape are consistent with the declared stack.

Examples:
- A `presentation` container declares "deploys as AWS Lambda" — mismatch (presentation is typically static asset bundle, not serverless function).
- A `domain` container's components declare interfaces that imply event-sourced aggregates, but defaults Tech Stack `aggregate pattern: CRUD` — mismatch.
- An `infrastructure` container declares no platform service dependencies — mismatch (infrastructure containers exist to declare them).

**Breaking** when the mismatch implies the codegen will produce a non-functional artifact (e.g. trying to package a SPA as a Lambda function). **Advisory** when the mismatch is a stylistic divergence from the declared stack.

If the deployment target and stack are consistent across all containers, emit no finding.

### Other Drift

The named dimensions above are not exhaustive. When you observe a semantic issue that clearly matters for approval but fits none of them, emit a finding with `dimension: other` and a message that identifies the nature of the drift. Prefer a named dimension when one fits; reserve `other` for genuine novelty.

---

## Application Notes

- Apply every dimension relevant to the target scope. `faithful-representation` and `implicit-dependencies` are per-item; `naming-consistency` and `capability-gap` are per-artifact or per-stack. `ux-product-mismatch` applies when both ux-specs and product-specs are in scope. `mockup-extraction-gap` applies when MOCK items are in the load set. `target-platform-mismatch` applies when system-specs containers and the Tech Stack section are in scope.
- Return the full finding list. Filtering to "most important" findings is the orchestrator's call, not the check's.
- Semantic eval is target-bounded — validate the target against its approved upstream basis; do not inspect downstream artifacts.
