<!--
VibeLoom template: component config
Tier: context (full modes only)
Purpose: scoped agent-facing execution configuration at component scope. Emitted as AGENTS.md and CLAUDE.md inside the component directory, one per assistant.
Not graph-addressable. Regenerated from approved contract when contract changes.

Assistant slug in the `assistant` frontmatter field. One file per assistant.

Generator guidance:
- Include concrete component-specific pointers: component slug, owning container, bounded context, owned paths, owned interfaces, dependencies, test commands for this component.
- Derived from approved contract entities at component scope and above (component spec + container + system + containers + defaults).
- Do not duplicate contract content. Reference item IDs.
- Subagents loading this config also load the component spec itself; do not restate the spec.
-->

---
artifact_id: config.component.<container-slug>.<component-slug>.<assistant>
artifact_type: config
tier: context
scope_kind: component
scope_id: <container-slug>.<component-slug>
container_id: <CONT-####>
component_id: <CMP-####>
bounded_context: <BC-####>
assistant: <assistant>
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Component Config — <component-slug>

<!-- One-paragraph orientation: what this component owns and why it exists as a separate technical boundary. -->

## Governance summary

- **Component:** <CMP-####> (<container-slug>.<component-slug>)
- **Container:** <CONT-####>
- **Bounded context:** <BC-####>

## Owned paths

<!-- From component.md body (source of truth). Summary here for quick access. -->

| path | notes |
|---|---|
| | |

## Owned interfaces

<!-- From component.md IF-#### table. Summary here. -->

| id | name | kind | consumers |
|---|---|---|---|
| IF-0001 | | | |

## Dependencies

<!-- From component.md DEP-#### table. -->

| id | target | kind | notes |
|---|---|---|---|
| DEP-0001 | | | |

## Commands at component scope

<!-- Test commands, build commands, and lint targets scoped to this component's owned paths. -->

## Do-not-touch boundaries

- Do not edit paths or interfaces not owned by this component.
- Do not bury cross-component behavior in local helper code.
- Do not correct semantic drift only in code if the contract is wrong or incomplete — escalate.

## Local caveats

<!-- Project-specific warnings: idempotency, concurrency, specific invariants the implementer must preserve. -->
