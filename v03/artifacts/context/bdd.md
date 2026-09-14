<!--
VibeLoom template: bdd (behavioral scenarios)
Tier: context (full modes only; not generated in vibe)
Purpose: non-executable Gherkin scenarios derived from approved contract for one component-owned behavior slice.
Entities: SCN-#### (individual Gherkin scenarios).
Derivation rules (per §5.1):
- SCN derives from ACC, INV, component (CMP), STORY

One artifact per behavior: filename BDD-####-<slug>.md under /<container>/<component>/context/bdd/.

Generator guidance:
- One BDD artifact = one component-scoped behavior collection.
- Each scenario carries a SCN-#### id and its own derives_from pointing at ACC, INV, CMP, or STORY items.
- Write scenarios in Gherkin style: Given / When / Then / And.
- Keep scenarios observable and deterministic — no implementation details.
- bdd is generated only for components whose contract references acceptance criteria that reach this component (via ACC-#### → FR-#### → STORY-#### → CMP-####).
-->

---
artifact_id: BDD-<####>
artifact_type: bdd
tier: context
scope_kind: component
scope_id: <container-slug>.<component-slug>
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Behavioral Scenarios

<!-- One-paragraph statement of the behavior this artifact covers. -->

- **artifact id:** BDD-<####>
- **behavior title:**
- **owning component:** <CMP-####>
- **derives_from:**

## Scenarios

<!-- Each scenario is a SCN-#### item. Add one ### SCN-#### block per scenario. -->

### SCN-0001

- **derives_from:**

```gherkin
Scenario: <title>
  Given <precondition>
  And <additional context>
  When <action>
  Then <expected outcome>
  And <additional observable outcome>
```
