# Modular Backend Migration

This repository is being split from a single NestJS app into a multi-app Nx modular monolith.

## Current App Topology

Supported service apps:

- `apps/api-gateway`
- `apps/auth-service`
- `apps/user-service`
- `apps/academic-service`
- `apps/analytics-service`

## Service Ownership

- `api-gateway`
  - request forwarding only
  - no domain logic
- `auth-service`
  - auth
  - JWT/token lifecycle
  - roles, permissions, modules
- `user-service`
  - users/profiles domain entrypoints
- `academic-service`
  - content manager and academic hierarchy
- `analytics-service`
  - reserved for analytics/reporting extraction

## Shared Libraries

- `libs/core/common`
- `libs/core/database`
- `libs/core/common`
- `libs/core/database`

The workspace now runs only through the split service topology. Service-specific feature libraries own the implementation.

Current feature-library entrypoints:

- `libs/auth/feature-auth`
- `libs/users/feature-users`
- `libs/academic/feature-content-manager`
- `libs/analytics/feature-analytics`

## Gateway Routes

The gateway forwards these route groups:

- `/api/auth/*` -> `auth-service`
- `/api/users/*` -> `user-service`
- `/api/profiles/*` -> `user-service`
- `/api/content-manager/*` -> `academic-service`
- `/api/analytics/*` -> `analytics-service`

## Run Commands

Individual services:

```bash
yarn dev:gateway
yarn dev:auth
yarn dev:user
yarn dev:academic
yarn dev:analytics
```

All modular apps:

```bash
yarn dev:modular
```

## Environment

Use `.env.example` as the base when running the split services. The important additional variables are:

- `HOST`
- `GATEWAY_PORT`
- `AUTH_SERVICE_PORT`
- `USER_SERVICE_PORT`
- `ACADEMIC_SERVICE_PORT`
- `ANALYTICS_SERVICE_PORT`
- `AUTH_SERVICE_URL`
- `USER_SERVICE_URL`
- `ACADEMIC_SERVICE_URL`
- `ANALYTICS_SERVICE_URL`

For local runs, prefer `HOST=127.0.0.1` and derive service URLs from those port variables.

## Current Status

Implemented:

- service app scaffolding
- service `AppModule` wiring
- gateway proxy module
- modular scripts
- canonical `docker-compose.yml` for the modular stack

Still pending:

- full runtime verification for every `nx serve` target
- route-level parity testing through the gateway

## Smoke Test

Once the services are running in a real local environment, run:

```bash
GATEWAY_URL=http://127.0.0.1:3000 \
LOGIN_EMAIL=contentadmin@example.com \
LOGIN_PASSWORD=your_password \
yarn smoke:modular
```

This checks:

- gateway docs availability
- auth login through the gateway
- academic tree access through the gateway
