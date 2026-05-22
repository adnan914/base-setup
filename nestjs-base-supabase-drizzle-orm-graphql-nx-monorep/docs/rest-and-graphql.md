# REST and GraphQL API Guide

This base supports REST and GraphQL through separate NestJS API applications in
the Nx workspace. Keep business logic in backend libraries and let controllers
and resolvers be thin API adapters over those services.

## Current API Split

The storefront API starts with:

- registration, login, refresh, logout, health, and readiness endpoints
- current-customer profile read and update endpoints
- the `me` GraphQL customer read

The admin API starts with:

- login, refresh, logout, health, and readiness endpoints
- admin-protected user create, list, read, update, and delete REST endpoints
- authenticated GraphQL user reads: `me`, `user(id)`, and admin-only `users(...)`
- Swagger documentation when `SWAGGER_ENABLED=true`

The GraphQL `User` type never exposes the password hash. Add product fields to
GraphQL models intentionally instead of returning database rows directly.

## Endpoint and Auth

The GraphQL path is built from `API_PREFIX` and `GRAPHQL_PATH`.

With the example environment:

```text
REST:    /api/v1
GraphQL: /api/v1/graphql
Swagger: /docs
```

Use the same access token for REST and GraphQL:

```text
Authorization: Bearer <access-token>
```

The refresh-token flow stays on REST. Mobile and web clients can use the
storefront auth contract until a future mobile API has a genuinely different
contract.

## Middleware and Guards

GraphQL requests pass through the same Express middleware used by REST:

- Helmet security headers
- CORS allowlist
- request ID middleware
- timeout interceptor
- global PostgreSQL-backed throttling
- global JWT and roles guards

The shared guards convert Nest execution context into a GraphQL HTTP context
before reading `req.user`, `req`, or `res`. This keeps JWT extraction, RBAC, and
rate limiting consistent across controllers and resolvers.

REST success responses keep the existing `success/data/message` envelope.
GraphQL resolver results stay native GraphQL payloads and errors so generated
schema fields are not wrapped in a REST response shape.

## Example GraphQL Queries

Fetch the current user:

```graphql
query Me {
  me {
    id
    email
    firstName
    lastName
    roles
    status
  }
}
```

Admin-only user list:

```graphql
query ActiveUsers($page: Int, $limit: Int) {
  users(page: $page, limit: $limit, active: true) {
    id
    email
    roles
    status
  }
}
```

Variables:

```json
{
  "page": 1,
  "limit": 20
}
```

## Production Controls

Use these environment variables:

| Variable | Production recommendation |
|---|---|
| `GRAPHQL_PATH` | Keep a stable path such as `graphql` |
| `GRAPHQL_GRAPHIQL_ENABLED` | `false` |
| `GRAPHQL_INTROSPECTION_ENABLED` | `false` unless an approved client/tooling workflow needs it |

The code defaults GraphiQL and introspection off when `NODE_ENV=production`
unless they are explicitly enabled.

Before adding broad e-commerce GraphQL queries, also add:

- field-level authorization for private order, payment, address, and customer data
- cursor pagination and query indexes for large catalog and order collections
- dataloaders for nested relations that would otherwise cause N+1 database work
- query depth or complexity controls before exposing deep nested graphs
- operation-level tests for self, admin, anonymous, and cross-user access

## Choosing REST or GraphQL

Prefer REST for:

- auth token lifecycle
- webhooks and third-party callbacks
- file upload workflows
- health/readiness endpoints
- simple commands that map to clear HTTP semantics

Prefer GraphQL for:

- web and mobile screens that need different projections of catalog data
- product detail, category, search result, cart summary, and account views
- combining related read models while avoiding many small client requests

For important writes such as checkout, payment initiation, refunds, stock
adjustments, and webhook processing, keep command boundaries explicit. REST is a
good default until the product contract shows that a GraphQL mutation is better.
