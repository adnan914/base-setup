---
name: nestjs-backend-standards
description: Production backend engineering standards for this NestJS, GraphQL, Supabase, PostgreSQL, and Drizzle repository. Use when Codex adds, changes, reviews, or documents backend APIs, Swagger, resolvers, DTOs, services, guards, database schema, migrations, queries, transactions, configuration, security controls, performance behavior, caching, observability, or tests.
---

# NestJS Backend Standards

Use the existing project shape first. Read nearby controllers, resolvers, DTOs,
services, guards, decorators, schema, filters, interceptors, and tests before
changing backend behavior.

## Workflow

1. Confirm the product capability and avoid creating an endpoint, resolver,
   mutation, table, index, cache, helper, or abstraction unless it has a clear
   need.
2. Reuse established modules, enums, constants, DTOs, response envelopes,
   guards, pipes, filters, logging, Drizzle patterns, and tests before adding
   another style.
3. Keep the smallest coherent change that preserves API, authorization,
   database, observability, and operational contracts.
4. Verify high-risk assumptions with tests, build, lint, migrations, query
   shape, schema inspection, or a focused manual check before finishing.

## Code Contracts

- Use explicit TypeScript types at boundaries: DTOs, service return types,
  request/session context, resolver context, config objects, query inputs, and
  integration clients. Avoid `any`, unsafe casts, and loose object bags unless a
  framework boundary requires them and the typed boundary is restored quickly.
- Use enums for finite domain values such as roles, statuses, token types,
  payment/order states, modes, and event kinds. Extend the enum that owns the
  concept instead of duplicating string literals across modules.
- Do not scatter hardcoded messages, secrets, numeric limits, cache keys,
  feature switches, status labels, route metadata, or repeated business values.
  Put them in constants, enums, validated configuration, or typed helpers with
  clear ownership.
- Keep controllers and resolvers thin. Keep services modular and domain-focused.
  Keep persistence details behind database-oriented services or repositories
  when a module becomes complex.
- Prefer dependency injection, pure helpers, and composition over copy-paste
  code. Add an abstraction only when it centralizes a real policy or removes
  meaningful duplication.
- Follow SOLID principles with judgment: small responsibilities, stable
  contracts, dependency inversion at external boundaries, and patterns that fit
  the codebase rather than decorative indirection.

## REST API Standards

- Keep versioning and API conventions consistent with `API_PREFIX` and the
  existing response/error envelope.
- Document every exposed REST API in Swagger with tag, operation summary,
  auth requirement, body DTO, params, queries, success response schema, status
  code, and relevant error response schemas.
- Match Swagger to runtime behavior: wrapped response shape, arrays, nullable
  fields, validation rules, authorization, throttling, and actual status codes.
- Validate all input at the boundary with DTOs, class validators, parser pipes,
  whitelisting, bounds, and explicit optional/required fields.
- Do not create broad CRUD endpoints automatically. Expose commands and reads
  that the product actually needs, with authorization and audit needs designed
  at the same time.
- Use pagination, filter bounds, upload limits, rate limits, idempotency keys,
  and replay protection wherever an endpoint can be abused or grow unbounded.

## GraphQL Standards

- Keep GraphQL resolvers as adapters over reusable services. Do not duplicate
  REST business logic in resolver methods.
- Add only queries and mutations required by client read models or workflows.
  Prefer explicit command boundaries for high-risk writes such as checkout,
  payment, refunds, stock changes, and webhooks.
- Define safe GraphQL models and input types deliberately. Never expose password
  hashes, refresh token material, internal secrets, or unrestricted database
  rows through schema reflection.
- Enforce authentication, RBAC, and object-level authorization in GraphQL just
  as strictly as REST. Field-level authorization is required for private order,
  address, payment, tenant, and customer data.
- Design nested reads for scale: pagination, dataloaders/batching for relation
  fan-out, query bounds, depth/complexity controls, and response-size awareness.
- Keep resolvers, models, args/input types, guards, and tests colocated with the
  owning feature module when that keeps ownership clear.

## Security

- Treat authentication and authorization separately. Verify object ownership,
  role permissions, tenant boundaries, state transitions, and sensitive field
  visibility for every protected operation.
- Keep secrets in validated configuration only. Never log or return passwords,
  tokens, credentials, service role keys, raw secrets, stack traces, or private
  database details.
- Use parameterized ORM/database APIs. Avoid dynamic SQL made from untrusted
  strings. Validate identifiers, URLs, files, callbacks, and third-party inputs.
- Use least-privilege database and integration credentials, preserve SSL and
  transport security controls, and keep privileged Supabase keys server-only.
- Consider CORS, Helmet, throttling, timeouts, payload sizes, brute force,
  replay, CSRF/cookie behavior if cookies are introduced, injection, SSRF,
  broken object authorization, and dependency risk for every external path.
- Keep auth errors intentionally vague when detail would help an attacker.
  Rotate/revoke session material and refresh tokens with concurrency and replay
  behavior in mind.

## Database

- Model data with clear ownership and normalized relations by default.
  Denormalize only for measured read needs or a documented consistency strategy.
- Protect invariants with schema constraints: primary keys, foreign keys, unique
  constraints, nullability, defaults, enum/check constraints, and intentional
  cascade behavior.
- Add indexes for actual access patterns, uniqueness, joins, ordering, and
  selective filters. Avoid speculative or overlapping indexes that add write
  cost without query value.
- Keep queries bounded. Select only necessary columns where practical, paginate
  collections, avoid N+1 flows, avoid accidental table scans on hot paths, and
  inspect query plans for expensive new data access when scale matters.
- Use transactions for atomic multi-step work: coupled writes, session/token
  rotation, stock/order/payment state transitions, read-modify-write flows,
  outbox events, and any operation whose partial success is unsafe.
- Keep transactions short and avoid network calls inside them. Let failures roll
  back cleanly. For destructive migrations or data rewrites, design rollback,
  forward-fix, backup, or compensating strategy before deployment.
- Treat concurrency as correctness. Prefer constraints, atomic updates,
  idempotency, transaction isolation, conditional updates, or locking strategy
  over race-prone pre-checks alone.

## Performance and Runtime

- Start with performance fundamentals: query count, indexes, bounded payloads,
  serialization cost, hashing cost, external-call count, connection pooling,
  and backpressure.
- Cache only when it helps a stable access pattern. Define cache key ownership,
  TTL, invalidation, authorization scope, stampede behavior, and stale-data
  tolerance before adding it.
- Prefer bounded concurrency, timeouts, retries with backoff only for safe
  operations, circuit/bulkhead thinking for flaky integrations, and streaming
  for large data when appropriate.
- Prevent resource leaks: avoid unbounded in-memory caches, retained request
  objects, accumulating event listeners, orphaned timers, leaked streams,
  unclosed DB clients, and forgotten subscriptions.
- Build for horizontal scale: stateless request handling where possible,
  shared rate-limit/session/cache decisions where needed, and background jobs
  for slow non-request work.

## Observability and Operations

- Use structured logs with request IDs and meaningful context. Do not turn logs
  into a sensitive-data store.
- Add metrics, traces, audit events, and alerts around important failures,
  latency, auth/security events, queues, external integrations, and critical
  business workflows as the product reaches staging/production.
- Make errors actionable for operators while keeping public responses safe.
  Keep readiness/liveness checks meaningful and cheap.
- Treat configuration as code contracts: validate environment variables, choose
  secure defaults, document switches, and keep vendor-specific operations at
  boundaries where portability is a goal.
- Prefer backward-compatible API and migration rollout plans when clients and
  deployments may overlap. Use feature flags or phased rollout when behavior
  cannot change atomically.

## Testing and Delivery

- Write focused unit tests for business decisions and integration/e2e tests for
  important API, auth, database, transaction, and permission boundaries.
- Cover validation, anonymous access, forbidden access, ownership/tenant
  isolation, conflicts, failure paths, and race/idempotency behavior in
  proportion to risk.
- Keep tests isolated from production data. Use explicit test configuration and
  disposable test databases for database-backed e2e suites.
- Review migration safety, rollback/forward-fix plan, query shape, Swagger,
  GraphQL schema surface, config changes, logs, and security impact before
  calling a backend change production-ready.
- Run focused tests plus build and lint after backend changes. State skipped
  verification, residual risk, migrations, and rollout notes in the final
  handoff.
