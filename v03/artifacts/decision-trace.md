<!--
VibeLoom template: decision-trace (single template for all human-authored decisions)
Tier: context (decision traces are persisted under .vibeloom/traces/decisions.jsonl as durable provenance; this template is the markdown representation that materializes per-record into project folders for human readability)
Purpose: capture human-authored decisions with classification by primary contract tier.

Decisions live in one trace family with `record_type` classifying the primary contract tier:

| record_type | meaning                          | primary tier         |
|-------------|----------------------------------|----------------------|
| IDR         | Intent Decision Record           | intent-specs         |
| PDR         | Product Decision Record          | product-specs        |
| UDR         | UX Decision Record               | ux-specs             |
| ADR         | Architecture Decision Record     | system-specs         |
| general     | process / methodology / ops      | none — no contract   |

Materialization convention (project layout):
- Each decision instance is its own file, organized under decisions/ by record_type:
  decisions/idr/IDR-0001-<slug>.md
  decisions/pdr/PDR-0007-<slug>.md
  decisions/udr/UDR-0003-<slug>.md
  decisions/adr/ADR-0042-<slug>.md
  decisions/general/DEC-0099-<slug>.md
- The append-only trace stream at .vibeloom/traces/decisions.jsonl carries the canonical record (one JSON object per line). The per-record markdown files are the human-readable rendering.

Generator guidance:
- Classify by PRIMARY locus, not by all tiers a decision ripples to. A decision that's primarily architectural (e.g. "REST → GraphQL") is an ADR even if it ripples to product, UX, and code. Multi-tier impact is captured in `affects: [item_ids]`, not in record_type.
- `general` is for decisions that don't change contract content (process conventions, methodology choices, operations). These typically have empty `affects` and stay `load_bearing: false`.
- `load_bearing: true` only when the decision still informs future generation (preserve / avoid / why-still-binding / which-rejected-alternative).
- Truly normative decisions should be promoted to IDed contract items; the trace entry remains immutable.
- Fill `affects: [item_ids]` with the contract item IDs this decision constrains. This is what enables the future v0.4+ promotion to graph nodes.
-->

---
trace_id: DEC-<YYYYMMDD>-<NNNN>            # event identity, replay key (e.g. DEC-20260512-0007)
record_id: <RECORD>-<NNNN>                 # rendered-record identity (e.g. ADR-0007); omit for record_type: general
kind: decision
record_type: <IDR | PDR | UDR | ADR | general>
load_bearing: <true | false>
affects: []                                # list of contract item IDs constrained by this decision
timestamp: "<ISO-8601 timestamp>"
author: "<email-or-handle>"
topic: "<short slug or title>"
---

# <Decision title>

<!-- One-sentence summary of what was decided. -->

## Context

<!-- The circumstances that led to this decision. What was the situation, what changed, what triggered it. -->

## Decision

<!-- What was decided. Be specific. -->

## Rationale

<!-- Why this choice was made. Tradeoffs considered, alternatives evaluated. -->

## Alternatives considered

<!-- Other options examined and why they were rejected. -->

| option | why rejected |
|---|---|
| | |

## Consequences

<!-- What follows from this decision: changes required, downstream items affected, ongoing constraints. -->

| affected_item_id | expected_effect |
|---|---|
| | |

## Status

<!--
- proposed: under discussion, not yet load-bearing
- accepted: load_bearing=true; informs future generation
- superseded: load_bearing=false; replaced by another decision (reference it)
- deprecated: load_bearing=false; no longer applies but kept for history
-->

- **Status:** <proposed | accepted | superseded | deprecated>
- **Superseded by:** <DEC-id, if applicable>
