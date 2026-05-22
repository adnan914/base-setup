import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { sql } from 'drizzle-orm';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database';
import { configureApp } from '../src/configure-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        firstName: 'John',
        lastName: 'Doe',
        password: 'Use-A-Long-Password-123',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password: 'Use-A-Long-Password-123',
      })
      .expect(201);
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

  it('normalizes email identity before login', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: '  Mixed.Case@example.com  ',
        firstName: 'Email',
        lastName: 'Normalization',
        password: 'Use-A-Long-Password-123',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'mixed.case@example.com',
        password: 'Use-A-Long-Password-123',
      })
      .expect(201);
  });

  it('blocks regular users from listing users', async () => {
    const tokens = await registerUser(`list-${Date.now()}@example.com`);

    await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('authorization', `Bearer ${tokens.accessToken}`)
      .expect(403);
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
