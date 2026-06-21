---
name: nx-monorepo-standards
description: Nx workspace engineering standards for this NestJS backend monorepo. Use when Codex adds, changes, reviews, or documents Nx apps, libraries, project.json targets, nx.json target defaults or plugins, TypeScript path aliases, project tags or boundaries, build and serve behavior, cache inputs or outputs, workspace scripts, affected execution, or monorepo task verification.
---

# Nx Monorepo Standards

Read the local workspace shape before changing it. Start with `nx.json`,
nearby `project.json` files, root scripts, TypeScript path mappings, and the
apps or libraries that own the behavior being changed.

## Workflow

1. Identify whether the change belongs to an application under `apps/`, a
   reusable library under `libs/`, or shared workspace configuration at the
   root.
2. Reuse the nearest existing project shape, target naming, executor style,
   tags, imports, and scripts before adding a new convention.
3. Keep project graph changes explicit: project ownership, dependencies,
   inputs, outputs, cacheability, and build or serve dependencies must stay
   understandable from Nx configuration.
4. Verify the smallest relevant Nx task first, then broaden verification when
   the change affects shared config, more than one project, or build outputs.

## Workspace Contracts

- Treat applications as deployment entry points and libraries as reusable
  backend capabilities. Do not move domain code into an app just because one app
  consumes it first.
- Preserve the current backend library grouping under `libs/backend/` unless a
  new ownership boundary has a clear reason to live elsewhere.
- Use project names, `sourceRoot`, `projectType`, and tags consistently with
  nearby `project.json` files. Keep tags meaningful enough for future boundary
  rules; do not add decorative tag vocabularies.
- Prefer importing libraries through the root TypeScript aliases and their
  public exports. Update `tsconfig.json`, Jest mappings, exports, and consumers
  together when an alias or library entry point changes.
- Keep generated build artifacts, coverage, caches, and dependencies outside
  source ownership. Do not make projects depend on `dist/`, `.nx/`, or
  `node_modules/` artifacts as source.

## Projects and Targets

- Use `project.json` for project-level behavior and `nx.json` for workspace
  defaults or plugins shared across projects.
- Match existing app targets: this repo builds API apps with the configured
  webpack command, serves them through Nx node execution, and keeps deploy
  pruning targets explicit when they produce dist artifacts.
- Add targets only for repeatable project work. Prefer target defaults for
  shared cache policy and repeated settings when projects truly share the same
  contract.
- Declare target outputs when later targets, CI artifacts, caching, or deploy
  packaging depend on them. Keep `dependsOn` relationships tight enough to
  explain execution order without forcing unrelated projects to run.
- Mark long-running tasks as continuous when Nx needs that knowledge. Do not
  cache watch, serve, or environment-dependent commands unless their behavior
  is actually reproducible.
- Keep root package scripts thin wrappers over Nx when they orchestrate apps or
  libraries. Avoid inventing a second task graph in shell scripts.

## Graph and Boundary Safety

- Inspect affected callers before adding cross-library imports. Prefer moving
  shared code into the library that owns the abstraction over making feature
  libraries reach through each other's internals.
- Avoid deep imports into another project's private folders when an index or
  deliberate public entry point exists.
- Keep dependency direction obvious: shared config and common helpers can
  support feature libraries; applications compose libraries; feature ownership
  should not be blurred to dodge an import problem.
- When project tags or lint boundary rules are introduced or changed, update the
  graph policy and affected imports together. Do not leave tags that promise a
  boundary the toolchain does not enforce or the code immediately violates.

## Caching and Configuration

- Treat cache configuration as a correctness contract. Cache builds, tests, and
  lint only when inputs and outputs describe the work reliably.
- Review environment reads, generated files, lockfile changes, build outputs,
  and external side effects before changing target cache behavior.
- Keep Nx plugin and executor versions aligned with the root dependency set.
  Check migration impact before changing Nx schema, plugin options, or executor
  configuration across projects.
- Prefer root defaults for shared policy and local overrides for real project
  exceptions. Explain an exception through nearby configuration structure
  rather than copy-pasting diverging target blocks everywhere.

## Verification

- For a project-local change, run the focused Nx target such as
  `nx build <project>`, `nx test <project>`, or `nx lint <project>` when that
  target exists.
- For shared workspace config, path alias, project graph, or target-default
  changes, inspect the affected project set and run the relevant build, test,
  and lint tasks across it.
- Check app serving behavior when a change touches `serve`, build
  configurations, ports, runtime entry points, or webpack-backed outputs.
- State skipped Nx verification, cache assumptions, affected projects, and any
  new workspace convention in the final handoff.

## AI Coding Agent Rules

These rules apply to Claude, Codex, and any other coding agent working in this repository.

### Scope control

- Only modify files directly required for the requested task.
- Do not refactor unrelated code or change existing behavior unless explicitly requested.
- Do not touch configuration, infrastructure, database, environment, CI/CD, Docker, or
  deployment files unless the task specifically requires it.
- If a requested change can be completed in one file, modify only that file.

### Implementation discipline

- Write the minimum amount of code necessary.
- Prefer modifying existing code over creating new code.
- Do not create helpers, abstractions, wrappers, utilities, hooks, classes, or files unless
  they are genuinely required.
- Do not add comments, logging, debugging statements, console logs, or print statements
  unless requested.
- Follow existing project patterns, naming conventions, and response contracts.
- Keep backward compatibility whenever possible.

### Change process

- Before editing, identify the exact files that need modification and why each file must
  change.
- After analysis, show the list of files that will be modified.
- Do not edit unrelated files.
- Never delete, rename, or move code unless necessary for the requested task.
- Warn before introducing any breaking change.

### Validation

- Verify no unrelated files were changed.
- Verify no unnecessary code was added.
- Verify existing functionality remains intact.
- Run the narrowest meaningful validation for the change when practical.

---