# Adversarial Review the Skill and Helper Prompts

A prompt for Claude Code or an equivalent agentic coding tool. Runs a systematic adversarial review of the VibeLoom skill bundle and helper `.md` prompts, then walks every issue with the user before editing.

The goal is not only coverage. The goal is to make the skill faithful to canon, efficient for agents, cheap to load, hard to misuse, and supported by helper prompts that produce high-quality adversarial reviews instead of procedural noise.

**Time budget.** Audit packet: 1-3 hours. Interactive fixes: 2-4 minutes per issue, longer for schema or command-surface decisions.

---

## Purpose

Audit the skill and prompt surface:

- `v03/vibeloom-templates.md` — canonical fenced blocks for SKILL.md, references, tasks, and artifact templates.
- `v03/templates/` — extracted build artifact, read-only evidence unless the user explicitly asks to repair extraction output.
- `v03/templates/skill/SKILL.md` — extracted entry point, command routing, and manifest.
- `v03/templates/skill/references/*.md` — late-fetch reference docs.
- `v03/templates/tasks/*.md` — task templates.
- `v03/templates/artifacts/**/*.md` — artifact templates.
- Helper prompts: `v03/build-engine.md`, `v03/build-skill.md`, `v03/review-canon.md`, `v03/review-site.md`, `v03/review-skill.md`, and any adjacent helper `.md` prompt that directs agents.

Read canon as source-of-truth evidence:

- `v03/vibeloom-methodology.md`
- `v03/vibeloom-implementation.md`

Produce a prioritized adversarial issue packet. Each issue must explain why it matters, present 2-3 bounded fix options, recommend one option with rationale, and define how the fix will be verified. Then walk the user through every issue before applying edits.

## Preconditions

- `v03/vibeloom-templates.md` exists.
- Inspect `git status --short`; do not require a clean tree, but record unrelated dirty files and avoid reverting them.
- Treat `vibeloom-templates.md` as the edit target for skill-bundle fixes. Treat extracted `v03/templates/` as generated evidence unless the user explicitly asks otherwise.
- Do not commit unless the user explicitly asks.

## Adversarial Review Protocol

Run these passes in order. Do not edit until the issue packet is ready and the user chooses the first issue.

### 1. Coverage and Load Map

Build a compact map of the skill:

- Public commands and their task templates.
- Task templates and their implementation operation source.
- Artifact templates and their implementation frontmatter/schema source.
- Reference docs and which tasks or SKILL sections cite them.
- Helper prompts and what agent behavior they control.
- Approximate loading path for common operations: which docs an agent must read and in what order.

Write or update `skill-review-packet.md` with the map summary. Keep it concise.

### 2. Attack Passes

For each pass, look for concrete findings with file/block evidence.

**A. Canon and implementation alignment**

- SKILL.md routes to a nonexistent task or omits an implemented engine command.
- A task template asserts behavior not specified by methodology or implementation.
- Artifact frontmatter includes extra fields, misses required fields, or uses old names.
- Trace examples or decision records use IDs that do not match implementation.
- Operation names, mode names, status terms, severity terms, or approval terms drift from canon.

**B. Coverage and executable completeness**

- Every public command has a real task path.
- Every implementation operation has a realizing task or an explicit reason it is engine-only.
- Every mode has a coherent path through init, generate/import, review, eval, approve, reconcile, and status as applicable.
- Every artifact tier has a template.
- Every task has concrete verification gates.

**C. Agent efficiency**

- SKILL.md requires loading too much context before the agent can act.
- A reference repeats canon without adding operational value.
- A task template asks the agent to inspect broad files when a narrow reference would do.
- Late-fetch policy is unclear or missing "context insufficient" escape hatches.
- Helper prompts require unnecessary maps, packets, commits, or clean trees for routine review.

**D. Inter-template consistency**

- Same concept has different names across templates.
- Example packets, trace shapes, IDs, or section orders differ without reason.
- Severity/gate vocabulary is inconsistent.
- Parallel templates have different tone or obligations.
- Hidden side effects appear in one task but not the operation model.

**E. Helper prompt quality**

- Helper prompts are stale relative to current v03 engine or template state.
- Helper prompts use brittle line-number references instead of section names.
- Helper prompts assume commits or clean working trees.
- Helper prompts fail to require adversarial issue options and recommendations.
- Helper prompts do not include known failure probes for their domain.

**F. Known v03 failure probes**

Explicitly check these classes even if the broad checklist seems to cover them:

- `approval_mode` vs `approval_unit` in artifact frontmatter.
- Decision trace event ID vs ADR/PDR/UDR/IDR rendered record ID.
- Singular `bounded_context` vs `hosted_bounded_contexts`.
- Missing `task-template-version` trailers.
- Broken relative links in skill references.
- Missing `decisions render` or other implemented engine commands in SKILL.md.
- Pattern-based routing that resolves to nonexistent task files.
- `init`, `approve`, or `review` templates with hidden side effects.
- Stale helper-prompt claims such as "engine v0.4 required" when v03 has an engine.
- Build reports or helper docs that read like current certification after defects are found.

### 3. Finding Quality Bar

Every finding must include:

- `id`: `SKILL-001`, `SKILL-002`, etc.
- `severity`: Critical, High, Medium, or Low.
- `location`: exact file, fenced-block name, or extracted path; include line numbers when practical.
- `issue`: what is wrong.
- `why it matters`: the consequence for agent behavior, generated artifacts, trace replay, validation, or maintainability.
- `fix options`: 2-3 options, each with the tradeoff.
- `recommended fix`: one option and why.
- `verification`: extraction check, link check, schema comparison, command map, or targeted smoke test.
- `canon impact`: whether canon must decide first or the skill can be fixed directly.

Reject vague findings such as "make the prompt shorter" unless the finding identifies the specific duplicated or non-load-bearing content and proposes a replacement direction.

### 4. Priority Rules

Walk findings in this order:

1. Schema, ID, trace, and routing contradictions that can make agents generate wrong artifacts.
2. Missing coverage for public commands, implementation operations, or modes.
3. Hidden side effects and approval/review/eval semantics.
4. Agent-efficiency and helper-prompt bloat.
5. Local clarity and prose polish.

Group repeated schema or vocabulary drift into one finding with all affected templates.

## Interactive Fix Loop

For each issue:

1. Show the issue summary, evidence, options, recommendation, and verification plan.
2. Ask the user to choose **Accept**, **Edit**, **Defer**, or **Reject**.
3. On Accept/Edit, apply only the approved change.
4. If the edit affects the skill bundle, edit `vibeloom-templates.md` first, then re-extract if needed.
5. Record the decision and rationale in `skill-review-report.md`.
6. After every batch of up to five accepted edits, rerun the relevant attack passes and checks.

If a fix depends on a canon decision, pause that finding and route it to `review-canon.md` rather than inventing a skill-local rule.

## Output

- `skill-review-packet.md`: coverage/load map + prioritized adversarial findings.
- Edits to `vibeloom-templates.md` and helper prompts only after user approval.
- `skill-review-report.md`: final disposition, applied changes, deferred items, canon-update flags, and verification results.

## Postconditions

- Every finding in the packet has a recorded disposition.
- Every accepted edit has been applied and verified.
- Extracted templates match `vibeloom-templates.md` after approved skill-bundle edits.
- Helper prompts are current, concise enough for repeated use, and systematic enough to catch known failure classes.

## Constraints

- Agents propose; humans approve.
- Do not auto-apply fixes during packet creation.
- Do not commit unless explicitly requested.
- Canon is read-only during this prompt.
- Do not edit extracted `v03/templates/` as the primary source unless the user explicitly asks.
- Do not invent commands or operations that canon does not sanction.
- Preserve unrelated user changes.

## Validation Gates

- `git status --short` captured before and after.
- `python3 extract-templates.py --check` from `v03/` when available.
- Link check for extracted skill references.
- Command-to-task map has no unresolved task paths.
- Artifact frontmatter and trace examples match implementation sections.
- Helper prompts no longer rely on stale engine assumptions, mandatory commits, or missing known-failure probes.

## Failure Modes

- **Canon and skill disagree.** Surface as canon-impact finding; user decides whether to fix canon first or skill first.
- **Coverage gap needs new template content.** Present options and recommend whether to add now or defer to build-skill.
- **Extraction fails.** Stop skill-bundle edits, report the exact parse or extraction error, and fix the source block before continuing.
- **Prompt bloat grows during fixes.** Prefer replacing repeated workflow with a compact shared protocol section.

## Anti-Patterns

- Treating extraction success as semantic correctness.
- Duplicating canon tables in references without a validation strategy.
- Letting helper prompts become longer while still missing known failure probes.
- Mandatory commits or clean-tree assumptions in collaborative review prompts.
- Vague "review thoroughly" instructions without explicit adversarial passes.
