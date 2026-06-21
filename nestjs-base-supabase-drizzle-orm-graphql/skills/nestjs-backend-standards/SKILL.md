---
name: nestjs-backend-standards
description: Production backend engineering standards for this NestJS, GraphQL, Supabase, PostgreSQL, and Drizzle repository. Use when adding, changing, reviewing, or documenting backend APIs, Swagger, resolvers, DTOs, services, guards, database schema, migrations, queries, transactions, configuration, security controls, performance behavior, caching, observability, or tests.
---

# NestJS Backend Standards

Read existing controllers, resolvers, DTOs, services, guards, decorators, schema, filters,
interceptors, and tests before changing backend behavior.

## Workflow

1. Confirm the product capability and avoid creating an endpoint, resolver, mutation, table,
   index, or abstraction unless it has a clear need.
2. Reuse established modules, enums, constants, DTOs, response envelopes, guards, pipes,
   filters, logging, Drizzle patterns, and tests before adding another style.
3. Keep the smallest coherent change that preserves API, authorization, database,
   observability, and operational contracts.
4. Verify high-risk assumptions with tests, build, lint, migrations, or a focused manual
   check before finishing.

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

### Validation

- Verify no unrelated files were changed.
- Verify no unnecessary code was added.
- Verify existing functionality remains intact.
- Run the narrowest meaningful validation for the change when practical.

---

## Project Structure

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
      <feature>.controller.ts      # REST controller (optional per feature)
      dto/
        create-<feature>.dto.ts
        update-<feature>.dto.ts
        <feature>-response.dto.ts
      graphql/
        <feature>.model.ts         # @ObjectType
        <feature>-query.args.ts    # @ArgsType
        <feature>.resolver.ts      # @Resolver
  shared/                    # @Global SharedModule
    constants/index.ts
    decorators/
      public.decorator.ts
      roles.decorator.ts
      messages.decorator.ts
      api-envelope-response.decorator.ts
    dto/api-response.dto.ts
    enums/index.ts
    filters/global-exception.filter.ts
    graphql/graphql-http-context.ts
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
      api-throttler.guard.ts
      local-auth.guard.ts
    interceptors/
      response.interceptor.ts
      timeout.interceptor.ts
    logger/winston.logger.ts
    pipes/
    shared.module.ts
drizzle/                     # committed SQL migrations (never edit by hand)
test/                        # e2e tests against real TEST_DATABASE_URL
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

### Validation

- Verify no unrelated files were changed.
- Verify no unnecessary code was added.
- Verify existing functionality remains intact.
- Run the narrowest meaningful validation for the change when practical.

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Files/Folders | kebab-case | `auth-session.service.ts` |
| Classes | PascalCase | `AuthSessionService` |
| Methods/Variables | lowerCamelCase | `findByRefreshTokenId()` |
| Constants | UPPERCASE | `const MAX_LOGIN_ATTEMPTS = 5` |
| Enums | PascalCase + PascalCase members | `Role.ADMIN`, `Status.ACTIVE` |
| DTOs | PascalCase + Dto suffix | `CreateUserDto`, `LoginResponseDto` |
| GraphQL ObjectTypes | PascalCase + Model suffix | `UserModel` |
| GraphQL Args | PascalCase + Args suffix | `UsersQueryArgs` |

---

## Module Pattern

Every feature lives under `src/features/<feature>/`. The module exports its service so other
feature modules can import it.

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
```

The service is shared between controller and resolver. No business logic in controllers or
resolvers — those are thin adapters over the service.

---

## REST API Standards

### Controller pattern

```ts
@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @Messages(MESSAGES.DATA_FOUND)
  @ApiOperation({ summary: 'Get user by id', description: 'Returns the user for that user or an admin.' })
  @ApiEnvelopeResponse({ status: 200, description: 'User returned.', type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid.', type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User was not found.', type: ApiErrorResponseDto })
  findOne(@Param('id') id: string): Promise<PublicUser> {
    return this.usersService.findById(id);
  }
}
```

- Use `@Messages()` to set the envelope response message
- Use `@ApiEnvelopeResponse()` / `@ApiEnvelopeMessageResponse()` for Swagger envelope shape
- Use `ApiErrorResponseDto` for all error response types
- Swagger must match runtime: shape, status codes, nullable fields, auth requirement
- Validate all input at the boundary — never trust raw request data inside services
- Do not create broad CRUD endpoints automatically — expose only what the product needs

### DTO pattern

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

- Global pipe enforces `whitelist: true, forbidNonWhitelisted: true` — rely on it
- Use `@IsOptional()` explicitly; never rely on `undefined` to skip validation
- All public DTO fields get `@ApiProperty()` or `@ApiPropertyOptional()` with examples

---

## GraphQL Standards

### Model pattern (`graphql/<feature>.model.ts`)

```ts
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
```

Register enums used in GraphQL with `registerEnumType()` in the model file.

### Resolver pattern (`graphql/<feature>.resolver.ts`)

```ts
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

- Resolvers are thin adapters over services — no business logic inside resolvers
- Access the authenticated user via `@Context()` → `context.req.user`
- Never expose password hashes, raw tokens, or internal secrets through schema
- Apply `@Public()` and `@Roles()` identically to REST

---

## Security

### Global guards — do NOT remove from `app.module.ts`

```ts
{ provide: APP_GUARD, useClass: ApiThrottlerGuard }  // PostgreSQL-backed rate limiting
{ provide: APP_GUARD, useClass: JwtAuthGuard }       // requires valid access token
{ provide: APP_GUARD, useClass: RolesGuard }         // enforces @Roles()
```

Use `@Public()` to opt a route out of JWT enforcement. Use `@Roles(Role.ADMIN)` to restrict.

### Auth session rules

- Access tokens: short-lived, stateless JWT
- Refresh tokens: stored as **bcrypt hash** in `auth_sessions` — never log or return the raw token
- Rotation: issue new refresh token on every refresh; revoke the old session record
- Reuse detection: used/revoked refresh token presented → revoke ALL sessions for that user
- Password change: revoke ALL user sessions immediately

### What never appears in responses, logs, or errors

- Password hashes
- Raw refresh tokens or JWT signing secrets
- Supabase service role key
- Stack traces (production responses)
- Internal database error details
- Auth error detail that helps an attacker enumerate accounts

---

## Database

### Schema definition (`src/database/schema.ts`)

```ts
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 150 }).notNull(),
    roles: roleEnum('roles').array().notNull().default(sql`ARRAY['User']::user_role[]`),
    status: statusEnum('status').notNull().default(Status.ACTIVE),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  }),
);

// Export inferred types from the schema file
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, 'password'>;
```

- Use constraints: PK, FK, unique indexes, nullability, defaults, enum/check constraints
- Add indexes for actual access patterns — avoid speculative indexes

### Query pattern (inject `DatabaseService`, use `this.databaseService.db`)

```ts
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
# Commit schema.ts change + generated SQL file together in the same commit
```

Never edit migration SQL files by hand after generation.

### Query rules

- Use transactions for atomic multi-step work: session rotation, coupled writes
- Keep transactions short — no network calls inside them
- Select only necessary columns on hot paths; paginate collections
- Avoid N+1 flows; paginate all list queries

---

## Code Contracts

- Use explicit TypeScript types at boundaries: DTOs, service return types, resolver context,
  config objects, query inputs. Avoid `any` and unsafe casts.
- Use enums from `src/shared/enums/` for finite domain values: roles, statuses, token types,
  revocation reasons. Extend the enum that owns the concept.
- Do not scatter hardcoded messages, limits, or repeated business values — use `MESSAGES`
  constants from `src/shared/constants/`.
- Keep controllers and resolvers thin. Keep services domain-focused. Wrap persistence
  behind `DatabaseService`.

---

## Observability and Operations

- Use `WinstonLogger` (injected) with request IDs — no `console.log`
- Make errors actionable for operators while keeping public responses safe
- Validate environment variables at startup via `validateEnvironment`
- `SWAGGER_ENABLED`, `GRAPHQL_GRAPHIQL_ENABLED`, `GRAPHQL_INTROSPECTION_ENABLED` must be
  `false` in production

---

## Testing

### Unit test pattern

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
// test/ — always uses TEST_DATABASE_URL (name must contain 'test'), never dev DB
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

- Unit tests: business decisions, mock `DatabaseService`
- E2E tests: real `TEST_DATABASE_URL`, truncate tables before each suite
- Cover: validation errors, unauthenticated access, forbidden roles, ownership isolation,
  conflicts, and failure paths

### Run commands

```bash
npm test -- --runInBand                       # unit tests

docker compose up -d db-test
npm run db:migrate:test
npm run test:e2e -- --runInBand              # e2e tests
```

---

## Code Quality Checklist

- [ ] No `console.log` — use injected `WinstonLogger` with request ID context
- [ ] All DTOs have `class-validator` decorators + `@ApiProperty()` with examples
- [ ] All new REST endpoints documented with `@ApiEnvelopeResponse()` in Swagger
- [ ] All new GraphQL types/inputs defined with explicit `@Field()` decorators
- [ ] Migration generated and committed alongside schema change
- [ ] Auth boundary tested: unauthenticated, wrong role, correct role
- [ ] `npm run build` + `npm run lint` pass before PR
