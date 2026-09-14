<!--
VibeLoom template: validation-registry
Tier: meta (lives at repo root; not part of the contract stack)
Purpose: declare the project's validation runners — the mechanical tier of the verification ladder. Code-sync traces reference registered runners by `runner_id`.

Schema (per implementation §7):
- runner_id   — stable identifier referenced by traces
- command     — shell command. May reference template variables: ${component}, ${container}, ${owned_paths}
- scope       — workspace | container | component  (where the runner applies)
- inputs      — list of paths / globs / declared sources fed to the runner
- outputs     — what the runner emits: status, logs, artifacts
- description — short prose explaining what the runner checks (optional but recommended)

Standard runner families (suggested ids):
- typecheck         — language-level type validation
- lint              — style + simple-bug static analysis
- unit              — unit tests
- integration       — integration tests
- contract-conformance  — generated contract tests against IF-#### interfaces
- bdd               — generated BDD scenarios pass
- security          — SAST / dependency audit
- smoke             — post-deploy smoke check
- deploy            — deployment dry-run / validation

Generator guidance:
- One registry per project, at the repo root: `validation-registry.md`.
- Add or remove runners over time as the project's tech stack evolves; runners are project-specific.
- Code-sync traces reference runners by id; renaming a runner_id is a breaking change for trace replay.
- Per-runner: pick the simplest command that produces a binary pass/fail outcome. Wrap complex pipelines into shell scripts and reference them.
- Scope determines when the orchestrator invokes the runner (workspace = once per run; container = once per affected container; component = once per affected component).
- Use template variables for component/container scoped runners so the same registry entry serves all matching scopes.
-->

---
artifact_type: validation-registry
tier: meta
timestamp: "<ISO-8601 timestamp>"
---

# Validation registry

Project-level validation runners declared once. Each entry exposes a deterministic command the orchestrator runs against generated artifacts. Belongs to the **mechanical** tier of the verification ladder (see methodology §14.3).

## Runners

```yaml
# typecheck — language-level type validation
- runner_id: typecheck
  command: tsc --noEmit
  scope: workspace
  inputs:
    - src/**
  outputs:
    - status
    - logs
  description: Strict TypeScript typecheck across the workspace.

# lint — style + simple-bug static analysis
- runner_id: lint
  command: eslint src/
  scope: workspace
  inputs:
    - src/**
  outputs:
    - status
    - logs
  description: ESLint with the project's shared config.

# unit — unit tests, per-component
- runner_id: unit
  command: npm test --workspace ${component}
  scope: component
  inputs:
    - owned_paths
  outputs:
    - status
    - logs
  description: Per-component unit tests. ${component} is substituted at invocation.

# integration — integration tests, per-container
- runner_id: integration
  command: npm run test:integration --workspace ${container}
  scope: container
  inputs:
    - owned_paths
  outputs:
    - status
    - logs
  description: Per-container integration tests across components.

# contract-conformance — generated contract tests against declared interfaces
- runner_id: contract-conformance
  command: npm run test:contracts --workspace ${component}
  scope: component
  inputs:
    - owned_interfaces
  outputs:
    - status
    - logs
  description: Verify that the component implements the IF-#### interfaces it declares.

# bdd — generated BDD scenarios pass
- runner_id: bdd
  command: npm run test:bdd --workspace ${component}
  scope: component
  inputs:
    - owned_paths
  outputs:
    - status
    - logs
  description: Run generated Gherkin scenarios for the component.

# security — SAST + dependency audit
- runner_id: security
  command: npm audit --audit-level=high && semgrep --config=auto src/
  scope: workspace
  inputs:
    - src/**
    - package.json
  outputs:
    - status
    - logs
  description: Dependency audit + static analysis security scan.

# smoke — post-deploy smoke check
- runner_id: smoke
  command: npm run smoke --workspace ${container}
  scope: container
  inputs:
    - deployed_url
  outputs:
    - status
    - logs
  description: Hit a small set of endpoints after deploy; confirm 2xx responses.

# deploy — deployment dry-run validation (e.g. terraform plan)
- runner_id: deploy
  command: terraform plan -input=false -out=tfplan
  scope: workspace
  inputs:
    - infra/**
  outputs:
    - status
    - logs
  description: Validate deployment changes before apply.
```

## Notes

- Replace example commands with the project's actual commands during `init` or via `vibeloom generate validation-registry --project-stack`.
- Add project-specific runners as needed (load-test, e2e, accessibility-audit, performance-budget, etc.).
- The orchestrator emits a code-sync trace recording which runners ran and their pass/fail status per scope.
