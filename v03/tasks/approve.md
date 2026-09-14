<!--
VibeLoom task template: approve
Operation: approve
Invoked by: SKILL.md when user runs `/vibeloom approve <approval-unit>` (where approval-unit = one contract tier: intent-specs, product-specs, ux-specs, system-specs)
-->

# Task: approve

## Purpose

Advance a reviewed contract approval unit from `draft` to `approved`. Records an approval trace capturing per-item content fingerprints, which becomes the basis for subsequent drift detection.

## Inputs

- `<approval-unit>`: required. One contract tier: `intent-specs | product-specs | ux-specs | system-specs`.
- `--mode` (optional): `user` or `delegated` (engine fills in based on current mode + tier ownership rules).
- Approval-unit artifacts at `draft` status with structural eval clean.
- Current project mode (`vibe | pm | dev | ux | expert`).

## Preconditions

- Approval unit exists.
- All artifacts in the approval unit are `draft` (or already `approved` — in which case approve is a no-op).
- Structural eval passes for full modes. In vibe, compact structural checks pass for the visible artifact being approved.
- All blocking findings from semantic eval are addressed (no `blocking` findings remain in the most recent eval trace).
- For mode-delegated approval: current mode allows delegated approval for this tier (e.g. system-specs in pm mode auto-advances when conditions met).

## Steps

1. Run `eval --target <approval-unit>` to confirm clean.
2. If any blocking finding: abort, surface "approval cannot proceed; address findings first via review."
3. Compute fingerprints:
   - Full modes: per-item content fingerprints (SHA-256 canonical hashes) for every IDed item in the approval unit.
   - Vibe: compact artifact fingerprints for the visible approval surface (`intent.md` for user approval); private scaffolding, if any, is not an approval unit.
4. Compute per-artifact hashes alongside items.
5. Append an `approval` trace entry to .vibeloom/traces/approvals.jsonl with:
   - approval_unit (the tier)
   - approval_mode (user or delegated)
   - items: { item_id: hash } per IDed item in the unit
   - artifacts: { artifact_id: hash } per artifact in the unit
   - run_id, timestamp, author
6. Update each artifact's frontmatter status from `draft` to `approved`.
7. Refresh derived runtime state:
   - Full modes: refresh Contract Graph cache.
   - Vibe: do not expose graph refresh as ceremony; private scaffolding may be refreshed if the engine uses it.

> **Note on auto-advance:** the `approve` task itself does NOT invoke downstream generation. Auto-advance to the next tier is an **orchestrator policy** (see methodology §5, "Delegated auto-advance" in `references/modes.md`). The orchestrator may, after `approve` returns successfully, schedule the next `generate-*` operation if the current mode delegates the downstream tier and conditions hold. Approval and generation remain distinct operations with distinct traces.

## Output

- Each artifact in the approval unit: status updated to `approved`.
- New approval trace entry in .vibeloom/traces/approvals.jsonl.
- Derived runtime state refreshed as appropriate for the mode.

## Postconditions

- The approval unit's lifecycle is set to `approved`.
- An `approval` trace is written carrying per-item content fingerprints (sha256) for every IDed item in the unit.
- `status` is recomputed; downstream items dependent on the newly approved basis are reclassified (typically transitioning to `uncovered` or `stale`).

## Constraints

- Approval is per-tier (the approval unit). Affected artifacts within the tier advance together. Cannot approve a single artifact in isolation.
- Approval requires all-clean structural + zero-blocking-semantic findings. False positives in advisory findings don't block.
- Approval traces are append-only and never regenerated. They are the single source of truth for "what was approved when by whom."
- Auto-advance is bounded by mode rules: e.g. in pm mode, system-specs auto-advances when its eval is clean and no breaking semantic finding is detected. Auto-advance never happens for user-owned tiers.
- Direct edits to `approved` artifacts (outside this task) auto-reopen them to `draft` per lifecycle drift rules.

## Invariants

- Existing approval traces are never modified or deleted (append-only).
- Approval is rejected if structural eval has any blocking finding (engine raises `ApprovalBlocked`).
- The artifact's content hash at approval time matches the `items` map in the written trace.

## Validation

- Pre-approval: structural + semantic eval (run as part of step 1).
- Post-approval: re-run structural eval after status flips, to catch any inconsistency introduced by the approval itself (rare but possible).
- Mechanical runners not invoked at approval time (they run at generate / code-sync time).

## Failure modes

- Blocking findings: abort, surface "review first."
- Hash computation fails (non-deterministic content): surface error; user must address (typically a frontmatter formatting issue).
- Auto-advance trigger fires but the next tier has its own findings: surface findings + halt auto-advance; user resolves.
- Concurrent edit during approval (artifact mtime changes between hash and write): abort with "concurrent edit detected; re-run approve."

<!-- task-template-version: 0.3.0 -->
