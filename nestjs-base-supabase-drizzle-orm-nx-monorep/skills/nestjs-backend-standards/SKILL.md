---
name: nestjs-backend-standards
description: Production backend engineering standards for this NestJS, Supabase, PostgreSQL, and Drizzle repository. Use when Codex adds, changes, reviews, or documents backend APIs, Swagger, DTOs, services, guards, database schema, migrations, queries, transactions, configuration, security controls, performance behavior, caching, observability, or tests.
---

# NestJS Backend Standards

Use the existing project shape first. Read nearby controllers, DTOs,
services, guards, decorators, schema, filters, interceptors, and tests before
changing backend behavior.

## Workflow

1. Confirm the product capability and avoid creating an endpoint, table, index,
   cache, helper, or abstraction unless it has a clear need.
2. Reuse established modules, enums, constants, DTOs, response envelopes,
   guards, pipes, filters, logging, Drizzle patterns, and tests before adding
   another style.
3. Keep the smallest coherent change that preserves API, authorization,
   database, observability, and operational contracts.
4. Verify high-risk assumptions with tests, build, lint, migrations, query
   shape, schema inspection, or a focused manual check before finishing.

---

## Project Structure

```
apps/
  storefront-api/     # customer-facing API (port 3000) — public register, login, profile
  admin-api/          # privileged admin API (port 3001) — no public registration
libs/backend/
  auth/               # shared JWT/session services + storefront/admin API modules
  users/              # shared user service + storefront/admin API modules
  database/           # Drizzle schema, DB service, Supabase service, test DB guard
  common/             # config, app setup, guards, pipes, filters, logger
drizzle/              # committed SQL migrations (never edit by hand)
test/                 # HTTP e2e tests against real TEST_DATABASE_URL
```

Feature services are written once in `libs/backend/<feature>/`. Both
`storefront/` and `admin/` modules expose only the endpoints appropriate to
their audience.

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Files/Folders | kebab-case | `auth-session.service.ts` |
| Classes | PascalCase | `AuthSessionService` |
| Methods/Variables | lowerCamelCase | `findByRefreshTokenId()` |
| Constants | UPPERCASE | `const MAX_LOGIN_ATTEMPTS = 5` |
| Enums | PascalCase + PascalCase members | `UserRole.Admin` |
| DTOs | PascalCase + Dto suffix | `CreateUserDto`, `LoginResponseDto` |

---

## Module Pattern

```
libs/backend/<feature>/
  src/
    <feature>.service.ts                   # shared domain service
    <feature>.module.ts                    # shared providers
    storefront/
      storefront-<feature>.module.ts
      storefront-<feature>.controller.ts
    admin/
      admin-<feature>.module.ts
      admin-<feature>.controller.ts
    dto/
      create-<feature>.dto.ts
      update-<feature>.dto.ts
```

---

## REST API Standards

### Controller pattern

```ts
@ApiTags('users')
@Controller('users')
export class StorefrontUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiEnvelopeResponse({
    description: 'User profile returned.',
    message: MESSAGES.DATA_FOUND,
    status: 200,
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token.', type: ApiErrorResponseDto })
  @Messages(MESSAGES.DATA_FOUND)
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.usersService.findById(user.sub);
  }
}
```

- Use `@ApiEnvelopeResponse` (not `@ApiOkResponse`) — it generates correct Swagger for the `{ success, data, message }` response envelope
- `@Messages(MESSAGES.<KEY>)` sets the envelope message read by `ResponseInterceptor` — always pair it with `@ApiEnvelopeResponse` using the same `MESSAGES` key
- Use constants from `MESSAGES` — never hardcode message strings inline
- Document every exposed endpoint: `@ApiTags`, `@ApiOperation`, `@ApiEnvelopeResponse`, all relevant error response decorators, auth requirement, throttling
- Swagger must match runtime: response shape, status codes, nullable fields, validation rules, actual authorization behavior
- Validate all input at the boundary — never trust raw request data inside services
- Do not create broad CRUD endpoints automatically — expose only what the product needs

### DTO pattern

```ts
export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;
}
```

- Global pipe enforces `whitelist: true, forbidNonWhitelisted: true` — rely on it
- Use `@IsOptional()` explicitly; never rely on `undefined` to skip validation
- All public DTO fields get `@ApiProperty()` or `@ApiPropertyOptional()`

---

## Security

### Global guards — do NOT remove from `app.module.ts`

Three guards are active on all routes by default:

```ts
// Applied globally in app.module.ts providers array
JwtAuthGuard       // requires valid access token
RolesGuard         // enforces @Roles() decorator
ApiThrottlerGuard  // PostgreSQL-backed rate limiting shared across instances
```

Use `@Public()` to opt a route out of JWT enforcement. Use
`@Roles(UserRole.Admin)` to restrict to a role.

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

### Other security controls

- Use parameterized ORM/database APIs — no dynamic SQL from untrusted strings
- Validate identifiers, URLs, files, callbacks, and third-party inputs
- Least-privilege DB credentials, preserve SSL, keep Supabase service role key server-only
- Consider CORS, Helmet, throttling, timeouts, payload sizes, brute force, replay, injection,
  SSRF, and broken object authorization for every external path

---

## Database

### Schema definition

```ts
// libs/backend/database/src/schema.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').notNull().default(UserRole.User),
  status: userStatusEnum('status').notNull().default(UserStatus.Active),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

- Protect invariants with schema constraints: PK, FK, unique, nullability, defaults,
  enum/check constraints, and intentional cascade behavior
- Add indexes for actual access patterns — avoid speculative indexes that add write cost

### Migration workflow

```bash
# After every schema change — run in order, commit all three outputs:
npm run db:generate   # generates SQL in drizzle/
npm run db:migrate    # applies to dev DB
# Commit schema.ts change + generated SQL file together in the same commit
```

Never edit migration SQL files by hand after generation. Review SQL before applying
to production. Keep rollback or forward-fix strategy ready for destructive migrations.

### Query rules

- Use transactions for atomic multi-step work: session/token rotation, stock/order
  state transitions, coupled writes, read-modify-write flows
- Keep transactions short — no network calls inside them
- Select only necessary columns on hot paths; paginate collections; avoid N+1 flows
- Treat concurrency as correctness: prefer constraints, atomic updates, idempotency,
  and transaction isolation over race-prone pre-checks

---

## Code Contracts

- Use explicit TypeScript types at boundaries: DTOs, service return types,
  request/session context, config objects, query inputs, and
  integration clients. Avoid `any`, unsafe casts, and loose object bags unless a
  framework boundary requires them.
- Use enums for finite domain values: roles, statuses, token types, payment/order
  states, modes, and event kinds. Extend the enum that owns the concept instead
  of duplicating string literals.
- Do not scatter hardcoded messages, secrets, numeric limits, cache keys, feature
  switches, status labels, or repeated business values — put them in constants,
  enums, validated configuration, or typed helpers.
- Keep controllers thin. Keep services modular and domain-focused.
  Keep persistence details behind database-oriented services.
- Prefer dependency injection, pure helpers, and composition over copy-paste code.
  Add an abstraction only when it centralizes a real policy or removes meaningful
  duplication.

---

## Performance and Runtime

- Start with fundamentals: query count, indexes, bounded payloads, serialization
  cost, hashing cost, external-call count, connection pooling, and backpressure
- Cache only when it helps a stable access pattern — define key ownership, TTL,
  invalidation, authorization scope, and stale-data tolerance before adding it
- Prefer bounded concurrency, timeouts, retries with backoff for safe operations,
  and streaming for large data
- Prevent resource leaks: unbounded in-memory caches, retained request objects,
  orphaned timers, unclosed DB clients, forgotten subscriptions
- Build for horizontal scale: stateless request handling, shared rate-limit/session
  decisions, background jobs for slow non-request work

---

## Observability and Operations

- Use structured logs with request IDs and meaningful context — not a sensitive-data store
- Make errors actionable for operators while keeping public responses safe
- Keep readiness/liveness checks meaningful and cheap
- Validate environment variables at startup; choose secure defaults; document switches
- Prefer backward-compatible API and migration rollout plans when clients and
  deployments may overlap

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
    mockDatabaseService.select.mockResolvedValue([]);
    expect(await service.findByEmail('x@x.com')).toBeNull();
  });
});
```

### E2E test pattern

```ts
// test/ — always uses TEST_DATABASE_URL, never the dev DB
beforeAll(async () => {
  app = await createTestApp();
  await truncateAuthTables(db);  // clean state before each suite
});

it('POST /api/v1/auth/login returns tokens', async () => {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: TEST_USER.email, password: TEST_USER.password })
    .expect(200);
  expect(res.body.data.accessToken).toBeDefined();
});
```

- Unit tests: business decisions, mock DB
- E2E tests: real `TEST_DATABASE_URL` (database name must contain `test`),
  truncate tables before each suite
- Cover: validation errors, unauthenticated access, forbidden roles, ownership
  isolation, conflicts, failure paths, race/idempotency behavior

### Run commands

```bash
npm test -- --runInBand                        # unit tests

docker compose up -d db-test
npm run db:migrate:test
npm run test:e2e -- --runInBand               # e2e tests
```

---

## Code Quality Checklist

- [ ] No `console.log` — use injected `Logger` (Winston) with request ID context
- [ ] All DTOs have `class-validator` decorators + `@ApiProperty()`
- [ ] All new endpoints use `@ApiEnvelopeResponse` + `@Messages(MESSAGES.<KEY>)` with matching key
- [ ] All new REST endpoints documented in Swagger with error response decorators
- [ ] Migration generated and committed alongside schema change
- [ ] Auth boundary tested: unauthenticated, wrong role, correct role
- [ ] `npm run build` + `npm run lint` pass before PR
