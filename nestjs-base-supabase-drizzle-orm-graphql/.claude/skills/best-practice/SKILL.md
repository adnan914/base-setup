---
name: code-iqra-backend-standards
description: >
  Enforces Code Iqra Backend Best Practices and Standards for NestJS 11, PostgreSQL,
  Drizzle ORM, GraphQL (Apollo), Supabase, JWT auth, and related tooling. Use this skill whenever
  writing, reviewing, or scaffolding any backend code — including modules, controllers, resolvers,
  services, guards, DTOs, Drizzle schema, migrations, queries, transactions, or tests.
  Always consult this skill before generating any NestJS module, endpoint, resolver, DTO, guard,
  service, database query, or migration. Trigger on: create a module, add an endpoint, write a
  resolver, define a DTO, add a guard, write a Drizzle query, create a migration, write a service,
  set up auth, add a test, or any NestJS / backend code task in a Code Iqra project.
---

# Code Iqra Backend Best Practices & Standards

This skill enforces coding standards, architectural conventions, and design practices for Code Iqra's backend applications built with **NestJS 11**, **PostgreSQL**, **Drizzle ORM**, and **Supabase**.

---

## ⚙️ Technology Stack

| Category | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript (strict) |
| Runtime | Node.js 22 |
| Database | PostgreSQL (Drizzle ORM + Supabase) |
| GraphQL | Apollo Server 5, @nestjs/graphql |
| Auth | Passport (JWT + Local), bcryptjs |
| Validation | class-validator, class-transformer |
| Logging | Winston |
| Testing | Jest, Supertest |
| Dev Tools | ESLint, Prettier |

---

## 🧩 Project Structure

```
src/
  app.module.ts              # root module — registers all feature + infra modules
  app.controller.ts          # health/root endpoint
  configure-app.ts           # bootstrap: pipes, filters, interceptors, swagger
  main.ts
  config/
    env.validation.ts        # Joi env schema validated at startup
  database/
    schema.ts                # all Drizzle table definitions + exported types
    database.module.ts
    database.service.ts      # wraps drizzle-orm db instance
    database-throttler.storage.ts
    supabase.service.ts
    postgres-error.ts        # isPostgresUniqueViolation helper
    index.ts                 # barrel re-exports
  features/
    <feature>/
      <feature>.module.ts
      <feature>.service.ts
      <feature>.service.spec.ts
      <feature>.controller.ts      # REST (optional per feature)
      dto/
        create-<feature>.dto.ts
        update-<feature>.dto.ts
        <feature>-response.dto.ts
      graphql/
        <feature>.model.ts         # @ObjectType
        <feature>-query.args.ts    # @ArgsType
        <feature>.resolver.ts      # @Resolver
  shared/                    # @Global SharedModule — guards, pipes, decorators, etc.
    constants/index.ts
    decorators/
    dto/api-response.dto.ts
    enums/index.ts
    filters/global-exception.filter.ts
    graphql/graphql-http-context.ts
    guards/
    interceptors/
    logger/winston.logger.ts
    pipes/
    shared.module.ts
drizzle/                     # committed SQL migrations (never edit by hand)
test/                        # e2e tests (real TEST_DATABASE_URL)
```

Path aliases use `@/` — e.g. `@/shared/guards/jwt-auth.guard`, `@/database`, `@/features/users/users.service`.


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

## 🧠 General Principles

- Read existing controllers, resolvers, DTOs, services, guards, schema, and tests **before** changing behavior
- Reuse established patterns, enums, constants, response envelopes, and Drizzle query styles
- Keep the smallest coherent change that preserves API, auth, database, and operational contracts
- Controllers and resolvers stay **thin** — business logic lives in services
- Services stay **domain-focused** — persistence details go through `DatabaseService`

---

## ✍️ Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Files/Folders | kebab-case | `auth-session.service.ts` |
| Classes | PascalCase | `AuthSessionService` |
| Methods/Variables | lowerCamelCase | `findByRefreshTokenId()` |
| Constants | UPPERCASE | `const MAX_LOGIN_ATTEMPTS = 5` |
| Enums | PascalCase members | `Role.ADMIN`, `Status.ACTIVE` |
| DTOs | PascalCase + Dto suffix | `CreateUserDto`, `LoginResponseDto` |
| GraphQL ObjectTypes | PascalCase + Model suffix | `UserModel` |
| GraphQL Args | PascalCase + Args suffix | `UsersQueryArgs` |

---

## 🏗️ Module Pattern

Every feature follows this structure under `src/features/<feature>/`:

```
<feature>/
  <feature>.module.ts
  <feature>.service.ts
  <feature>.service.spec.ts
  <feature>.controller.ts         # REST controller (if needed)
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
    <feature>-response.dto.ts
  graphql/
    <feature>.model.ts            # @ObjectType
    <feature>-query.args.ts       # @ArgsType
    <feature>.resolver.ts         # @Resolver
```

Service is injected into both controller and resolver. Module exports service so other modules can import it.

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 📋 REST Controller Pattern

```ts
@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @Messages(MESSAGES.DATA_FOUND)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiEnvelopeResponse({ status: 200, type: UserResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  findOne(@Param('id') id: string): Promise<PublicUser> {
    return this.usersService.findById(id);
  }
}
```

- Use `@Messages()` to set the response message string
- Use `@ApiEnvelopeResponse()` / `@ApiEnvelopeMessageResponse()` for Swagger envelope
- Use `@ApiErrorResponseDto` for all error responses
- Validate input at the boundary — never trust raw request data inside services
- Use `@Public()` only on routes that genuinely need no auth
- Use `@Roles(Role.ADMIN)` to restrict to a role

---

## 🔷 DTO Pattern

```ts
export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;
}
```

- All DTOs use `class-validator` decorators — global pipe enforces `whitelist: true, forbidNonWhitelisted: true`
- All public fields get `@ApiProperty()` or `@ApiPropertyOptional()` with examples
- Use `@IsOptional()` explicitly; never rely on `undefined` to skip validation

---

## 🔷 GraphQL Pattern

```ts
// graphql/<feature>.model.ts
@ObjectType('User')
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => [Role])
  roles: Role[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastLoginAt: Date | null;
}

// graphql/<feature>.resolver.ts
@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserModel, { name: 'me' })
  me(@Context() context: AuthenticatedGraphqlContext): Promise<PublicUser> {
    return this.usersService.findById(context.req.user.id);
  }

  @Query(() => [UserModel], { name: 'users' })
  @Roles(Role.ADMIN)
  users(@Args() args: UsersQueryArgs): Promise<PublicUser[]> {
    return this.usersService.findAll(args);
  }
}
```

- Resolvers are adapters over services — no business logic inside resolvers
- Use `@Context()` to access the authenticated user (via `context.req.user`)
- Register enums with `registerEnumType()` in the model file
- Never expose password hashes, raw tokens, or internal secrets through GraphQL schema
- Apply `@Roles()` and `@Public()` identically to REST

---

## 🗄️ Drizzle ORM Pattern

### Schema definition (`src/database/schema.ts`)

```ts
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 150 }).notNull(),
    password: text('password').notNull(),
    roles: roleEnum('roles').array().notNull().default(sql`ARRAY['User']::user_role[]`),
    status: statusEnum('status').notNull().default(Status.ACTIVE),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    statusIdx: index('users_status_idx').on(table.status),
  }),
);

// Export inferred types
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, 'password'>;
```

### Query pattern (via DatabaseService)

```ts
// Inject DatabaseService, use this.databaseService.db
async findById(id: string): Promise<PublicUser> {
  const [user] = await this.databaseService.db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
  return this.toPublicUser(user);
}
```

### Transaction pattern

```ts
return await this.databaseService.db.transaction(async (tx) => {
  const [user] = await tx.update(users).set(values).where(eq(users.id, id)).returning();
  await tx.update(authSessions).set({ revokedAt: new Date() }).where(...);
  return this.toPublicUser(user);
});
```

### Migration workflow

```bash
npm run db:generate   # generates SQL in drizzle/
npm run db:migrate    # applies to dev DB
# Commit schema.ts change + generated SQL together
```

- Always use constraints: PK, FK, unique indexes, nullability, defaults, enums
- Transactions for coupled writes (session rotation, token revocation)
- Select only needed columns on hot paths; paginate collections
- Add indexes for actual access patterns only

---

## 🔐 Auth & Security

### Three global guards (do NOT remove from `app.module.ts`)

```ts
{ provide: APP_GUARD, useClass: ApiThrottlerGuard }  // PostgreSQL-backed rate limiting
{ provide: APP_GUARD, useClass: JwtAuthGuard }       // requires valid access token
{ provide: APP_GUARD, useClass: RolesGuard }         // enforces @Roles()
```

- Use `@Public()` to opt a route out of JWT
- Use `@Roles(Role.ADMIN)` to restrict to a role

### JWT / session rules

- Access tokens: short-lived, stateless JWT
- Refresh tokens: stored as **bcrypt hash** in `auth_sessions` — never log or return the raw token
- Rotation: issue new refresh token on every refresh; revoke the old session record
- Reuse detection: if a used/revoked refresh token is presented, revoke ALL sessions for that user
- Password change: revoke ALL user sessions immediately

### What never goes in responses or logs

- Password hashes
- Raw refresh tokens or JWT signing secrets
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
    mockDatabaseService.db.select.mockResolvedValue([]);
    expect(await service.findByEmail('x@x.com')).toBeNull();
  });
});
```

### E2E test pattern

```ts
// test/ directory — uses real TEST_DATABASE_URL
beforeAll(async () => {
  app = await createTestApp();
  await truncateAuthTables(db);
});

it('POST /api/v1/auth/login returns tokens', async () => {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: TEST_USER.email, password: TEST_USER.password })
    .expect(200);
  expect(res.body.data.accessToken).toBeDefined();
});
```

- Unit tests: business logic, mock DatabaseService
- E2E tests: real `TEST_DATABASE_URL` (must contain string `test`), truncate tables before each suite
- Cover: validation errors, unauthenticated access, forbidden roles, ownership isolation, conflict paths

### Run commands

```bash
npm test -- --runInBand           # unit tests

docker compose up -d db-test
npm run db:migrate:test
npm run test:e2e -- --runInBand   # e2e tests
```

---

## 🌐 Environment & Config

- All env vars validated at startup via `validateEnvironment` in `src/config/env.validation.ts`
- No hardcoded URLs, secrets, port numbers, or business values — everything via `.env` + ConfigService
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

- [ ] No `console.log` — use injected `WinstonLogger` with request ID context
- [ ] All DTOs have `class-validator` decorators + `@ApiProperty()`
- [ ] All new REST endpoints documented in Swagger with `@ApiEnvelopeResponse()`
- [ ] All new GraphQL types defined with explicit `@Field()` decorators
- [ ] Migration generated and committed alongside schema change
- [ ] Auth boundary tested: unauthenticated, wrong role, correct role
- [ ] `npm run build` + `npm run lint` pass before PR
