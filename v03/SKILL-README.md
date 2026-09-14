# v03/ — VibeLoom v0.3 skill surface

The installable skill for VibeLoom v0.3. The methodology and implementation docs in this same directory define WHAT VibeLoom is and HOW it's built; the files inventoried below are the concrete surface an agent loads to *generate* a working VibeLoom project from those specs.

Everything in the inventory is generated from `vibeloom-templates.md` by `extract-templates.py`. That file is canonical — edit it, never the extracted output. `python3 extract-templates.py --check` verifies the tree still matches its source.

## Layout

```
v03/
├── SKILL.md                            the manifest Claude Code / Codex loads
├── subagent-prompt.md                  body shape wrapping the subagent task header
├── SKILL-README.md                     (this file)
├── references/                         load-on-demand skill guides
│   ├── artifacts.md                    artifact layout, frontmatter, ID schema, derivation rules
│   ├── eval.md                         verification ladder + heuristic dimensions
│   ├── modes.md                        per-mode behavior (vibe / pm / dev / ux / expert)
│   ├── operations.md                   per-operation quick reference
│   ├── runtime.md                      dispatch plan / wave assembly / parallel semantics
│   └── troubleshooting.md              failure modes + recovery
├── tasks/                              per-operation task templates
│   ├── init.md
│   ├── import.md
│   ├── generate-intent-specs.md
│   ├── generate-product-specs.md
│   ├── generate-product-specs-from-ux.md
│   ├── generate-ux-specs.md
│   ├── generate-system-specs.md
│   ├── generate-context.md
│   ├── generate-code-component.md      leaf subagent task
│   ├── eval.md
│   ├── review.md
│   ├── reconcile.md
│   ├── approve.md
│   └── status.md
├── artifacts/                          per-artifact templates (the contract stack itself)
│   ├── intent-specs/
│   │   ├── intent.md                   full-mode intent
│   │   ├── vibe-intent.md              vibe-mode compact intent
│   │   └── defaults.md                 repo-wide defaults + Tech Stack per DDD layer
│   ├── product-specs/
│   │   ├── prd.md                      OBJ / KR / MET / FR / NFR
│   │   ├── usm.md                      EPIC / FLOW / STORY / ACC / MS
│   │   └── dm.md                       TERM / BC / AGG / ENT / VO / INV
│   ├── ux-specs/
│   │   └── ux.md                       VIEW / INT / UXC / MOCK
│   ├── system-specs/
│   │   ├── system.md                   EXT / TB / SNFR
│   │   ├── vibe-system.md              vibe compact system
│   │   ├── containers.md               CONT inventory
│   │   ├── container.md                per-container; layer field + deployment target
│   │   └── component.md                per-component; layer-aware bounded_context
│   ├── context/
│   │   ├── bdd.md                      SCN per Gherkin scenario
│   │   ├── root-config.md              AGENTS.md / CLAUDE.md at root
│   │   ├── container-config.md         per-container config
│   │   └── component-config.md         per-component config
│   ├── decision-trace.md               single template for IDR / PDR / UDR / ADR / general
│   └── validation-registry.md          project-level meta artifact
├── vibeloom-methodology.md             authoritative: WHAT
├── vibeloom-implementation.md          authoritative: HOW
├── codæ-manifesto.html                 paradigm: WHY
└── engine/                             deterministic Python engine (vibeloom-engine 0.3.0)
```

This layout is deliberately identical to the release bundle's layout, so every relative link in `SKILL.md` resolves the same way whether the skill is loaded from a git clone or from an unpacked `vibeloom-v0.3.0.tar.gz`. One path scheme, both distribution paths.

## How an agent uses this surface

1. **`SKILL.md` loads** automatically when Claude Code or Codex sees `/vibeloom` or `$vibeloom`. It orchestrates everything else.
2. **`references/*.md` load on demand** per operation (e.g. `runtime.md` for `generate`, `eval.md` for `eval` / `review`).
3. **The matching `tasks/*.md` loads** for the invoked operation (one task template per operation).
4. **`artifacts/*.md` are materialized** when generating new artifacts (one artifact template per generated file).
5. **Subagents receive `subagent-prompt.md`** wrapped around their task header from the dispatch plan.

Authoritative sources sit alongside this file at `vibeloom-methodology.md` and `vibeloom-implementation.md`. If a template here disagrees with those specs, the specs win.

## Worked example with real content

For an end-to-end demonstration that the templates produce real, usable artifacts, see [`examples/greenfield-note-search.md`](examples/greenfield-note-search.md). It walks through a full vibe-mode session and an upgrade to pm mode, with embedded `intent.md`, `defaults.md`, `system.md`, `container.md` content showing what the templates materialize into.

## Quality conventions enforced across the surface

- No count words in headings or sentence-leading positions ("Three forms", "Five modes", etc.). Counts change; copy shouldn't bake them in.
- Layer-aware constraints in container.md (`layer` field) and component.md (`bounded_context` empty for non-domain components).
- Tech Stack section in `defaults.md` organized per DDD layer (presentation / application / domain / infrastructure).
- Decision traces classified by `record_type` (IDR / PDR / UDR / ADR / general); single template, materialized per record into `decisions/<record_type>/<RECORD>-<NNNN>-<slug>.md`.
- No `context/decisions/` folder — decisions are anchored in the `decision` trace family (JSONL, append-only) with `load_bearing` flag; per-record markdown renderings under `/decisions/<record_type>/` are derived views (see implementation §8.5.1).
- All trace schemas designed for future graph promotion (a v0.4+ capability).

## Versioning

Templates follow the v0.3 spec exactly. When the methodology or implementation changes (in a v0.3.x or v0.4 release), templates here update in lockstep. The skill's `template_version` field on every dispatched task records which template version was used, for reproducibility.
