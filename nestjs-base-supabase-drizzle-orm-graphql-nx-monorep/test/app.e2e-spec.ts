import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { sql } from 'drizzle-orm';
import { StorefrontApiModule } from '../apps/storefront-api/src/app/app.module';
import { DatabaseService } from '@/database';
import { configureApp } from '@/configure-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StorefrontApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    databaseService = app.get(DatabaseService);
  });

  beforeEach(async () => {
    await resetDatabase(databaseService);
  });

  afterAll(async () => {
    await resetDatabase(databaseService);
    await app?.close();
  });

  it('registers and logs in a user', async () => {
    const email = `test-${Date.now()}@example.com`;
    const registrationEmail = `  ${email.toUpperCase()}  `;

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: registrationEmail,
        firstName: 'John',
        lastName: 'Doe',
        password: 'Use-A-Long-Password-123',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: registrationEmail,
        password: 'Use-A-Long-Password-123',
      })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/graphql')
      .set('authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({
        query: `
          query CurrentUser {
            me {
              email
            }
          }
        `,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.me.email).toBe(email);
      });
  });

  it('returns a conflict for a normalized duplicate registration email', async () => {
    const email = `duplicate-${Date.now()}@example.com`;

    await registerUser(email);

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: ` ${email.toUpperCase()} `,
        firstName: 'Duplicate',
        lastName: 'User',
        password: 'Use-A-Long-Password-123',
      })
      .expect(409);
  });

  it('rejects roles on public registration', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `roles-${Date.now()}@example.com`,
        firstName: 'Role',
        lastName: 'Escalation',
        password: 'Use-A-Long-Password-123',
        roles: ['Admin'],
      })
      .expect(400);
  });

  it('does not expose the admin user list on the storefront API', async () => {
    const tokens = await registerUser(`list-${Date.now()}@example.com`);

    await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('authorization', `Bearer ${tokens.accessToken}`)
      .expect(404);
  });

  it('revokes a session when a rotated refresh token is reused', async () => {
    const tokens = await registerUser(`refresh-${Date.now()}@example.com`);
    const rotatedTokens = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: tokens.refreshToken })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: tokens.refreshToken })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: rotatedTokens.body.data.refreshToken })
      .expect(401);
  });

  it('revokes refresh access on logout', async () => {
    const tokens = await registerUser(`logout-${Date.now()}@example.com`);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('authorization', `Bearer ${tokens.accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: tokens.refreshToken })
      .expect(401);
  });

  async function registerUser(email: string) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        firstName: 'Http',
        lastName: 'User',
        password: 'Use-A-Long-Password-123',
      })
      .expect(201);

    return response.body.data as {
      accessToken: string;
      refreshToken: string;
    };
  }
});

async function resetDatabase(databaseService?: DatabaseService) {
  if (!databaseService) {
    return;
  }

  await databaseService.db.execute(
    sql`truncate table "rate_limits", "auth_sessions", "tokens", "users"
      restart identity cascade`,
  );
}
