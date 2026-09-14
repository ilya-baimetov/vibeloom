<!--
VibeLoom task template: import
Operation: import
Invoked by: SKILL.md when user runs `/vibeloom import --mode <mode>`
-->

# Task: import

## Purpose

Bootstrap from existing code. Produce candidate contract artifacts in `draft` with confidence scores and evidence pointers. Full modes import into the full tiered contract; vibe imports into compact intent/defaults/system and keeps deeper structure private unless the user upgrades.

## Inputs

- `--mode`: required. Target mode for the imported project.
- Existing repo: filesystem under `./` containing source code, tests, configs, mockups, decision docs (any combination).
- Optional `--scan-paths`: limit scan to specified paths.
- Optional `--exclude-paths`: paths to exclude (defaults: `node_modules`, `.git`, `dist`, `build`, common build dirs).

## Preconditions

- Working directory is writable.
- `./intent.md` does NOT exist (or `--force` set with explicit confirmation).
- Existing code surface large enough to make import worthwhile (heuristic: under ~500 LOC, recommend prompt-only generation instead).

## Steps

1. Codebase scan: enumerate languages, frameworks, dependencies, test files, config files.
2. Aggregate evidence: per-language entry points, declared interfaces, dependency graph, observed deployment hints (Dockerfile, package.json scripts, CI configs).
3. Per-tier candidate inference:
   - In vibe: infer compact `intent.md`, `defaults.md`, and flat `system.md`; deeper product/system partitions may be kept as private scaffolding for confidence and upgrade, not as user-reviewed artifacts.
   - In full modes, infer in tier order:
     a. **intent-specs**: infer capabilities (CAP) from observable user-facing functionality, constraints (CST) from configs and dependencies. Tech stack inferred from frameworks → populates Tech Stack section in `defaults.md`.
     b. **product-specs**: infer FRs from API endpoints + user flows; STORYs from observed user journeys; BCs from cohesive code modules.
     c. **ux-specs** (if presentation code present): infer VIEWs from page/route definitions, INTs from event handlers, UXCs from i18n + accessibility configs.
     d. **system-specs**: infer CONT from deployment topology, CMP from cohesive code modules, IF from public API surfaces, DEP from import graph, BEH from test descriptions, `layer` from heuristic (presentation = frontend bundle / static; application = API/server; domain = service workload; infrastructure = IaC).
4. Confidence scoring per candidate (numeric 0–1) and uncertainty list, based on evidence quality (multiple corroborating signals = high; single weak signal = low).
5. Evidence collection per candidate: collect `evidence_refs` (file paths, test paths, config locations) for each candidate item ID. **Do not** add `evidence`/`confidence`/`uncertainty` fields to artifact rows — these live only in the import trace.
6. Draft writing: compact artifacts only in vibe; tier order (intent → product → ux → system) in full modes. Use the standard artifact templates with `derives_from` per the §5.1 derivation rules where public IDs are materialized. Artifact rows stay clean of import-only fields.
7. Emit one `import` trace per invocation carrying both aggregate summary (`evidence_summary`, `candidates_proposed`, `confidence_distribution`) and `per_candidate: {<item_id>: {confidence, evidence_refs, uncertainty}}` — see implementation §8.6 for the schema. Review tooling joins draft items against this map to surface confidence and evidence during top-down approval.
8. Run structural eval appropriate to the mode; surface coverage gaps (uncovered upstream items, dangling references) as findings in full modes and compact-consistency findings in vibe.
9. Surface review packets to the user, top-down (intent first).

## Output

- Draft artifacts at every tier in scope for the target mode (status: `draft`), in the standard artifact-template shape (no import-only fields on rows). In vibe, this means compact artifacts only.
- Trace entry in `.vibeloom/traces/imports.jsonl` with `schema_version: 1.1`, aggregate summary, and `per_candidate` map keyed by allocated item IDs.
- Full modes: `.vibeloom/cache/contract-graph.json` initialized with candidate items + edges. Vibe: optional private scaffolding may be initialized, but no public graph review surface is created.
- Per-tier review packets that join draft items against `per_candidate` so reviewers see confidence and evidence inline.

## Postconditions

- Candidate contract artifacts exist as `draft` in the standard template shape; per-candidate confidence and evidence are queryable from `.vibeloom/traces/imports.jsonl.per_candidate` keyed by item ID.
- One `import` trace written with both aggregate distribution and per-candidate map.
- ID registry initialized; no IDs allocated yet to imported candidates (engine assigns final IDs at approval time).

## Constraints

- Imported items are NOT trusted until reviewed and approved by the user.
- Confidence scoring is an honest metric: agent must NOT inflate confidence to bias approval.
- Evidence pointers MUST cite real source paths (no fabricated references).
- Per-tier order respected: don't surface ux-specs review before intent-specs, etc.
- Layer inference is heuristic; user must confirm `layer` field on each container during review.

## Invariants

- Source code under analysis is read-only; no edits to existing code.
- No contract item produced is `approved` — review and approval remain user-driven, top-down.

## Validation

- Structural eval after each batch (must pass before next batch generates).
- No mechanical runners invoked (existing code already exists; no new code generated yet).
- Heuristic semantic eval per batch surfaces concerns about inference quality (e.g. "FR-0019 has no clear acceptance criterion in observed code").

## Failure modes

- No discoverable code: surface guidance to use `init` instead.
- Mixed-language codebase exceeding agent context: scan in chunks; surface a "scan-only-this-subtree" suggestion.
- Conflicting evidence (e.g. both REST and GraphQL endpoints): emit ambiguity finding; user picks during review.
- Missing test coverage: import proceeds but FRs lacking ACC are flagged as low-confidence.

<!-- task-template-version: 0.3.0 -->
