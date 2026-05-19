# VibeLoom v2

Contract-driven governance for long-lived AI-coded projects, delivered as two layers: an **agent-side skill** that runs inside Claude Code or Codex, and a **deterministic Python engine** (`vibeloom-engine` 0.2.0) that parses artifacts, builds the context graph, and detects drift via per-item content hashes.

See [vibeloom.ai](https://vibeloom.ai) for the marketing overview, [vibeloom.ai/methodology](https://vibeloom.ai/methodology) for the methodology, and [vibeloom.ai/implementation](https://vibeloom.ai/implementation) for the implementation.

## Directory layout

```text
v02/
├── SKILL.md                      # skill file loaded by Claude Code / Codex
├── vibeloom-methodology.md       # authoritative WHY — tiers, modes, ops, drift, eval
├── vibeloom-implementation.md    # authoritative HOW — metadata, IDs, cache, snapshots
├── references/                   # load-on-demand skill guides
│   ├── operations.md             # per-operation quick reference
│   ├── modes.md                  # vibe | pm | dev | expert
│   ├── runtime.md                # dispatch mechanics, waves, load sets
│   ├── artifacts.md              # frontmatter, stable IDs, derivation rules
│   ├── eval.md                   # semantic-eval dimensions + finding schema
│   └── troubleshooting.md        # failure modes and recovery
├── assets/                       # 17 artifact templates materialized into target repos
│   ├── intent-specs/             # intent, defaults, vibe-intent
│   ├── product-specs/            # prd, usm, dm
│   ├── system-specs/             # system, vibe-system, containers, container, component
│   └── context/                  # pdr, adr, bdd, root / container / component configs
└── engine/                       # deterministic Python substrate
    ├── pyproject.toml            # vibeloom-engine 0.2.0
    ├── vibeloom_engine/          # parser, graph, cache, staleness, eval, cli
    └── tests/                    # 25 tests (parser, graph, eval, cli, staleness)
```

## Install

**Zero-install.** Python 3.10+ is the only requirement — no pip install, no runtime dependencies. The engine is pure Python, including its own minimal YAML-frontmatter parser.

```bash
# Verify from anywhere
PYTHONPATH=/path/to/vibeloom/v02/engine python3 -m vibeloom_engine --version
# vibeloom-engine 0.2.0
```

The skill invokes the engine via `python -m vibeloom_engine` with `PYTHONPATH` pointing at `v02/engine`. No setup beyond cloning the repo.

Optional — if you want the `vibeloom-engine` command on your `PATH` for direct CLI use: `pip install -e engine`.

## Using the skill

Open a project directory in Claude Code or Codex; the skill is picked up automatically from `v02/SKILL.md`. Then:

| Operation | What it does |
| --- | --- |
| `/vibeloom init --mode <vibe\|pm\|dev\|expert> [seed]` | Bootstrap an ungoverned repo |
| `/vibeloom import --mode <mode> [repo]` | Reconstruct a candidate contract from existing code |
| `/vibeloom generate [target]` | Forward-back pass generation of the next affected tier |
| `/vibeloom eval [target]` | Structural + semantic validation against approved upstream |
| `/vibeloom review [target]` | Interactive eval loop with bounded fixes within the target |
| `/vibeloom reconcile [target]` | User-initiated remediation loop for structural, lifecycle, or semantic drift |
| `/vibeloom approve [target]` | Advance a reviewed contract tier from `draft` to `approved` |
| `/vibeloom status [scope]` | Lifecycle, freshness, coverage, affected scope, current mode |

## Engine CLI (for direct deterministic work)

Without install — invoke via `python -m`:

```bash
ENG=/path/to/v02/engine

PYTHONPATH=$ENG python3 -m vibeloom_engine parse --repo <path>          # Parse all artifacts; JSON inventory
PYTHONPATH=$ENG python3 -m vibeloom_engine graph --repo <path>          # Build + persist .vibeloom/state/context-graph.json
PYTHONPATH=$ENG python3 -m vibeloom_engine eval  --repo <path>          # 9 structural checks; non-zero exit on blockers
PYTHONPATH=$ENG python3 -m vibeloom_engine affected --repo <path> --ids FR-0001 STORY-0003
PYTHONPATH=$ENG python3 -m vibeloom_engine staleness --repo <path>      # Per-item hash diff + forward DAG walk
PYTHONPATH=$ENG python3 -m vibeloom_engine detect-edits --repo <path>   # mtime fast-filter + per-item hash confirmation
PYTHONPATH=$ENG python3 -m vibeloom_engine status --repo <path>         # Emit + persist status snapshot
```

(If you installed the engine, use `vibeloom-engine …` directly instead of the `PYTHONPATH=… python3 -m …` prefix.)

See [`engine/README.md`](engine/README.md) for engine internals.

## Key concepts

- **Five-tier contract stack**: `intent-specs` → `product-specs` → `system-specs` → `context` → `code`. Each tier is derived from the approved tier above. Upstream items serve as the eval basis for downstream work.
- **Four modes** (`vibe` / `pm` / `dev` / `expert`): pick where user approval gates sit versus what the agent delegates. Breaking-change detection escalates delegated auto-advance whenever meaning changes.
- **Drift, three forms**:
  - *Structural* — upstream item modified or removed since downstream was synchronized. Detected by staleness computation (per-item hash diff + forward DAG walk).
  - *Lifecycle* — approved artifact edited outside the flow. Detected by filesystem-mtime fast-filter + per-item hash confirmation; auto-reopens to `draft`.
  - *Semantic* — content diverged from upstream meaning even when structure matches. Detected by the agent's semantic eval (4 dimensions: faithful representation, naming consistency, implicit dependencies, capability gaps).
- **Approved-state snapshot**: per-artifact mtime + per-item SHA-256 canonical hash, captured at first sight of an approved artifact and preserved across rebuilds until the artifact transitions to `draft`.
- **Staleness is computed, not stored**: never written into artifact frontmatter. The next pass sees current state and reports truthfully even if a user edits and then reverts.

## Testing the engine

`pytest` is the only dev dependency:

```bash
cd engine
python3 -m venv .venv
.venv/bin/pip install -e '.[dev]'
.venv/bin/pytest
# ... 25 tests pass
```

## Further reading

- [`SKILL.md`](SKILL.md) — the skill file itself
- [`vibeloom-methodology.md`](vibeloom-methodology.md) — WHY
- [`vibeloom-implementation.md`](vibeloom-implementation.md) — HOW
- [`references/eval.md`](references/eval.md) — semantic-eval prompts (what to validate, not how)
- [vibeloom.ai/implementation](https://vibeloom.ai/implementation) — public-facing implementation overview
