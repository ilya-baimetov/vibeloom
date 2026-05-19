# VibeLoom

**Contract-driven governance for long-lived AI-coded projects.** VibeLoom generates a tiered stack of specifications (`intent-specs` → `product-specs` ↔ `ux-specs` → `system-specs` → `context` → `code`), keeps every tier aligned with the approved tier above, and detects drift structurally, lifecycle-wise, and semantically as the project evolves. The user keeps approval authority at configurable gates; subagents do the scoped work in parallel waves.

VibeLoom is the reference instantiation of **codæ** — contract-driven agentic engineering. codæ is the paradigm; VibeLoom is one concrete realization of it.

🌐 Website: [**vibeloom.ai**](https://vibeloom.ai) · Methodology: [vibeloom.ai/methodology](https://vibeloom.ai/methodology) · Implementation: [vibeloom.ai/implementation](https://vibeloom.ai/implementation)

## What's in this repo

| Path | Status | Purpose |
| --- | --- | --- |
| [`v03/`](v03/) | **Current spec** (May 2026) | codæ manifesto + VibeLoom v0.3 methodology, implementation, comparison, examples, getting-started, roadmap. Spec-only — engine catches up in a v0.3.x release. |
| [`v02/`](v02/) | **Runnable** | v0.2 methodology, skill, artifact templates, and the deterministic `vibeloom-engine` Python substrate. Use this if you want to actually run the tool today. |
| [`v01/`](v01/) | Archived | Earliest skill-only package; kept runnable but no longer the active methodology. |
| [`site/`](site/) | Active | Public website source for `vibeloom.ai` (Cloudflare Workers static assets). |
| [`vibeloom-dev/`](vibeloom-dev/) | Maintainer skill | Orthogonal Claude/Codex skill for *developing* VibeLoom itself — adversarial canon/skill/site reviews, cross-agent feedback, generation from upstream specs. Operates against any `vNN/` version. **Not** the user-facing VibeLoom skill (that's `vNN/SKILL.md`); shares no command surface or schema. |
| [`file-layout.md`](file-layout.md) | Reference (v04+) | Repo-level layout spec for v04 onward; ground truth for `vibeloom-dev`. v01–v03 are frozen in their own legacy layouts and not covered by this doc. |

> **Two skills in this repo.** The user-facing **VibeLoom** skill (defined per-version in each `vNN/SKILL.md` with its own methodology + implementation + templates) governs user projects through the operations `init / import / generate / eval / review / reconcile / approve / status`. The **`vibeloom-dev`** maintainer skill develops VibeLoom itself — its commands (`init / eval / review / generate <target> / reconcile / feedback <peer> <target>`) operate against any `vNN/` version. The two are orthogonal: separate command surfaces, separate schemas, separate skill manifests.

### v03 — the codæ paradigm + VibeLoom v0.3 spec

Read in this order:

- **[v03/codæ-manifesto.html](v03/codæ-manifesto.html)** — the paradigm. The case, the cognitive-surface argument, the bet, the SDD positioning, the DbC hommage with aspires-toward-decidability framing.
- **[v03/getting-started.md](v03/getting-started.md)** — 30-minute on-ramp. Install, bootstrap a vibe project, generate, ship, upgrade.
- **[v03/vibeloom-methodology.md](v03/vibeloom-methodology.md)** — what VibeLoom is. Five modes, contract stack, 6 status categories, operations, verification ladder, review and reconciliation packets.
- **[v03/vibeloom-implementation.md](v03/vibeloom-implementation.md)** — how it's built. Skill + engine + validation runners. Repo layout, IDs, six trace schemas, task templates, dispatch plan + wave assembly + parallel semantics + subagent task header.
- **[v03/vibeloom-comparison.html](v03/vibeloom-comparison.html)** — methodology comparison. SDD with three flavors (Kiro, Spec Kit, BMAD) vs codæ. Tessl and Pythagora as sidebars.
- **[v03/examples/](v03/examples/)** — five worked examples: greenfield vibe-mode, brownfield import, ux-led design, multi-component reconciliation, parallel dispatch.
- **[v03/roadmap.md](v03/roadmap.md)** — features considered for v04+ (dry-run, contract REPL, contract debugger, contract pattern library, ContractDelta, DDD context maps, compliance mode, trace-derived learning).

### v02 — the runnable substrate

- **[v02/SKILL.md](v02/SKILL.md)** — the skill file Claude Code and Codex load (operation routing, guardrails, response shape)
- **[v02/vibeloom-methodology.md](v02/vibeloom-methodology.md)** — v0.2 methodology
- **[v02/vibeloom-implementation.md](v02/vibeloom-implementation.md)** — v0.2 implementation
- **[v02/references/](v02/references/)** — load-on-demand skill guides
- **[v02/assets/](v02/assets/)** — 17 artifact templates
- **[v02/engine/](v02/engine/)** — deterministic Python engine (`vibeloom-engine` 0.2.0)

## Quick start

```bash
# Clone — no install, no dependencies
git clone https://github.com/ilya-baimetov/vibeloom
cd vibeloom

# Verify the engine runs (Python 3.10+ is the only requirement)
PYTHONPATH=v02/engine python3 -m vibeloom_engine --version
# vibeloom-engine 0.2.0

# Open a project directory in Claude Code or Codex
# The v02/ skill is loaded automatically; run:
/vibeloom init --mode pm     # or vibe | dev | expert
```

The engine is pure Python — no `pip install` needed. The skill invokes it via `python -m` using the path to `v02/engine`.

For the v0.3 first-30-minutes journey (spec-level, engine support pending), see **[v03/getting-started.md](v03/getting-started.md)**.

## What's new in v0.3

- **codæ as the paradigm** — codæ (contract-driven agentic engineering) is the named paradigm; VibeLoom is one instantiation. SDD is the predecessor; codæ pushes SDD into lifecycle governance.
- **Five modes** — `vibe` / `pm` / `dev` / **`ux`** / `expert`. ux mode makes the designer the primary contract author with PM as peer reviewer; mockups can drive product-spec generation directly.
- **Six-tier contract stack** — `intent-specs` → `product-specs` ↔ `ux-specs` → `system-specs` → `context` → `code`. ux-specs is a peer to product-specs (not subordinate).
- **Six status categories** — `current` / `stale` / `uncovered` / `dangling` / `drifted` / `obsolete`. Up from three forms of drift in v0.2.
- **Verification ladder** — three explicit tiers: decidable (structural eval) / mechanical (validation runners) / heuristic (semantic eval). Trajectory is to promote checks upward.
- **Six trace schemas** — `approval`, `code-sync`, `generation`, `eval`, `decision`, `import`. JSONL append-only; full learning-loop substrate. All carry `schema_version`.
- **Cache vs traces split** — `.vibeloom/cache/` (regenerable graph + indices) and `.vibeloom/traces/` (durable JSONL). Approval traces replace approval snapshots.
- **Code-sync as source-map-like evidence** — items ↔ code-paths, no deep code graph.
- **Dispatch plan + wave assembly + parallel semantics + subagent task header** — parallel subagent generation is now buildable, not just gestured at.
- **Item-count cognitive surface metric** — explicit per-tier item budgets; LOC is supporting evidence only.
- **DbC framed honestly** — hommage to Bertrand Meyer, not equivalence; aspires toward decidability via the verification ladder.
- **Dark factory** — framed as a 2-3 year trajectory, not a v0.3 promise.
- **Vibe mode is genuinely minimal** — no graph, no code-sync. Upgrade is a feature.

## Deployment

The public site at `vibeloom.ai` is deployed via Cloudflare Workers' GitHub integration. Pushes to `main` that touch `site/` are deployed automatically — no CI workflow is required.

## License

MIT.
