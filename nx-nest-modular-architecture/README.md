# Production-Ready Nx Monorepo with NestJS Backend Services

Enterprise-grade NestJS backend with JWT authentication, RBAC, and Nx-based split services behind an API gateway.

## 🚀 Features

- ✅ **Modular Monolith Architecture** - Gateway + split backend services
- ✅ **Multi-App Nx Topology** - `api-gateway`, `auth-service`, `user-service`, `academic-service`, `analytics-service`
- ✅ **JWT Authentication** - Access tokens (15min) + Refresh tokens (7 days) with rotation
- ✅ **Role-Based Authorization (RBAC)** - User and Admin roles
- ✅ **TypeORM + PostgreSQL** - Production-safe database configuration
- ✅ **Global Validation** - Automatic DTO validation with class-validator
- ✅ **Security Best Practices** - Password hashing, token rotation, response serialization
- ✅ **Nx Monorepo** - Scalable workspace with enforced module boundaries

## 📁 Project Structure

```text
apps/
  api-gateway/              # External entrypoint for modular split
  auth-service/             # Authentication and RBAC
  user-service/             # User/profile domain
  academic-service/         # Academic hierarchy and content manager
  analytics-service/        # Analytics service

libs/
  auth/
    feature-auth/           # Auth service business logic
  users/
    feature-users/          # User service business logic
  academic/
    feature-content-manager/# Academic service business logic
  analytics/
    feature-analytics/      # Analytics service business logic
  core/
    common/                 # Shared guards, decorators, filters, interceptors
    config/                 # Shared bootstrap and env validation
    contracts/              # Shared route/service contracts
    database/               # Shared TypeORM configuration and entities
```

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Monorepo**: Nx
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: PassportJS + JWT
- **Validation**: class-validator
- **Security**: bcrypt

## 📦 Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

## ⚡ Quick Start

```bash
yarn db:setup
yarn dev

# Split services
yarn dev:auth
yarn dev:user
yarn dev:academic
yarn dev:analytics
yarn dev:gateway

# Or run all modular apps
yarn dev:modular
```

Modular default ports:

- `api-gateway`: `3000`
- `auth-service`: `3001`
- `user-service`: `3002`
- `academic-service`: `3003`
- `analytics-service`: `3004`

Recommended local modular `.env` host setup:

```env
HOST=127.0.0.1
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
ACADEMIC_SERVICE_PORT=3003
ANALYTICS_SERVICE_PORT=3004

AUTH_SERVICE_URL=http://${HOST}:${AUTH_SERVICE_PORT}
USER_SERVICE_URL=http://${HOST}:${USER_SERVICE_PORT}
ACADEMIC_SERVICE_URL=http://${HOST}:${ACADEMIC_SERVICE_PORT}
ANALYTICS_SERVICE_URL=http://${HOST}:${ANALYTICS_SERVICE_PORT}
SES_FROM_EMAIL=no-reply@example.com
AWS_REGION=ap-south-1
```

Do not redefine `HOST` later in the same file. Keep one value only.

## 🔐 API Endpoints

### Authentication

```bash
# Login
POST /api/auth/login
Body: { "email": "contentadmin@example.com", "password": "Admin@123" }
Response: { "accessToken": "...", "refreshToken": "...", "user": {...} }

# Refresh token
POST /api/auth/refresh
Body: { "refreshToken": "..." }
Response: { "accessToken": "...", "refreshToken": "..." }

# Logout
POST /api/auth/logout
Body: { "userId": "...", "token": "..." }
Response: { "message": "Logged out successfully" }
```

### Users (Protected Routes)

```bash
# List users
GET /api/users
Headers: Authorization: Bearer <accessToken>

# Get user by id
GET /api/users/:id
Headers: Authorization: Bearer <accessToken>

# Update user
PATCH /api/users/:id
Headers: Authorization: Bearer <accessToken>
Body: { ...fields to update... }

# Delete user
DELETE /api/users/:id
Headers: Authorization: Bearer <accessToken>
```

### Content Manager

```bash
# Academic tree
GET /api/content-manager/tree
Headers: Authorization: Bearer <accessToken>

# Universities / Degrees / Branches / Syllabus / Semesters / Subjects / Chapters / Topics / MCQs
GET|POST|PATCH|DELETE /api/content-manager/<resource>
Headers: Authorization: Bearer <accessToken>
```

### Analytics

```bash
GET /api/analytics/health
GET /api/analytics/metrics
```

### System

```bash
GET /api/health
GET /api/metrics
GET /api/ready
```

## 🧪 Testing the API

Use the seeded credentials from `yarn db:setup`.

### 1. Test login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"contentadmin@example.com","password":"Admin@123"}'
```

### 2. Test protected route

```bash
# Use the accessToken from login response
curl -X GET http://localhost:3000/api/content-manager/tree \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds of 10
- **JWT Tokens**: Separate secrets for access and refresh tokens
- **Token Rotation**: Refresh tokens are single-use
- **Response Serialization**: Passwords and refresh tokens excluded from responses
- **Input Validation**: All DTOs validated with class-validator
- **Role-Based Access**: Routes protected with @Roles decorator

## 📚 Architecture

### Current Migration State

The repository runs through the split service topology:

- `apps/api-gateway`
- `apps/auth-service`
- `apps/user-service`
- `apps/academic-service`
- `apps/analytics-service`

All services use the same PostgreSQL database and the same shared Nx workspace.

### Gateway Flow

```text
Client
  -> API Gateway :3000
    -> Auth Service :3001
    -> User Service :3002
    -> Academic Service :3003
    -> Analytics Service :3004
```

### Authentication Flow

1. User logs in with email/password
2. Server validates credentials
3. Server generates access token (15min) and refresh token (7 days)
4. Server stores hashed refresh token in database
5. Client receives both tokens
6. Client uses access token for API requests
7. When access token expires, client uses refresh token to get new tokens
8. Refresh token is rotated (old one invalidated)

### Authorization Flow

1. Client sends request with access token
2. JwtAuthGuard validates token
3. JwtStrategy loads user from database
4. User attached to request.user
5. RolesGuard checks if user has required role
6. If authorized, request proceeds to controller

## 📖 Documentation

For detailed documentation, see:

- **[SETUP_AND_COMMANDS.md](../../.gemini/antigravity/brain/4c626767-5fd3-42b9-91f8-0019e4aaa8a5/SETUP_AND_COMMANDS.md)** - Complete setup guide, database instructions, testing, and all Nx commands
- **[DOCUMENTATION.md](../../.gemini/antigravity/brain/4c626767-5fd3-42b9-91f8-0019e4aaa8a5/DOCUMENTATION.md)** - Request lifecycle, authentication internals, architecture breakdown
- **[walkthrough.md](../../.gemini/antigravity/brain/4c626767-5fd3-42b9-91f8-0019e4aaa8a5/walkthrough.md)** - Implementation walkthrough

### Quick Command Reference

```bash
# Database
yarn db:setup                 # Run migrations + seed data
yarn migration:run            # Run migrations only
yarn seed                     # Seed test data

# Development
yarn dev                      # Start api-gateway
yarn dev:gateway             # Start gateway
yarn dev:auth                # Start auth service
yarn dev:user                # Start user service
yarn dev:academic            # Start academic service
yarn dev:analytics           # Start analytics service
yarn dev:modular             # Start all modular services

# Nx Commands
nx serve api-gateway
nx serve auth-service
nx serve user-service
nx serve academic-service
nx serve analytics-service
nx build api-gateway          # Build for production
nx test api-gateway           # Run tests
nx graph                      # View dependency graph
```

## 🚀 Deployment

### Environment Variables

```bash
# Shared production environment variables
DATABASE_HOST=your-production-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-strong-password
DATABASE_NAME=your-db-name
JWT_ACCESS_SECRET=your-256-bit-access-secret
JWT_REFRESH_SECRET=your-256-bit-refresh-secret
NODE_ENV=production
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
ACADEMIC_SERVICE_PORT=3003
ANALYTICS_SERVICE_PORT=3004
```

For modular local/service execution, use the additional service URL variables described in [MODULAR_ARCHITECTURE.md](/home/czm016/projects/abigo_focused/aibigo-focused-backend/MODULAR_ARCHITECTURE.md).

### Build and Run

```bash
# Build for production
nx build api-gateway --prod

# Run production build
NODE_ENV=production node dist/apps/api-gateway/main.js
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/apps/api-gateway ./
EXPOSE 3000
CMD ["node", "main.js"]
```

## 🔧 Development

### Adding a New Service

Use this pattern for every new backend service:

1. Create a thin app under `apps/`
2. Create a service-owned feature lib under `libs/<scope>/feature-*`
3. Keep business logic in the feature lib, not in the app bootstrap
4. Add env keys, gateway routing, health endpoints, and compose wiring

Example target:

```text
apps/notification-service
libs/notifications/feature-notifications
```

#### 1. Create the app shell

Create:

```text
apps/notification-service/
  src/main.ts
  src/app/app.module.ts
  project.json
  webpack.config.js
  tsconfig.app.json
```

Use an existing app as the template:

- [auth-service main.ts](/home/czm016/projects/abigo_focused/aibigo-focused-backend/apps/auth-service/src/main.ts)
- [auth-service app.module.ts](/home/czm016/projects/abigo_focused/aibigo-focused-backend/apps/auth-service/src/app/app.module.ts)

In `main.ts`, wire the shared bootstrap with a service-specific port key:

```ts
await bootstrapHttpApp({
  appModule: AppModule,
  serviceName: 'notification-service',
  title: 'FocusEd Notification Service',
  description: 'FocusEd Notification Service documentation',
  defaultPort: 5005,
  portEnvKey: 'NOTIFICATION_SERVICE_PORT',
});
```

#### 2. Create the feature lib

Create:

```text
libs/notifications/feature-notifications/
  src/lib/notification.module.ts
  src/lib/notification.controller.ts
  src/lib/notification.service.ts
  src/index.ts
  project.json
```

Use a current feature lib as the pattern:

- [feature-auth](/home/czm016/projects/abigo_focused/aibigo-focused-backend/libs/auth/feature-auth)
- [feature-users](/home/czm016/projects/abigo_focused/aibigo-focused-backend/libs/users/feature-users)

Then import the feature module into:

- `apps/notification-service/src/app/app.module.ts`

#### 3. Add TypeScript path mapping

Update [tsconfig.base.json](/home/czm016/projects/abigo_focused/aibigo-focused-backend/tsconfig.base.json):

```json
"@lib/notifications/feature-notifications": [
  "libs/notifications/feature-notifications/src/index.ts"
]
```

#### 4. Tag the app and lib correctly

In the new `project.json` files use:

- app:
  - `type:app`
  - `scope:notifications`
- feature lib:
  - `type:feature`
  - `scope:notifications`

If the scope is new, update [eslint.config.mjs](/home/czm016/projects/abigo_focused/aibigo-focused-backend/eslint.config.mjs) so module-boundary rules know which libs that service may depend on.

#### 5. Add environment variables

Update [`.env.example`](/home/czm016/projects/abigo_focused/aibigo-focused-backend/.env.example):

```env
NOTIFICATION_SERVICE_PORT=5005
NOTIFICATION_SERVICE_URL=http://${HOST}:${NOTIFICATION_SERVICE_PORT}
```

If the gateway will call the service, also update:

- [gateway.routes.ts](/home/czm016/projects/abigo_focused/aibigo-focused-backend/libs/core/contracts/src/lib/gateway.routes.ts)
- [app-config-options.ts](/home/czm016/projects/abigo_focused/aibigo-focused-backend/libs/core/config/src/lib/app-config-options.ts)

#### 6. Add gateway routing if the service is public

Update:

- [gateway.routes.ts](/home/czm016/projects/abigo_focused/aibigo-focused-backend/libs/core/contracts/src/lib/gateway.routes.ts)
- [gateway-proxy.controller.ts](/home/czm016/projects/abigo_focused/aibigo-focused-backend/apps/api-gateway/src/app/proxy/gateway-proxy.controller.ts)
- [gateway-readiness.service.ts](/home/czm016/projects/abigo_focused/aibigo-focused-backend/apps/api-gateway/src/app/gateway-readiness.service.ts)

This is only needed if clients should access the service through `api-gateway`.

#### 7. Add DB ownership only if the service owns tables

If the service owns data:

- add entities under [core/database entities](/home/czm016/projects/abigo_focused/aibigo-focused-backend/libs/core/database/src/lib/entities)
- export them from the entity index
- add migrations in `migrations/`
- import `DatabaseModule` in the app module

If the service does not own DB tables, do not add DB coupling.

#### 8. Add health endpoints

Every service should expose:

- `GET /api/health`
- `GET /api/metrics`
- `GET /api/ready`

Use an existing health controller as template:

- [user-service health.controller.ts](/home/czm016/projects/abigo_focused/aibigo-focused-backend/apps/user-service/src/app/health.controller.ts)

#### 9. Add Docker/compose wiring

Update [docker-compose.yml](/home/czm016/projects/abigo_focused/aibigo-focused-backend/docker-compose.yml):

- add the new service
- set `APP_NAME`
- set the service port
- wire DB env if required
- add gateway URL env if the gateway proxies to it

#### 10. Validate

At minimum run:

```bash
npx tsc -p apps/notification-service/tsconfig.app.json --noEmit
npx eslint apps/notification-service libs/notifications --ext .ts,.js,.mjs
```

### Service Rules

Follow these rules strictly:

1. Keep `apps/*` thin
2. Put business logic in service-owned feature libs
3. Do not import one service's feature lib into another service
4. Keep `libs/core/*` for shared infrastructure only
5. Use HTTP/contracts for service-to-service communication, not direct imports

### Quick Checklist

When adding a new service:

1. Create `apps/<service>`
2. Create `libs/<scope>/feature-<service>`
3. Add TS path alias
4. Add project tags
5. Update ESLint boundary rules if scope is new
6. Wire app module to feature module
7. Add service-specific env vars
8. Add gateway routing if public
9. Add health/metrics/ready endpoints
10. Add compose entry
11. Add migrations/entities only if the service owns DB tables
12. Compile and lint the new app/lib

### Nx Commands

```bash
# Serve application
nx serve api-gateway

# Build application
nx build api-gateway

# Run tests
nx test api-gateway

# Lint
nx lint api-gateway

# View dependency graph
nx graph
```

## 📝 License

MIT

## 👥 Contributing

This is a production-ready template. Feel free to use it as a starting point for your projects.

## 🎯 Next Steps

1. Add database migrations (TypeORM migrations)
2. Add unit and e2e tests
3. Add API documentation (Swagger)
4. Add logging (Winston/Pino)
5. Add monitoring (Prometheus/Grafana)
6. Add rate limiting
7. Add CORS configuration
8. Add helmet for security headers
9. Add compression middleware
10. Set up CI/CD pipeline
