---
name: nx-monorepo-standards
description: Nx monorepo engineering standards for this workspace. Use when Codex adds, changes, reviews, documents, or refactors Nx apps, libraries, project.json targets, nx.json inputs or caching, workspace scripts, project graph dependencies, module boundaries, generators, affected commands, CI task execution, or shared code placement.
---

# Nx Monorepo Standards

Use the existing workspace graph first. Read `nx.json`, relevant `project.json`
files, root scripts, nearby app and library structure, and CI commands before
changing Nx configuration or moving code between projects.

## Work Flow

1. Confirm whether the change belongs to an app, a shared library, root
   workspace configuration, or automation around Nx tasks.
2. Reuse existing project names, tags, targets, script wrappers, TypeScript path
   patterns, and app-to-library dependency conventions before adding new ones.
3. Make the smallest coherent Nx change that keeps the project graph explicit,
   cache behavior understandable, and affected task execution trustworthy.
4. Verify the changed project targets plus dependent app targets when shared
   libraries, root inputs, or CI task behavior changed.

## Workspace Ownership

- Keep deployable entrypoints in `apps/` and reusable code in `libs/`.
- Prefer sharing domain, infrastructure, validation, and utility code through
  libraries instead of app-to-app imports.
- Keep transport-specific app exposure inside the owning app or a clearly owned
  transport module. Do not pull admin controllers into ecommerce apps, or the
  reverse, to reuse service logic.
- Add a new library only when it has a clear owner and removes a real dependency
  or reuse problem. Avoid libraries created only to mirror folder names.
- Preserve project tags and project metadata when they communicate ownership or
  dependency policy. Extend them deliberately when introducing a new boundary.

## Targets And Inputs

- Prefer project targets and root scripts that delegate to Nx so task
  dependencies, caching, and affected execution remain visible.
- Keep target commands scoped to their owning project. If a target needs root
  files, generated artifacts, environment files, migrations, or shared config,
  review target inputs and outputs instead of relying on accidental cache hits.
- Treat `namedInputs`, cache settings, and output paths as correctness
  contracts. Change them when task results depend on new files, not just when a
  cache miss is inconvenient.
- Avoid broad root inputs that invalidate unrelated projects unless the shared
  file truly affects them.
- Keep long-running serve/watch targets separate from build, test, lint,
  migration, and one-shot verification targets.

## Graph And Boundaries

- Keep app-to-library dependencies visible to the Nx graph. Prefer imports and
  project configuration that Nx can understand over hidden shell coupling.
- Check dependents before moving shared files, changing aliases, splitting a
  library, or changing exported APIs.
- Do not bypass boundaries with deep imports into another project's internals
  when a public library entrypoint or a better-owned module is needed.
- Keep generated code and build output out of source ownership unless the
  workspace has an explicit generated-source contract.
- When multiple apps share a library, verify the apps whose runtime contract can
  change, not only the library unit tests.

## Generators And Refactors

- Inspect local conventions before using or adding a generator. Keep generated
  files only when they fit the workspace shape and remove scaffold noise that
  conflicts with local patterns.
- Prefer mechanical moves that preserve imports, tests, and project metadata
  over broad restructures that mix behavior changes with Nx topology changes.
- Update TypeScript paths, project metadata, docs, CI commands, and tests
  together when a project rename or library extraction changes developer
  workflow.
- Review dependency direction after refactors. Shared libraries should not
  quietly become app-specific dependency hubs.

## Verification

- Use focused Nx targets for narrow changes and broaden verification when root
  inputs, shared libraries, or app boundaries changed.
- For this workspace, shared backend changes should keep both `ecommerce-api`
  and `admin-api` buildable.
- When cache configuration is part of the change, run at least one relevant
  target without relying on a previous cache result.
- When affected behavior or CI orchestration changes, inspect the project graph
  assumptions and verify the command shape used by CI or root scripts.
- State skipped target, cache, graph, or CI verification when it matters to the
  change.

## Delivery Checklist

- Keep project ownership and import direction clear.
- Keep Nx targets, named inputs, outputs, cache behavior, root scripts, and CI
  commands aligned with actual task dependencies.
- Keep app surface boundaries intact when shared libraries change.
- Run builds, tests, lint, graph/affected inspection, or uncached target checks
  in proportion to the Nx blast radius.
