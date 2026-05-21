import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { sql } from 'drizzle-orm';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
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
      .expect(200);
  });
});

async function resetDatabase(databaseService?: DatabaseService) {
  if (!databaseService) {
    return;
  }

  await databaseService.db.execute(
    sql`truncate table "tokens", "users" restart identity cascade`,
  );
}
