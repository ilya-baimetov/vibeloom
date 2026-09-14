<!--
VibeLoom template: container config
Tier: context (full modes only)
Purpose: scoped agent-facing execution configuration at container scope. Emitted as AGENTS.md and CLAUDE.md inside the container directory, one per assistant.
Not graph-addressable. Regenerated from approved contract when contract changes.

Assistant slug in the `assistant` frontmatter field. One file per assistant.

Generator guidance:
- Include concrete container-specific pointers: container slug, resident BCs, component inventory, owned paths, local dependency edges, local constraints, test commands.
- Derived from approved contract entities at container scope and above (container spec + system + containers + defaults).
- Do not duplicate contract content. Reference item IDs and artifacts.
-->

---
artifact_id: config.container.<container-slug>.<assistant>
artifact_type: config
tier: context
scope_kind: container
scope_id: <container-slug>
container_id: <CONT-####>
assistant: <assistant>
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Container Config — <container-slug>

<!-- One-paragraph orientation: what this container owns and why it exists as a separate runtime unit. -->

## Governance summary

- **Container:** <CONT-####> (<container-slug>)
- **Runtime:** <runtime or deployment unit>
- **Resident bounded contexts:** <BC-####, …>

## Component inventory

<!-- Summary of container.md component table. Regenerated from contract. -->

| id | component | bounded_context | owned_paths |
|---|---|---|---|
| CMP-0001 | | | |

## Local dependency edges

<!-- Structured content from container.md. -->

| from | to | kind | notes |
|---|---|---|---|
| | | | |

## Local constraints

<!-- Local NFR/operational constraints specific to this container. -->

| constraint | affects | notes |
|---|---|---|
| | | |

## Commands at container scope

<!-- Common commands: build, test, lint, type-check for this container's stack. -->

## Do-not-touch boundaries

- Do not redistribute responsibilities between components without updating container.md first.
- Bounded contexts do not span containers.
- Do not change neighboring containers from here.

## Local caveats

<!-- Project-specific warnings relevant to this container. -->
