# vibeloom v03

**Status:** active development. v0.3 (May 2026).

The next major version of vibeloom — the reference instantiation of **codæ**, the contract-driven agentic engineering paradigm.

## Load the skill

This directory *is* the skill. [`SKILL.md`](SKILL.md) sits at the root here, with its
`references/`, `tasks/`, and `artifacts/` beside it, so a clone is directly loadable:

```bash
git clone https://github.com/ilya-baimetov/vibeloom
# Point Claude Code or Codex at vibeloom/v03/ as a skill source, then:
/vibeloom init --mode vibe     # or pm | dev | ux | expert

# Verify the engine (Python 3.10+ is the only requirement):
PYTHONPATH=v03/engine python3 -m vibeloom_engine --version
# vibeloom-engine 0.3.0
```

Or install the pinned, hash-verified release bundle — same layout, so the same
relative links resolve either way:

```bash
curl -LO https://github.com/ilya-baimetov/vibeloom/releases/download/v0.3.0/vibeloom-v0.3.0.tar.gz
shasum -a 256 -c vibeloom-v0.3.0.tar.gz.sha256
tar xzf vibeloom-v0.3.0.tar.gz
```

See [`SKILL-README.md`](SKILL-README.md) for the full surface inventory and how an
agent traverses it.

Supersedes:

- `../v02/` — v02 (methodology, implementation, competitive analysis, Python engine, skill, references, templates)
- `../site/` — current marketing site at vibeloom.ai (Cloudflare Workers + vanilla HTML/CSS/JS)

## Documents

The four foundational documents:

- [codæ — manifesto](codæ-manifesto.html) — whitepaper introducing codæ, the contract-driven paradigm. The case, the cognitive surface argument, the bet, the SDD positioning, the DbC hommage with aspirational-toward-decidability framing, and the compiler analogy.
- [vibeloom — methodology](vibeloom-methodology.md) — what vibeloom is. Contract stack, modes, principles, status categories, operations, review and reconciliation packets.
- [vibeloom — implementation](vibeloom-implementation.md) — how vibeloom is built. Skill + engine + validation runners. Repo layout, IDs, traces, task templates (markdown structure), validation registry, per-operation pseudocode.
- [vibeloom — comparison](vibeloom-comparison.html) — methodology comparison. SDD with three flavors (Kiro, Spec Kit, BMAD) vs codæ. Tessl and Pythagora as sidebars.

## Getting started

- [getting-started.md](getting-started.md) — the 30-minute on-ramp. Install, bootstrap a vibe project, generate, ship, upgrade. Read this first.

## Templates (G-1: generation-ready spec)

- [vibeloom-templates.md](vibeloom-templates.md) — the canonical source for every template VibeLoom ships. **Edit this file, never the extracted output.** [`extract-templates.py`](extract-templates.py) materializes the 41 blocks into this directory (`SKILL.md`, `subagent-prompt.md`, `references/`, `tasks/`, `artifacts/`); that output *is* committed, because it is the installable surface a clone must contain. `extract-templates.py --check` proves source and committed output have not drifted, and [`check-links.py`](check-links.py) proves every relative link in the surface resolves. Both run as gates in [`build-bundle.sh`](build-bundle.sh). Closes the gap between "spec" and "generation-ready spec":
  - **Artifact templates** — intent, defaults (with Tech Stack section per DDD layer), prd, usm, dm, ux, system, containers, container (with `layer` field + per-layer deployment guidance), component, decision-trace (per `record_type`), bdd, configs, validation-registry
  - **Task templates** — one per operation, following the canonical Design-by-Contract structure: Purpose / Inputs / Preconditions / Steps / Output / Postconditions / Constraints / Invariants / Validation / Failure modes
  - **Skill assets** — `SKILL.md` + `subagent-prompt.md` + `references/` tree (operations, modes, runtime with dispatch plan + wave assembly + subagent task header, eval with verification ladder, artifacts, troubleshooting)
  - See implementation [§17 Templates](vibeloom-implementation.md#17-templates) for the inventory + per-family contracts.

## Roadmap and examples

- [roadmap](roadmap.md) — features and capabilities considered for v04+. Each entry has name + explanation + justification (pain or gain) + with-vs-without example. Includes: toolchain (`generate --dry-run`, contract REPL, contract debugger), cross-project (contract pattern library), new artifacts (ContractDelta, DDD context maps, compliance mode), and trace-derived learning.
- [examples/](examples/) — worked examples:
  - [greenfield-note-search.md](examples/greenfield-note-search.md) — vibe mode, conflict surfacing, upgrade trigger
  - [brownfield-import.md](examples/brownfield-import.md) — existing 50K-LOC codebase, confidence-scored inference, top-down review
  - [ux-led-design.md](examples/ux-led-design.md) — `ux` mode with designer-driven mockups + PM peer review
  - [multi-component-reconciliation.md](examples/multi-component-reconciliation.md) — drift across components, direction-choosing reconcile
  - [parallel-dispatch-multi-component.md](examples/parallel-dispatch-multi-component.md) — three-component parallel regen with explicit dispatch plan + per-task validation

## Site scaffold

- [`site/`](site/) — fresh v0.3 site scaffold. Run `cd v03/site && npx http-server public -p 8127` (or use the launch.json config). The scaffold has the new positioning + slogan + tiny contract trace + when-not-to-use + four-doc cards. It is parallel to the production site at `../site/` and lets you compare before promoting.

## Direction

**Extended** and **hardened** relative to v02:

- codæ is the paradigm; vibeloom is one instantiation (not the whole paradigm).
- Spec-driven development is the predecessor; codæ is SDD pushed into lifecycle governance.
- **Modes**: `vibe` / `pm` / `dev` / `ux` / `expert`. ux mode makes the designer the primary contract author with PM as peer reviewer.
- **Verification ladder** (decidable / mechanical / heuristic) makes "semi-formal verification" concrete and measurable.
- Cache vs traces split; approval traces (JSONL append-only) replace approval snapshots.
- **Trace schemas** (approval, code-sync, generation, eval, decision, import) — full learning-loop substrate.
- Code-sync as source-map-like evidence (no deep code graph).
- **Status categories** (current / stale / uncovered / dangling / drifted / obsolete).
- Operations finally orthogonal: review and reconcile have crisp roles.
- UX-specs as peer to product-specs; mockups as evidence.
- Item-count cognitive surface metric; LOC ratio is illustrative only.
- DbC framed honestly: hommage to Bertrand Meyer, not equivalence; aspires toward decidability via the verification ladder.
- Dark factory framed as 2-3 year trajectory, not v0.3 promise.
- Vibe mode is surface-minimal, not internally absent: minimal user-facing ceremony, but the agent/engine may derive private graph-like structure, cache, and code-sync-like evidence for quality, repair, replay, and upgrade — never as an approval gate. Upgrade is a feature.
- Task templates use markdown structure (Inputs / Steps / Output / Constraints / Validation), not YAML wrappers.
- Per-operation pseudocode in the implementation doc.
- **Dispatch plan + wave-assembly rules + parallel semantics + subagent task header schema** — parallel agent generation is now buildable, not just gestured at.
- Validation-registry pattern for per-project runners.
- Comparison rebuilt: BMAD replaces Tessl as third SDD comparator; Tessl is now sidebar.

## Plan-time trace

Earlier plan files in `~/.claude/plans/` capture the decision history.
