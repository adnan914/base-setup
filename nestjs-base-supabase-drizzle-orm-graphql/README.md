# NestJS Supabase Drizzle Base

Production-oriented NestJS API starter using PostgreSQL, Supabase client access,
Drizzle ORM, JWT authentication, session-based refresh tokens, RBAC, isolated
e2e testing, REST, GraphQL, Docker, and CI checks.

This repository is meant to be a reusable backend foundation. It gives the app
a safer starting point, but product-specific permissions, workflows, monitoring,
and deployment operations still belong to the real product built on top of it.

## Stack

- NestJS 11
- PostgreSQL
- Drizzle ORM and Drizzle Kit migrations
- Supabase JavaScript client
- Nest GraphQL with Apollo
- Passport local and JWT strategies
- `bcryptjs` password hashing
- Nest throttler with shared PostgreSQL storage
- Winston logging
- Jest and Supertest
- Docker Compose for local dev and e2e databases

## Included Features

### API foundation

- Global `api/v1` style prefix from environment config
- DTO validation with whitelist and non-whitelisted field rejection
- Helmet security headers
- CORS allowlist from environment config
- Request IDs returned in responses
- Global exception shape and timeout interceptor
- Health and database readiness endpoints
- Swagger docs controlled by environment config
- REST and GraphQL API adapters over shared feature services

### Authentication and authorization

- Public register and login endpoints
- JWT access tokens and refresh tokens with token type separation
- Refresh tokens stored as hashes in session records
- Per-session refresh-token rotation
- Refresh-token reuse detection and session revocation
- Logout revokes the current session
- Password change revokes all user sessions
- Global JWT guard
- `@Public()` route decorator
- `@Roles()` decorator and roles guard
- Starter user rules:
  - admin-only create/list/delete
  - self-or-admin read/update
  - public registration cannot assign roles

### Data and operations

- Drizzle schema and migrations tracked in `drizzle/`
- Development and test PostgreSQL services in Docker Compose
- E2e tests require a separate `TEST_DATABASE_URL`
- Test DB safety guard requires a database name containing `test`
- Shared `rate_limits` table for throttling across app instances
- CI builds, tests, migrates the test DB, and runs e2e tests

## Project Layout

```text
src/
  config/              validated environment config
  database/            Drizzle schema, DB service, Supabase service, test DB guard
  features/auth/       login, register, JWT strategies, auth sessions
  features/users/      user CRUD starter module
  shared/              guards, decorators, pipes, filters, interceptors, logger
test/                  HTTP e2e tests and test env defaults
drizzle/               SQL migrations and Drizzle metadata
```

## Prerequisites

- Node.js 22 recommended
- npm
- Docker with Docker Compose for local PostgreSQL services
- A Supabase project if using Supabase APIs in development or production

Node 20 can still run the project. The Supabase service includes WebSocket
transport support for runtimes below Node 22.

## Quick Start

1. Install dependencies.

```bash
npm ci
```

2. Create local environment config.

```bash
cp .env.example .env
```

3. Update `.env`.

At minimum replace:

```env
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-service-role-key
```

Do not commit real `.env` files.

4. Start the local development database.

```bash
docker compose up -d db
```

5. Run migrations.

```bash
npm run db:migrate
```

6. Start the API.

```bash
npm run start:dev
```

Default local endpoints:

```text
API root:   http://localhost:3000/api/v1
Health:     http://localhost:3000/api/v1/health
Readiness:  http://localhost:3000/api/v1/ready
Swagger:    http://localhost:3000/docs
GraphQL:    http://localhost:3000/api/v1/graphql
```

Swagger is enabled by default outside production and is exposed when
`SWAGGER_ENABLED=true`. Keep the production value explicit.
GraphiQL is exposed when `GRAPHQL_GRAPHIQL_ENABLED=true`.

See [docs/rest-and-graphql.md](docs/rest-and-graphql.md) for the REST and
GraphQL split, current resolver surface, auth use, and production switches.

## Environment Variables

Use `.env.example` as the source of truth.

### Core app

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | HTTP port |
| `API_PREFIX` | Global API prefix |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `SWAGGER_ENABLED` | Enable or disable Swagger docs |
| `GRAPHQL_PATH` | GraphQL path appended to `API_PREFIX` |
| `GRAPHQL_GRAPHIQL_ENABLED` | Enable or disable the in-browser GraphQL IDE |
| `GRAPHQL_INTROSPECTION_ENABLED` | Enable or disable schema introspection |
| `LOG_LEVEL` | Winston log level |

### Authentication

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | JWT signing secret, minimum 32 characters |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | Access token lifetime |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime |

### Database

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Development or production PostgreSQL URL |
| `TEST_DATABASE_URL` | E2e PostgreSQL URL, database name must contain `test` |
| `DATABASE_SSL` | Enable PostgreSQL SSL |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | SSL certificate validation behavior |
| `DATABASE_POOL_MAX` | PostgreSQL pool size |
| `DATABASE_IDLE_TIMEOUT_MS` | Pool idle timeout |
| `DATABASE_CONNECTION_TIMEOUT_MS` | Connection timeout |

### Supabase

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service role key |

Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend applications.

## Database and Migrations

Generate a migration after schema changes:

```bash
npm run db:generate
```

Apply development or production migrations:

```bash
npm run db:migrate
```

Apply e2e test migrations:

```bash
npm run db:migrate:test
```

Open Drizzle Studio:

```bash
npm run db:studio
```

Seed the local admin user:

```bash
npm run db:seed
```

Review SQL migrations before applying them to production.

The current migration set includes the auth session and shared rate-limit
tables. Auth refresh flows and throttling expect those tables to exist.

## Local Databases

Docker Compose exposes two PostgreSQL services:

| Service | Use | Host URL |
|---|---|---|
| `db` | local development | `localhost:5432/nestjs_app` |
| `db-test` | e2e tests | `localhost:5433/nestjs_app_test` |

Start development DB only:

```bash
docker compose up -d db
```

Start e2e DB only:

```bash
docker compose up -d db-test
```

## Testing and Quality Checks

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Unit tests:

```bash
npm test -- --runInBand
```

E2e tests:

```bash
docker compose up -d db-test
npm run db:migrate:test
npm run test:e2e -- --runInBand
```

The e2e suite truncates auth/user/rate-limit tables around HTTP tests and
refuses non-test DB names through the test DB URL guard.

## CI

The GitHub Actions workflow:

1. Installs dependencies with `npm ci`
2. Builds the app
3. Runs unit tests
4. Starts PostgreSQL for `nestjs_app_test`
5. Applies test migrations
6. Runs HTTP e2e tests

## Docker

The root `Dockerfile` builds a production Node image for the API.

Build it:

```bash
docker build -t nestjs-supabase-drizzle-base .
```

Run it with real environment variables and a reachable PostgreSQL database.
The image does not embed `.env` secrets.

## Production Notes

This starter is designed to stay portable:

- PostgreSQL rather than a proprietary database
- Drizzle migrations committed in git
- Docker-friendly runtime
- environment-variable configuration
- no AWS-only application code

Before deploying a real product:

- store real secrets outside git and outside Docker images
- run migrations as a controlled deploy step
- enable database backups and test restore
- configure HTTPS, domain, reverse proxy, and trusted proxy behavior
- collect logs, metrics, traces, and alerts
- run e2e tests against the isolated test DB
- load test the actual product workflows

## Future Upgrades

### Backend/product upgrades

Add these when the product needs them:

- Email verification
- Forgot-password and reset-password flow
- User session list and revoke-other-sessions endpoint
- Audit log module for sensitive actions
- Organization/tenant model
- Resource-level authorization policies
- File upload/storage module with permission checks
- Background jobs and queues for email/report work
- Idempotency keys for critical write APIs
- Pagination response metadata and query DTOs for larger modules

### Security upgrades

- MFA for higher-risk products
- Password breach/risk policy
- Suspicious login detection
- Security event audit trail
- Sensitive-field encryption where business data requires it
- API security tests for cross-tenant and ownership boundaries

### Vendor-neutral operations upgrades

These can wait until staging or deployment planning:

- OpenTelemetry instrumentation
- Prometheus metrics
- Grafana dashboards
- Loki or another centralized log store
- Error tracking such as Sentry or a self-hosted alternative
- `k6` or Artillery load-test scripts
- Backup/restore runbook
- Secret manager when team/deployment complexity grows

Local `.env` files are acceptable for local development when they are
gitignored. For production, prefer platform-injected environment variables or a
secret manager.

## Current Status

The base is ready to build real product modules on top of it.

The remaining work should be driven by the product:

- define business entities
- define roles, ownership, and tenant boundaries
- implement product workflows
- test each permission boundary
- add operations tooling when staging and production deployment begin
