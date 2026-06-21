---
name: code-iqra-backend-standards
description: >
  Enforces Code Iqra Backend Best Practices and Standards for NestJS 11, Nx monorepo, PostgreSQL,
  Drizzle ORM, GraphQL (Apollo), JWT auth, and related tooling. Use this skill whenever writing,
  reviewing, or scaffolding any backend code — including modules, controllers, resolvers, services,
  guards, DTOs, Drizzle schema, migrations, queries, transactions, tests, or Nx configuration.
  Always consult this skill before generating any NestJS module, endpoint, resolver, DTO, guard,
  service, database query, or migration. Trigger on: create a module, add an endpoint, write a
  resolver, define a DTO, add a guard, write a Drizzle query, create a migration, write a service,
  set up auth, add a test, or any NestJS / backend code task in a Code Iqra project.
---

# Code Iqra Backend Best Practices & Standards

This skill enforces coding standards, architectural conventions, and design practices for Code Iqra's backend applications built with **NestJS 11**, **Nx 22 monorepo**, **PostgreSQL**, and **Drizzle ORM**.

---

## ⚙️ Technology Stack

| Category | Technology |
|---|---|
| Framework | NestJS 11 |
| Monorepo | Nx 22 |
| Language | TypeScript (strict) |
| Runtime | Node.js 22 |
| Database | PostgreSQL 15 (Drizzle ORM) |
| GraphQL | Apollo Server 5, @nestjs/graphql |
| Auth | Passport (JWT + Local), bcryptjs |
| Validation | class-validator, class-transformer |
| Logging | Winston |
| Testing | Jest, Supertest |
| Dev Tools | ESLint, Prettier |

---

## 🧩 Project Structure

```
apps/
  storefront-api/     # customer-facing API (port 3000)
  admin-api/          # privileged admin API (port 3001)
libs/backend/
  auth/               # JWT/session services + storefront/admin modules
  users/              # user service + storefront/admin modules
  database/           # Drizzle schema, DB service, Supabase service
  common/             # config, guards, pipes, filters, logger
drizzle/              # committed SQL migrations
test/                 # HTTP e2e tests
```

---

## 🧠 General Principles

- Read existing controllers, resolvers, DTOs, services, guards, schema, and tests **before** changing behavior
- Reuse established patterns, enums, constants, response envelopes, and Drizzle query styles
- Keep the smallest coherent change that preserves API, auth, database, and operational contracts
- Controllers and resolvers stay **thin** — business logic lives in services
- Services stay **domain-focused** — persistence details stay behind the database service

---

## AI Coding Agent Rules

These rules apply to Claude, Codex, and any other coding agent working in this repository.

### Scope control

- Only modify files directly required for the requested task.
- Do not refactor unrelated code or change existing behavior unless explicitly requested.
- Do not touch configuration, infrastructure, database, environment, CI/CD, Docker, or
  deployment files unless the task specifically requires it.
- If a requested change can be completed in one file, modify only that file.

### Implementation discipline

- Write the minimum amount of code necessary.
- Prefer modifying existing code over creating new code.
- Do not create helpers, abstractions, wrappers, utilities, hooks, classes, or files unless
  they are genuinely required.
- Do not add comments, logging, debugging statements, console logs, or print statements
  unless requested.
- Follow existing project patterns, naming conventions, and response contracts.
- Keep backward compatibility whenever possible.

### Change process

- Before editing, identify the exact files that need modification and why each file must
  change.
- After analysis, show the list of files that will be modified.
- Do not edit unrelated files.
- Never delete, rename, or move code unless necessary for the requested task.
- Warn before introducing any breaking change.

### Freedom to solve

- These rules guide HOW to write code, not WHETHER to write it.
- Always provide a working solution. Never refuse a task because of these guidelines.
- When in doubt, implement the solution following existing patterns.

### Validation

- Verify no unrelated files were changed.
- Verify no unnecessary code was added.
- Verify existing functionality remains intact.
- Run the narrowest meaningful validation for the change when practical.

---

## ✍️ Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Files/Folders | kebab-case | `auth-session.service.ts` |
| Classes | PascalCase | `AuthSessionService` |
| Methods/Variables | lowerCamelCase | `findByRefreshTokenId()` |
| Constants | UPPERCASE | `const MAX_LOGIN_ATTEMPTS = 5` |
| Enums | PascalCase members | `UserRole.Admin` |
| DTOs | PascalCase + suffix | `CreateUserDto`, `LoginResponseDto` |
| GraphQL types | PascalCase | `UserType`, `LoginInput` |

---

## 🏗️ Module Pattern

Every feature follows this NestJS module structure:

```
libs/backend/<feature>/
  src/
    <feature>.service.ts          # shared domain service
    <feature>.module.ts           # shared providers
    storefront/
      storefront-<feature>.module.ts    # storefront-specific imports/exports
      storefront-<feature>.controller.ts
      storefront-<feature>.resolver.ts
    admin/
      admin-<feature>.module.ts
      admin-<feature>.controller.ts
      admin-<feature>.resolver.ts
    dto/
      create-<feature>.dto.ts
      update-<feature>.dto.ts
    types/
      <feature>.type.ts           # GraphQL ObjectType
```

Shared service → imported by both storefront and admin modules. Endpoints exposed **only** where appropriate to each audience.

---

## 📋 REST Controller Pattern

```ts
@ApiTags('users')
@Controller('users')
export class StorefrontUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Messages(MESSAGES.DATA_FOUND)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'Current user profile returned.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token missing or invalid.', type: ApiErrorResponseDto })
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.usersService.findById(user.sub);
  }

  @Get()
  @Messages(MESSAGES.DATA_FOUND)
  @ApiOperation({ summary: 'List all users' })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'User list returned.',
    type: UserResponseDto,
    isArray: true,
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
}
```

- `@Messages(MESSAGES.<KEY>)` is **required on every route handler** — sets the success message picked up by the response interceptor. Use constants from `@/shared/constants`, never inline strings.
- `@ApiEnvelopeResponse` **replaces** `@ApiOkResponse` / `@ApiCreatedResponse` — wraps the Swagger schema in the standard envelope shape (`{ data, message, success }`). Always provide `status`, `description`, and `type`.
- Use `isArray: true` on `@ApiEnvelopeResponse` when the endpoint returns an array.
- Both imported from `@/shared/decorators/` — always import together.
- Every endpoint also gets `@ApiTags`, `@ApiOperation`, and error response decorators (`@ApiBadRequestResponse`, `@ApiUnauthorizedResponse`, etc.)
- Swagger must match runtime: response shape, status codes, auth requirement, throttling
- Use `@Public()` only on routes that genuinely need no auth
- Validate all input at the boundary — never trust raw request data inside services

---

## 🔷 DTO Pattern

```ts
// create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}
```

- All DTOs use `class-validator` decorators — global pipe enforces `whitelist: true, forbidNonWhitelisted: true`
- All public DTO fields get `@ApiProperty()` — keep Swagger in sync with runtime
- Use `@IsOptional()` explicitly; never rely on undefined to skip validation

---

## 🔷 GraphQL Resolver Pattern

```ts
@Resolver(() => UserType)
export class StorefrontUsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserType)
  async me(@CurrentUser() user: JwtPayload): Promise<UserType> {
    return this.usersService.findById(user.sub);
  }

  @Mutation(() => AuthResponseType)
  @Public()
  async login(@Args('input') input: LoginInput): Promise<AuthResponseType> {
    return this.usersService.login(input);
  }
}
```

- Resolvers are adapters over services — no business logic inside resolvers
- Never expose password hashes, refresh token material, or internal secrets through GraphQL schema
- Apply auth guards and RBAC identically to REST — `@Public()` is explicit opt-out

---

## 🗄️ Drizzle ORM Pattern

### Schema definition

```ts
// libs/backend/database/src/schema.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default(UserRole.User),
  status: userStatusEnum('status').notNull().default(UserStatus.Active),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Query pattern (via DatabaseService)

```ts
// In a service — inject DatabaseService, not raw drizzle
async findByEmail(email: string) {
  const [user] = await this.db.select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return user ?? null;
}
```

### Migration workflow

```bash
# After every schema change:
npm run db:generate   # creates SQL in drizzle/
npm run db:migrate    # applies to dev DB
# Commit the generated SQL file alongside the schema change
```

- Always use constraints: PK, FK, unique, nullability, defaults, enums
- Transactions for coupled writes (session rotation, token revocation, order+stock)
- Select only needed columns on hot paths — avoid `SELECT *` for large tables
- Add indexes for actual access patterns; skip speculative indexes

---

## 🔐 Auth & Security

### Guard usage

Three global guards are active by default — **do not remove them from `app.module.ts`**:

```ts
// Applied globally in app.module.ts providers
JwtAuthGuard    // requires valid access token
RolesGuard      // enforces @Roles() decorator
ApiThrottlerGuard // PostgreSQL-backed rate limiting
```

Use `@Public()` to opt a route out of JWT. Use `@Roles(UserRole.Admin)` to restrict to a role.

### JWT / session rules

- Access tokens: short-lived, stateless
- Refresh tokens: stored as **bcrypt hash** in `auth_sessions` — never log or return the raw token
- Rotation: issue new refresh token on every refresh call; revoke the old session record
- Reuse detection: if a used/revoked refresh token is presented, revoke ALL sessions for that user
- Password change: revoke ALL user sessions immediately

### What never goes in responses or logs

- Password hashes
- Raw refresh tokens or signing secrets
- Supabase service role key
- Stack traces (in production responses)
- Internal database error details

---

## 🧪 Testing Pattern

### Unit test (service)

```ts
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('returns null for unknown email', async () => {
    mockDatabaseService.select.mockResolvedValue([]);
    expect(await service.findByEmail('x@x.com')).toBeNull();
  });
});
```

### E2E test pattern

```ts
// test/ directory — uses real TEST_DATABASE_URL
beforeAll(async () => {
  app = await createTestApp();
  await truncateAuthTables(db);  // always clean state
});

it('POST /api/v1/auth/login returns tokens', async () => {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: TEST_USER.email, password: TEST_USER.password })
    .expect(200);
  expect(res.body.data.accessToken).toBeDefined();
});
```

- Unit tests: focus on business logic, mock DB
- E2E tests: real `TEST_DATABASE_URL` (must contain string `test`), truncate tables before each suite
- Cover: validation errors, unauthenticated access, forbidden roles, ownership isolation, and conflict paths

---

## 🌳 Nx Monorepo Rules

- Apps (`apps/`) = deployment entry points only; domain code belongs in `libs/`
- Libs (`libs/backend/`) = reusable capabilities; import via TypeScript path aliases (`@/database/*`, etc.)
- Add a library only when two or more apps or features will share it
- Run focused Nx tasks after changes: `nx build storefront-api`, `nx test backend-auth`, `nx lint backend-users`
- Never commit without `npm run build` + `npm run lint` passing

---

## 🌐 Environment & Config

- All env vars validated at startup via `ConfigModule` with Joi/class-validator schema
- No hardcoded URLs, secrets, port numbers, or business values — everything in `.env` + config service
- `SWAGGER_ENABLED`, `GRAPHQL_GRAPHIQL_ENABLED`, `GRAPHQL_INTROSPECTION_ENABLED` must all be `false` in production
- Two Docker databases: `db` (dev, port 5432) and `db-test` (e2e, port 5433) — never use dev DB for tests

---

## 🌳 Git & PR Standards

- **Branch naming:** `feature/<ticket_number>-description`
- **Commits:** Follow Conventional Commits guidelines
- **PRs:** Build + lint + unit tests + e2e tests must all pass before merge
- Review migration SQL before merging schema changes to main

---

## 🧹 Code Quality Checklist

- [ ] ESLint + Prettier configured and passing
- [ ] No `console.log` — use injected `Logger` (Winston) with request ID context
- [ ] All DTOs have `class-validator` decorators + `@ApiProperty()`
- [ ] All new endpoints documented in Swagger
- [ ] Migration generated and committed alongside schema change
- [ ] Auth boundary tested: unauthenticated, wrong role, correct role
- [ ] Build, lint, and unit tests pass before PR
