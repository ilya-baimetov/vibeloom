# Modes Reference

Modes control user ownership, delegation, and contract-stack depth. Authoritative semantics live in [`vibeloom-methodology.md ## Modes`](../vibeloom-methodology.md). This file is a load-on-demand condensation.

A mode controls three things:

- which contract tiers the user explicitly co-authors and approves
- which contract tiers are delegated to the agent for auto-advance
- whether the contract stack is full or compact

An approval unit is one contract tier.

---

## Full modes

`pm`, `dev`, `ux`, and `expert` all maintain the full contract stack: `intent-specs` → `product-specs` ⇄ `ux-specs` → `system-specs` → `context` → `code`. They differ in which tier the user owns and which auto-advance.

### `expert`

- **User owns:** all contract tiers (`intent-specs`, `product-specs`, `ux-specs`, `system-specs`).
- **Delegated:** none.
- **Public surface:** `generate`, `review`, `eval`, `reconcile`, `approve`, `status`, each accepting any target tier.
- **Normal stops:** every contract tier pauses for explicit user review and approval.

### `pm`

- **User owns:** `intent-specs`, `product-specs`. Optionally `ux-specs` (peer review of generated ux).
- **Delegated:** `system-specs` auto-advances when safe.
- **Public surface:** same as `expert`.
- **Normal stops:** after `product-specs` generation; `ux-specs` if owned, then `system-specs` auto-advances unless blocking eval findings or a breaking semantic change is detected.

### `dev`

- **User owns:** `intent-specs`, `system-specs`. Optionally `ux-specs`.
- **Delegated:** `product-specs` auto-advances when safe.
- **Public surface:** same as `expert`.
- **Normal stops:** after `system-specs` generation; `product-specs` auto-advances between intent approval and system generation.

### `ux`

Designer-led counterpart to `pm`. The designer drives discovery from intent + mockups; PM peer-reviews the generated product-specs.

- **User owns:** `intent-specs`, `ux-specs`. Optionally `product-specs` (peer review of ux-derived product).
- **Delegated:** `system-specs` auto-advances when safe.
- **Public surface:** same as `expert`, plus the `generate-product-specs-from-ux` task variant.
- **Normal stops:** after `ux-specs` approval; `product-specs` is generated from approved intent + ux evidence and presented to the PM as a peer-review gate; `system-specs` auto-advances when clean.
- **Mockups are first-class input evidence** — they may directly drive product-spec generation. They become normative truth only when their extracted obligations are represented as IDed contract items.

---

## Compact mode

### `vibe`

Simplified ceremony for small or early-stage projects. Visible contract stack collapses to `intent` + `defaults` + flat `system`; the user approves outcomes, not intermediate specs. Graph/cache/code-sync-like machinery may exist internally when useful, but it is not a user-owned approval surface. `status` is a lightweight one-screen "where am I?" report, not the full per-item taxonomy (see implementation §15.6 and `tasks/status.md` vibe branch).

- **Artifacts present:** `intent` (with product summary section), `defaults`, `system` (flat), root `config`, `source`, `tests`, `runtime`.
- **Artifacts absent:** `prd`, `usm`, `dm`, `ux`, `containers`, per-container `container`, per-component `component`, `decision-trace.md`, `bdd`, container/component-scoped config.
- **Tier order:** `intent-specs` → `system-specs` → `context` (root config only) → `code`.
- **User owns:** `intent-specs` only.
- **Delegated:** `system-specs` auto-advances when structural blockers clear.
- **Traces:** vibe still emits cheap provenance traces, especially approvals, generations, and decisions. These preserve repair/debug context and future upgrade migration.
- **Public surface:**
  - `approve intent-specs`
  - `generate code`
  - `reconcile code`
  - `review intent-specs`, `eval intent-specs`
  - `review context`, `eval context`
  - `review code`, `eval code`
  - `status`
- **Normal stops:** only `intent-specs` is a public user stop. Compact `system-specs` never becomes a public approval stop.
- **System-specs handling:** the engine may target `system-specs` internally, but it is not publicly reviewable.

---

## Delegated auto-advance

In `pm`, `dev`, and `ux`, a delegated approval unit auto-advances only when all conditions hold:

1. Structural eval passes (decidable tier of the verification ladder — all blocking checks clear).
2. No breaking semantic change detected against approved truth (heuristic tier).
3. No flagged issue requires human judgment.

If any condition fails, the delegated tier escalates to explicit user review and approval before the run can complete. See [`runtime.md`](runtime.md) for the validation rules and [`eval.md`](eval.md) for the verification ladder.

In `vibe`, compact `system-specs` uses the same safety tests. Structural blockers halt downstream generation; non-blocking advisory findings may allow best-effort continuation with findings surfaced and upgrade recommended when appropriate.

---

## Mode × command matrix (normal flow)

| Step | `vibe` | `pm` | `dev` | `ux` | `expert` |
|---|---|---|---|---|---|
| Bootstrap | `init --mode vibe` | `init --mode pm` | `init --mode dev` | `init --mode ux` | `init --mode expert` |
| Shape intent | `review intent-specs` | `review intent-specs` | `review intent-specs` | `review intent-specs` | `review intent-specs` |
| Approve intent | `approve intent-specs` | `approve intent-specs` | `approve intent-specs` | `approve intent-specs` | `approve intent-specs` |
| Shape ux | — | (optional) | (optional) | `review ux-specs` | `review ux-specs` |
| Approve ux | — | (optional) | (optional) | `approve ux-specs` | `approve ux-specs` |
| Forward to product | — | `generate product-specs` | (automatic) | `generate product-specs --from ux` | `generate product-specs` |
| Approve product | — | `approve product-specs` | (auto or escalated) | (PM peer review) | `approve product-specs` |
| Forward to system | (automatic) | (automatic) | `generate system-specs` | (automatic) | `generate system-specs` |
| Approve system | (automatic) | (auto or escalated) | `approve system-specs` | (auto or escalated) | `approve system-specs` |
| Forward to code | `generate code` | `generate code` | `generate code` | `generate code` | `generate code` |

`(automatic)` = handled by the forward `generate` command via smart orchestration.
`(auto or escalated)` = normally delegated, but escalates if breaking change detected.
`(optional)` = user may opt to own ux-specs in this mode; default is to skip.
`(PM peer review)` = product-specs generated from ux evidence; PM reviews and approves before downstream proceeds.
`—` = tier does not exist in this mode.

---

## Next-command suggestions

After every stop, the skill suggests the next forward command:

| After | `vibe` | `pm` | `dev` | `ux` | `expert` |
|---|---|---|---|---|---|
| approve intent-specs | `generate code` | `generate product-specs` | `generate system-specs` | `generate ux-specs` (or open `ux-specs/mockups/`) | `generate product-specs` |
| approve ux-specs | — | — | — | `generate product-specs --from ux` | `generate product-specs` |
| approve product-specs | — | `generate code` | — | (system auto-advances) | `generate system-specs` |
| approve system-specs | — | — | `generate code` | — | `generate code` |
| explicit `generate context` | — | `generate code` | `generate code` | `generate code` | `generate code` |

---

## Upgrade

`init --upgrade --mode <pm|dev|ux|expert>` promotes a `vibe` repo to a full mode. One-way — no downgrade back to `vibe`. See [`../../../vibeloom-methodology.md ## Vibe-to-Full Upgrade`](../vibeloom-methodology.md). The compact stack expands into the full graph; existing code is import-analyzed against the freshly generated full contract.
