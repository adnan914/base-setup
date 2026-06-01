# Production Readiness

This repository is structured so each service can be built, deployed, scaled, and rolled back independently.

## What is production-shaped now

- Per-service Dockerfiles and Kubernetes Deployments.
- API Gateway owns REST only; business logic stays in services.
- gRPC is used for sync service communication.
- NATS subjects are centralized for async events.
- Prisma is the only ORM.
- JWT access and refresh token flow is implemented.
- Refresh tokens are hashed at rest.
- RBAC, DTO validation, Helmet, Redis rate limiting, request IDs, metrics, health checks, retries, timeouts, and circuit breakers are present.
- Shared constants, event contracts, and gRPC interfaces live in `libs/contracts`.
- CI verifies Prisma generation, migrations, type checking, tests, and builds.

## Before a real production launch

- Commit a generated `yarn.lock`.
- Replace example secrets with a secret manager.
- Use managed PostgreSQL, Redis, and NATS or hardened clustered deployments.
- Add domain-specific integration tests for checkout, payment, and inventory once those services exist.
- Add OpenTelemetry exporters for distributed traces.
- Add image scanning, SBOM generation, and deployment promotion gates in CI/CD.

## Useful commands

```bash
yarn install
yarn prisma:generate
yarn prisma:migrate
yarn start:dev
```

Docker:

```bash
docker compose up --build
```

Kubernetes:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.example.yaml
kubectl apply -f k8s/migration-job.yaml
kubectl apply -f k8s/user-service
kubectl apply -f k8s/auth-service
kubectl apply -f k8s/api-gateway
```
