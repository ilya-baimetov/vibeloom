# Operations Reference

Quick runtime reference for VibeLoom operations. Authoritative semantics live in [`vibeloom-methodology.md ## Operations`](../vibeloom-methodology.md); this file is a load-on-demand condensation for the skill.

`eval` and `generate` are the primitives. `review` is an interactive shell on `eval`; `reconcile` is an interactive shell on `generate`. An approval unit is one contract tier.

---

## `init`

- **Purpose:** Bootstrap an ungoverned repo with a new VibeLoom-governed project.
- **Parameter:** Optional seed — prose artifact (file path or inline text) describing the intended system. When omitted, interactively interview the user for capabilities and constraints.
- **Flags:** `--mode` (`pm` | `dev` | `ux` | `expert` | `vibe`) — required. `--upgrade` — when used with `--mode` (`pm` | `dev` | `ux` | `expert`), promotes a `vibe` repo to the specified full mode.
- **Precondition:** Repo has no existing VibeLoom governance, OR (with `--upgrade`) repo is currently in `vibe` mode.
- **Postcondition:** Mode set. Draft `intent` and `defaults` generated from the seed or interview. With `--upgrade`: full contract stack generated from compact artifacts as `draft`; mode changed to target.
- Bootstrap-only (without `--upgrade`): valid only as the first successful command in an ungoverned repo.

## `import`

- **Purpose:** Bootstrap from existing code by reconstructing candidate contract bottom-up.
- **Parameter:** Optional source repo path. When omitted, imports from the current repo's own code. When provided, reads source code from the specified repo but sets up governance in the current repo.
- **Flags:** `--mode` (`pm` | `dev` | `ux` | `expert` | `vibe`) — required.
- **Precondition:** Current repo has no existing VibeLoom governance; source repo contains existing source code.
- **Postcondition:** Candidate contract artifacts reconstructed in `draft` in the current repo; mode set.
- Review and approval proceed top-down even though reconstruction is bottom-up.
- Bootstrap-only.

## `generate`

- **Purpose:** Generate one or more affected tiers from approved upstream truth using the forward-back pass model. Idempotent; does not inspect existing downstream artifacts for drift.
- **Parameter:** Optional target (`intent-specs` | `product-specs` | `ux-specs` | `system-specs` | `context` | `code`). When omitted, starts at the highest affected tier and follows the normal mode-specific forward path until the next required explicit user stop or completion.
- **Flags:** None.
- **Precondition:** Upstream tier(s) approved. For `intent-specs`, a governed repo must exist (initial creation is handled by `init`).
- **Postcondition:** For contract tiers: target tier artifacts in `draft`; `eval` runs automatically. Blocking findings keep the tier in `draft` until resolved via `review` or out-of-band edits + `eval`. Context and code artifacts generate directly without lifecycle state.
- When target is `code`, `context` is generated implicitly first.
- When target is `context`, generation stops after context.
- In `vibe`: valid targets are `intent-specs` | `system-specs` | `context` | `code`. `product-specs` does not exist.

## `eval`

- **Purpose:** Run structural and semantic validation on a target against its approved upstream basis. For contract tiers, also validates internal consistency within the target tier.
- **Parameter:** Optional target (`intent-specs` | `product-specs` | `ux-specs` | `system-specs` | `context` | `code`). When omitted, evaluates the next target requiring attention in top-down forward order.
- **Precondition:** Target exists.
- **Postcondition:** Structural findings (blocking) and semantic findings (non-blocking) reported. No artifacts modified.
- Runs automatically as part of `generate` and `approve` for contract tiers.
- Target-bounded: validates target against approved upstream truth, never inspects downstream.

## `review`

- **Purpose:** Interactive validation of a target. Interactive shell on `eval` — each cycle runs `eval`, surfaces findings, proposes fixes, applies bounded edits within the target.
- **Parameter:** Optional target. When omitted, reviews the next target requiring attention.
- **Precondition:** For contract targets, the target exists in `draft`; if already `approved`, `review` is findings-only. For `context` and `code`, the target exists.
- **Postcondition:** Findings surfaced; bounded fixes applied within the target.
- Does not propagate downward; that belongs to `reconcile`.
- Exit choices: `Loop`, `Eval only`, `Proceed to approve` (contract draft) or `Accept` (context/code, or already-approved contract).

## `reconcile`

- **Purpose:** Remediation loop for drift in all forms (structural, lifecycle, semantic — see [`../../../vibeloom-methodology.md`](../vibeloom-methodology.md) §15 (drift classification) and §16 (workflow shapes for reconciliation)). Inspects existing downstream artifacts, surfaces conflicts, selectively regenerates after user direction. Interactive shell on `generate`.
- **Parameter:** Optional target scope (`product-specs` | `ux-specs` | `system-specs` | `context` | `code`). When omitted, reconciles from the highest changed tier downward through `code`.
- **Precondition:** At least one drift form is present — approved upstream has changed (structural), an approved artifact was edited outside the flow (lifecycle), or semantic eval surfaced content divergence.
- **Postcondition:** Drift resolved; affected artifacts regenerated via `generate`.
- Always user-initiated. The default forward path is `generate`.
- Two-phase: scoped read-only drift analysis → user direction per case → scoped write-capable reconcile tasks.

## `approve`

- **Purpose:** Advance a reviewed contract approval unit from `draft` to `approved`.
- **Parameter:** Optional approval unit (`intent-specs` | `product-specs` | `ux-specs` | `system-specs`). When omitted, approves the next required approval unit in top-down order whose structural eval passes.
- **Precondition:** Approval unit exists in `draft` and structural `eval` passes (all blocking checks clear).
- **Postcondition:** Status set to `approved`; provenance recorded (`approval_mode: user` or `delegated`, plus timestamp).
- Editing an approved artifact reopens it to `draft` automatically.

## `status`

- **Purpose:** Show current methodology state: lifecycle, downstream freshness, coverage, affected scope, mode.
- **Parameter:** Optional scope filter (`intent-specs` | `product-specs` | `ux-specs` | `system-specs` | `context` | `code` | a specific container or component scope).
- **Postcondition:** Read-only report including:
  - Contract-tier lifecycle (`draft` | `approved` | not yet generated)
  - For `context` and `code`: generated/not yet generated
  - Per-item status across the categories: `current` | `stale` | `uncovered` | `dangling` | `drifted` | `obsolete`
  - Affected tiers and scopes
  - Coverage gaps
  - Current mode
- In full modes, graph-backed. In `vibe`, heuristic approximations from `intent`, compact `system`, root config, and current code.

---

## Operation summary

| Interactive (user-guided) | Formal (automated) | Scope |
|---|---|---|
| `review` — shell on `eval` | `eval` — structural + semantic validation | target artifact or tier |
| `reconcile` — shell on `generate` | `generate` — forward-back-pass production | downstream artifacts |

See [`runtime.md`](runtime.md) for dispatch mechanics and [`modes.md`](modes.md) for mode-specific behavior.
