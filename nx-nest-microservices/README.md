# Production-Ready NX NestJS E-Commerce Microservices

## NX setup commands

```bash
npx create-nx-workspace@latest nx-nest-microservices --preset=apps --pm=npm
cd nx-nest-microservices
yarn add @nx/nest @nestjs/microservices @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/throttler @nestjs/terminus @prisma/client prisma bcrypt passport passport-jwt class-validator class-transformer helmet ioredis cache-manager cache-manager-redis-yet nats opossum rxjs
nx g @nx/nest:app api-gateway
nx g @nx/nest:app auth-service
nx g @nx/nest:app user-service
nx g @nx/js:lib dto
nx g @nx/js:lib common
nx g @nx/js:lib config
nx g @nx/js:lib database
nx g @nx/js:lib logger
```

This repository contains the generated result rather than only the commands.

## Folder structure

```text
apps/
  api-gateway/
  auth-service/
  user-service/
libs/
  common/
  config/
  database/
  dto/
  logger/
proto/
  auth.proto
  user.proto
docker/
  nginx.conf
k8s/
  api-gateway/
  auth-service/
  user-service/
```

## Run locally

```bash
cp .env.example .env
yarn install
yarn prisma:generate
docker compose up --build
```

The API Gateway exposes REST on `http://localhost:3000` and communicates with Auth/User services over gRPC. NATS subjects prepared for async workflows are `order_created`, `payment_success`, and `send_email`.

## Production notes

See `docs/production-readiness.md` for security, observability, CI, and deployment guidance.
