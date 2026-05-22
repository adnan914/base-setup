---
name: nestjs-backend-standards
description: Production backend engineering standards for NestJS REST or GraphQL repositories using Supabase and Drizzle. Use when Codex adds, changes, reviews, or documents backend controllers, resolvers, APIs, schemas, DTOs, GraphQL inputs/object types, services, guards, database schema, migrations, queries, transactions, configuration, security controls, performance behavior, or tests.
---

# NestJS Backend Standards

Use the existing project shape first. Read nearby controllers or resolvers, DTOs
or GraphQL types, services, shared helpers, schema, filters, interceptors,
plugins, and tests before changing backend behavior.

## Work Flow

1. Confirm the user-facing capability and avoid creating an endpoint, table,
   index, helper, or abstraction unless the capability needs it.
2. Reuse established modules, constants, decorators, DTO or GraphQL type
   patterns, response/error conventions, guards, pipes, filters, plugins, and
   Drizzle query patterns before adding new ones.
3. Make the smallest coherent code and schema change that preserves API,
   authorization, database, and operational contracts.
4. Verify risky assumptions with tests, build, lint, migrations, query shape, or
   focused manual inspection before finishing.

## Code Contracts

- Prefer explicit types, DTOs, GraphQL input/object types, return types, inferred
  Drizzle model types, and typed request/context/session shapes. Avoid `any`,
  unsafe casts, and loose object bags unless a boundary forces them.
- Use enums for finite domain values such as roles, statuses, token types, and
  modes. Extend an existing enum when it owns the concept; do not duplicate
  literal unions across modules.
- Keep user-facing messages, repeated strings, numeric limits, cache keys,
  route metadata, status labels, and configuration values out of scattered
  hardcoded literals. Use shared constants, enums, config, or typed helpers with
  clear ownership.
- Prefer dependency injection and pure reusable helpers over copy-paste logic.
  Add an abstraction only when it removes meaningful duplication or centralizes
  a real policy.
- Keep controllers and resolvers thin, services domain-focused, database access
  bounded, and security checks close to the protected operation.

## API Standards

- For REST APIs, document every exposed API in Swagger with tag, operation
  summary, auth requirement, payload DTO, params, queries, success response
  schema, and relevant error response schemas.
- Match REST Swagger to the real response envelope, status code, validation
  rules, nullable fields, arrays, and authorization behavior. Do not document
  raw service output when an interceptor wraps it.
- For GraphQL APIs, keep schema definitions, resolver names, input types, object
  types, enums, nullability, descriptions where locally used, and error behavior
  aligned with actual service behavior.
- Do not add GraphQL queries, mutations, subscriptions, or REST routes unless
  the product capability requires them.
- Validate all external input at the boundary. Use DTO validators, whitelist
  behavior, parser pipes, GraphQL input validation, and explicit
  optional/required fields.
- Use consistent success and error contracts. Preserve status-code semantics:
  validation errors, unauthenticated access, forbidden access, missing rows,
  conflicts, throttling, and server faults must stay distinguishable.
- Do not expose passwords, refresh-token hashes, secrets, internal IDs that are
  not part of the contract, stack traces, or sensitive authorization details.
- Add pagination, filtering bounds, rate limits, idempotency handling, or upload
  limits when endpoint behavior can otherwise be abused or grow unbounded.

## GraphQL Standards

- Keep GraphQL playground, sandbox, schema exposure, and introspection
  production-safe. Reuse validated env flags and default developer tooling off
  in production unless the deployment intentionally enables it.
- Apply authentication, authorization, ownership checks, validation, throttling,
  timeouts, and logging policy to resolvers as deliberately as to REST
  controllers.
- Protect GraphQL query cost. Consider pagination, maximum result bounds,
  batching/DataLoader patterns, selection-driven overfetching, query
  complexity/depth controls, and subscription lifetime before adding expensive
  nested fields.
- Avoid GraphQL N+1 query paths. Review resolver composition and database access
  when nested relations, lists, or field resolvers are introduced.
- Never expose password hashes, refresh-token hashes, secrets, internal security
  state, or fields outside the public GraphQL contract through object types,
  resolver returns, debug errors, or generated schema.
- Keep GraphQL error formatting intentional. Do not leak stack traces, database
  internals, token verification details, or authorization hints through errors.

## Security

- Enforce authentication and authorization independently. Verify object-level
  access for records a user can read or mutate.
- Keep secrets in validated configuration and never log or return them. Sanitize
  logs for credentials, tokens, personal data, and database internals.
- Use parameterized ORM/database APIs; do not build SQL from untrusted strings.
  Use least-privilege database credentials and preserve SSL or environment
  security controls.
- Hash credentials with the existing hardened approach, rotate/revoke session
  material carefully, and keep authentication failures intentionally vague when
  detail would help an attacker.
- Consider CORS, throttling, timeouts, payload size, replay behavior, and
  injection risks for every externally reachable path.

## Database

- Model data with clear ownership and normalized relations by default. Denormalize
  only for measured read needs or a documented consistency strategy.
- Add database constraints that protect invariants: primary keys, foreign keys,
  unique constraints, nullability, defaults, enum/check constraints, and cascade
  behavior chosen intentionally.
- Create indexes from real access patterns, joins, uniqueness, ordering, and
  selective filters. Avoid speculative or overlapping indexes that increase
  write cost without query value.
- Keep queries bounded. Select only needed columns where practical, paginate
  collections, avoid N+1 query flows, and inspect query plans for expensive new
  paths when data size matters.
- Use transactions for multi-step changes that must succeed atomically, including
  coupled writes, balance/state transitions, session rotation, outbox-style
  handoffs, and read-modify-write flows with consistency risk.
- Let failed transactions roll back cleanly. Keep transactions short, avoid
  network calls inside them, and design migration rollback or compensating
  strategy before destructive schema/data changes.
- Treat concurrency as part of correctness. Prefer constraints, atomic updates,
  transaction isolation, or locking strategy over race-prone pre-checks alone.

## Runtime Quality

- Watch memory and resource lifetime. Avoid unbounded caches, retained request
  objects, accumulating event listeners, orphaned timers, unreleased streams,
  and connection or subscription leaks.
- Prefer bounded concurrency, timeouts, backpressure, pagination, and streaming
  where workload size can grow.
- Optimize after identifying the bottleneck. Protect performance basics first:
  query count, indexes, payload size, hashing cost, serialization work, and
  repeated external calls.
- Keep observability useful: structured logs, request identifiers, actionable
  errors, and metrics or traces around high-value slow/failure paths when the
  project supports them.

## Delivery Checklist

- Keep API surface minimal and reusable.
- Keep constants, enums, types, validation, REST Swagger or GraphQL schema,
  error shape, and tests in sync with behavior.
- Cover authorization, validation, transaction, race, and failure paths in
  proportion to risk.
- Run focused tests plus build and lint after backend changes. Run migration and
  query verification when schema or data access changes.
- State any residual risk, skipped verification, or migration/rollback note in
  the final answer.
