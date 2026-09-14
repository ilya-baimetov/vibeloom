# Troubleshooting Reference

Common failure modes and recovery paths. Load on demand when the normal flow hits an error or ambiguity.

---

## Graph cache missing or corrupt

**Symptom:** `.vibeloom/cache/contract-graph.json` is absent, unreadable, or fails validation.

**Action:** The engine regenerates the cache from ground truth (contract + context artifacts) before proceeding. Do not fail the operation; rebuild and continue.

---

## Direct edit detected on an approved artifact

**Symptom:** An approved contract artifact's content differs from the last-approved form. The engine detects this via a two-tier compare: filesystem mtime mismatch triggers per-item hash comparison against the approval trace.

**Action:** If any item was added, removed, or modified (hash differs), the engine automatically reopens the artifact to `draft` before proceeding. If mtime changed but every item's hash still matches (e.g., whitespace-only or non-semantic frontmatter edit), the artifact stays `approved` and the recorded mtime is updated. Users do not manually maintain `status` for this transition. Confirmation is required only for the semantic decisions that follow, not for the lifecycle bookkeeping itself.

---

## Breaking semantic change during delegated auto-advance

**Symptom:** In `pm` or `dev`, a delegated tier's eval detects a breaking change (see [`vibeloom-methodology.md ## Generation ### Breaking-Change Detection`](../vibeloom-methodology.md) for the classification table).

**Action:** Escalate. Explicit user review and approval of that tier become required before the run can complete. Surface the breaking signal with item IDs, both approved and draft statements, and the conflict description.

In `vibe`, compact `system-specs` uses the same safety tests. Structural blockers halt downstream generation. Non-blocking advisory findings may still allow best-effort continuation with findings surfaced and upgrade recommended when appropriate.

---

## Partial wave failure

**Symptom:** Some subagents in a wave succeed, some fail (e.g., validation errors, late-fetch exceeded).

**Action:**

- Accept successful task results into operation-local accepted state.
- Retire failed tasks from the active plan.
- If failing outputs can be localized, reopen only affected tasks in a follow-up wave (the next recomputed ready set).
- If the failure is cross-cutting or ownership-ambiguous, surface findings to the user and stop rather than guess.

Unaffected accepted task results stay active across retries.

---

## Late-fetch exceeded

**Symptom:** A subagent's re-invocation result summary still requests missing slices after the first approved late-fetch.

**Action:** The orchestrator treats this as a finding and exits the task. Surface the unresolved need in the operation's final report. User then decides: amend upstream contract, widen scope manually, or accept the partial result.

Cap: **one late-fetch re-invocation per task**, no exceptions.

---

## Approval unit blocked

**Symptom:** `approve <target>` fails because structural `eval` has blocking findings.

**Action:** Do not promote to `approved`. Report the blocking findings with item references. User fixes via `review <target>` (bounded fixes) or out-of-band edits + re-run `eval`. Approval becomes available only when all blocking checks clear.

---

## Ambiguous import reconstruction (vibe)

**Symptom:** During `import --mode vibe`, the flat system inventory cannot be safely partitioned into components (inventory is too ambiguous).

**Action:** Fall back to single-agent execution for downstream generation. Surface the ambiguity as findings and recommend `review intent-specs` or upgrade to a full mode when the project has grown enough to warrant it.

---

## Conflicting drift choices during reconcile

**Symptom:** During `reconcile`, two drift cases propose incompatible fix directions (e.g., one amends upstream truth, another preserves upstream and corrects downstream).

**Action:** Surface the conflict before fixes are applied. User must resolve the conflict before the reconcile wave proceeds.

---

## Subagent wrote outside its declared write set

**Symptom:** Post-wave validation reveals a file written by a subagent that is not in its `allowed_writes`.

**Action:** Reject the task's writes. Do not accept the result. Treat as a failed task: if the failure can be localized, reopen in a follow-up wave; if cross-cutting, surface findings and stop.

---

## Broad reread needed

**Symptom:** Cross-scope validation is tempting to resolve by rereading an entire scope or wave.

**Action:** Do not silently expand context. Surface findings to the user and stop. Broad rereads are not part of normal execution — they signal either a validation-rule gap or genuine ambiguity that needs user judgment.

---

## Upstream not approved

**Symptom:** `generate <target>` or `approve <target>` runs but an upstream tier is still in `draft`.

**Action:**

- If the upstream tier is **delegated** in the current mode: auto-advance it (eval → approve if safe) and continue.
- If the upstream tier is a **user stop** in the current mode: halt and surface the need for explicit user review and approval before continuing.

See [`modes.md`](modes.md) for per-mode auto-advance behavior.

---

## Bootstrap already succeeded

**Symptom:** `init` or `import` invoked on a repo that already has VibeLoom governance.

**Action:** Return an error with guidance: "Bootstrap already succeeded; use `generate` or `status` to continue." Exception: `init --upgrade --mode <pm|dev|expert>` is valid only when the current mode is `vibe`.

---

## Downgrade attempt

**Symptom:** `init --upgrade --mode vibe` or any attempt to move from `pm`/`dev`/`expert` back to `vibe`.

**Action:** Reject with explanation. The vibe → full transition is one-way.
