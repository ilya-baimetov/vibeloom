<!--
VibeLoom template: root config
Tier: context (all modes)
Purpose: scoped agent-facing execution configuration at repo scope. Implements the methodology's `config` artifact; emitted as AGENTS.md and CLAUDE.md (one per assistant) at repo root.
Not graph-addressable. Regenerated from approved contract when contract changes.

Assistant slug in the `assistant` frontmatter field (e.g., `claude`, `codex`). One file per assistant.

Generator guidance:
- Include concrete project-specific pointers: artifact IDs, interface names, owned paths, test commands, cross-scope dependency cues — so subagents can orient without loading the full Contract Graph.
- Derived from approved contract entities owned at root scope and above (none above root, so just root: intent, defaults, prd, usm, dm, ux, system, containers in full modes; compact intent + defaults + system in vibe).
- Do not duplicate contract content. Reference item IDs and artifacts.
- Context artifacts never outrank contract. Config is operational guidance.
-->

---
artifact_id: config.root.<assistant>
artifact_type: config
tier: context
scope_kind: root
scope_id: root
assistant: <assistant>
timestamp: "<ISO-8601 timestamp>"
derives_from: []
---

# Root Config

<!-- One-paragraph orientation: what this repo is, what mode it is in, what you (the assistant) can do here. -->

## Governance summary

- **Mode:** <vibe | pm | dev | ux | expert>
- **Repo scope:** everything under this root
- **Contract sources of truth:** see the artifact list below

## Contract inventory

<!-- Pointers to the governed contract artifacts at root scope. Regenerated from approved contract. -->

| artifact | path | status | notes |
|---|---|---|---|
| intent | `/intent.md` | | |
| defaults | `/defaults.md` | | |
<!-- Full modes also: prd, usm, dm, system, containers. Vibe modes: add flat system only. -->

## Containers

<!-- Full modes only: list container slugs + their root paths. Vibe mode: omit. -->

| container | path | bounded contexts | notes |
|---|---|---|---|
| | | | |

## Repo-wide binding rules

<!-- Summary of defaults.md — every scope must respect these. -->

<!-- Table auto-populated from defaults.md CST-#### items. -->

## Commands at root scope

<!-- Commands the agent typically runs at root: eval root, generate context, approve system-specs, etc. -->

## Do-not-touch boundaries

- Do not infer product semantics from code when approved contract already exists; fix the contract first.
- Do not edit unrelated containers or components from root scope.
- Do not patch context artifacts directly when the fix belongs upstream.

## Local caveats

<!-- Project-specific warnings: approval behavior per mode, reconciliation discipline, etc. -->
