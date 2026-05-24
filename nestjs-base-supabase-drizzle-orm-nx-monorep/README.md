# NestJS Supabase Drizzle Base

Production-oriented Nx NestJS API starter using PostgreSQL, Supabase client
access, Drizzle ORM, JWT authentication, session-based refresh tokens, RBAC,
isolated e2e testing, Docker, and CI checks.

This repository is meant to be a reusable backend foundation. It gives the app
a safer starting point, but product-specific permissions, workflows, monitoring,
and deployment operations still belong to the real product built on top of it.

## Stack

- Nx monorepo with separate NestJS ecommerce and admin API apps
- NestJS 11
- PostgreSQL
- Drizzle ORM and Drizzle Kit migrations
- Supabase JavaScript client
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
- Health and database readiness endpoints on each API app
- Separate ecommerce and admin Swagger docs controlled by environment config

### Authentication and authorization

- Ecommerce public register endpoint and app-specific login endpoints
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
apps/
  ecommerce-api/       customer/public NestJS API app shell
  admin-api/           admin/backoffice NestJS API app shell
libs/backend/src/
  config/              validated environment config
  database/            Drizzle schema, DB service, Supabase service, test DB guard
  features/auth/       app auth controllers, shared JWT strategies, auth sessions
  features/users/      admin API starter user CRUD module
  shared/              guards, decorators, pipes, filters, interceptors, logger
test/                  HTTP e2e tests and test env defaults
drizzle/               SQL migrations and Drizzle metadata
```

The ecommerce app imports health/readiness, ecommerce login, session auth
endpoints, and public registration. The admin app imports health/readiness,
admin-only login, session auth endpoints, and the starter users module without
public registration. Keep controllers, DTOs, Swagger models, guards, and roles
separate when a real ecommerce or admin contract needs different exposure.

## API Boundary Contract

| Surface | Owns | Must not expose |
|---|---|---|
| `ecommerce-api` | Public registration, customer login, shared session refresh/logout, customer product modules | Admin user management and backoffice controllers |
| `admin-api` | Admin-only login, shared session refresh/logout, admin/backoffice modules | Public customer registration |

Keep reusable domain logic and database access in `libs/`, but split transport
modules from service modules before sharing them across app surfaces. This is
why auth has app-specific login/registration controllers and users has a
service-only module separate from its admin HTTP controller module.

The repository skills at `skills/nestjs-backend-standards/SKILL.md` and
`skills/nx-monorepo-standards/SKILL.md` capture these REST backend
rules and Nx workspace boundary rules for future changes.

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

6. Start the ecommerce API.

```bash
npm run start:dev
```

Start the admin API in a second terminal when needed:

```bash
npm run start:dev:admin
```

Default local endpoints:

```text
Ecommerce API root:   http://localhost:3000/api/v1
Ecommerce health:     http://localhost:3000/api/v1/health
Ecommerce readiness:  http://localhost:3000/api/v1/ready
Ecommerce Swagger:    http://localhost:3000/docs
Admin API root:       http://localhost:3001/api/v1
Admin health:         http://localhost:3001/api/v1/health
Admin readiness:      http://localhost:3001/api/v1/ready
Admin Swagger:        http://localhost:3001/docs
```

Swagger is exposed by default outside production. Set `SWAGGER_ENABLED=true`
explicitly in production when the docs should be reachable there.

## Environment Variables

Use `.env.example` as the source of truth.

### Core app

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | Shared HTTP port fallback |
| `ECOMMERCE_API_PORT` | Ecommerce API HTTP port |
| `ADMIN_API_PORT` | Admin API HTTP port |
| `API_PREFIX` | Global API prefix |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `SWAGGER_ENABLED` | Enable or disable Swagger docs |
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

Build both API apps:

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

Local e2e tests:

```bash
npm run test:e2e:local
```

`test:e2e:local` starts the Docker Compose `db-test` service, applies test
migrations, and runs the HTTP e2e suite in band. Use `npm run test:e2e` when a
test database is already provisioned by CI or another environment.

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

The root `Dockerfile` builds one production Node image for the shared API
workspace. Its default command starts the ecommerce API.

Build it:

```bash
docker build -t nestjs-supabase-drizzle-base .
```

Run it with real environment variables and a reachable PostgreSQL database.
The image does not embed `.env` secrets.

Use the same image for the admin API by overriding the command:

```bash
docker run --rm nestjs-supabase-drizzle-base npm run start:prod:admin
```

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
