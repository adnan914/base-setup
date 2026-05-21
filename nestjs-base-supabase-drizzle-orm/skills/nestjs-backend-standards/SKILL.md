---
name: nestjs-backend-standards
description: Production backend engineering standards for this NestJS, Supabase, and Drizzle repository. Use when Codex adds, changes, reviews, or documents backend APIs, DTOs, services, guards, database schema, migrations, queries, transactions, configuration, security controls, performance behavior, or tests.
---

# NestJS Backend Standards

Use the existing project shape first. Read nearby controllers, DTOs, services,
shared helpers, schema, filters, interceptors, and tests before changing backend
behavior.

## Work Flow

1. Confirm the user-facing capability and avoid creating an endpoint, table,
   index, helper, or abstraction unless the capability needs it.
2. Reuse established modules, constants, decorators, DTO patterns, response
   envelopes, guards, pipes, filters, and Drizzle query patterns before adding
   new ones.
3. Make the smallest coherent code and schema change that preserves API,
   authorization, database, and operational contracts.
4. Verify risky assumptions with tests, build, lint, migrations, query shape, or
   focused manual inspection before finishing.

## Code Contracts

- Prefer explicit types, DTOs, return types, inferred Drizzle model types, and
  typed request/session shapes. Avoid `any`, unsafe casts, and loose object
  bags unless a boundary forces them.
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
- Keep controllers thin, services domain-focused, database access bounded, and
  security checks close to the protected operation.

## API Standards

- Document every exposed API in Swagger with tag, operation summary, auth
  requirement, payload DTO, params, queries, success response schema, and
  relevant error response schemas.
- Match Swagger to the real response envelope, status code, validation rules,
  nullable fields, arrays, and authorization behavior. Do not document raw
  service output when an interceptor wraps it.
- Validate all external input at the boundary. Use DTO validators, whitelist
  behavior, parser pipes, and explicit optional/required fields.
- Use consistent success and error contracts. Preserve status-code semantics:
  validation errors, unauthenticated access, forbidden access, missing rows,
  conflicts, throttling, and server faults must stay distinguishable.
- Do not expose passwords, refresh-token hashes, secrets, internal IDs that are
  not part of the contract, stack traces, or sensitive authorization details.
- Add pagination, filtering bounds, rate limits, idempotency handling, or upload
  limits when endpoint behavior can otherwise be abused or grow unbounded.

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
- Keep constants, enums, types, validation, Swagger, error shape, and tests in
  sync with behavior.
- Cover authorization, validation, transaction, race, and failure paths in
  proportion to risk.
- Run focused tests plus build and lint after backend changes. Run migration and
  query verification when schema or data access changes.
- State any residual risk, skipped verification, or migration/rollback note in
  the final answer.
