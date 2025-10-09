import { config } from 'dotenv';
config();
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../src/module/users/users.module';
import { User } from '../src/typeorm/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  async function obtainUserToken() {
    const loginResponse = await request(app.getHttpServer())
   .post('/users/login')
        .send({ email: 'jafer@bitcot.com', password: 'NewPassword123!' })
    return loginResponse.body.data
  }

  async function obtainResetPasswordToken() {
    const resetToken = await request(app.getHttpServer())
    .post('/users/password/forgot')
    .send({ email: 'jafer@bitcot.com' });
    return resetToken
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'bitcot',
          database: 'nestapp',
          entities: [User],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    let token: any;
  
    beforeAll(async () => {
       token = await obtainUserToken(); 
    });
    
    it('should return a list of users(GET)', async () => {
      const { accessToken } = token;
      await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    });
  });

  describe('/users/signup (POST)', () => {
    it('should sign up a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          password: faker.internet.password(),
          email: faker.internet.email(),
          role: 'employee',
        })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
      });
    });

    it('should not sign up an existing user', async () => {
      const email = faker.internet.email();

      await request(app.getHttpServer()).post('/users/signup').send({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        password: faker.internet.password(),
        email: email,
        role: 'manager',
      });

      const response = await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          password: faker.internet.password(),
          email: email,
          role: 'manager',
        })
        .expect(201);

      expect(response.body).toEqual({
        success: false,
        error: 'User with this email already exists',
      });
    });
  });

  describe('/users/signu (POST) - Incorrect Endpoint', () => {
    it('should return 404 Not Found', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/signu')
        .send({
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          password: faker.internet.password(),
          email: faker.internet.email(),
          role: 'manager',
        })
        .expect(404);

      expect(response.body).toEqual({
        message: 'Cannot POST /users/signu',
        error: 'Not Found',
        statusCode: 404,
      });
    });
  });

  describe('/users/login (POST)', () => {
    it('/login (POST)', async () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({ email: 'jafer@bitcot.com', password: 'NewPassword123!' })
        .expect(201)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('accessToken');
          expect(response.body.data).toHaveProperty('refreshToken');
         var token = response.body.token;

        });
    });
  });
  it('Unsuccessful login (POST /login)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
      .expect(401);

    expect(response.body).toEqual({
      message: 'Email or password is invalid',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  describe('/users/password/forgot(POST)', () => {
    it('Generate reset password link (POST /password/forgot)', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/password/forgot')
        .send({ email: 'jafer@bitcot.com' });

      expect(response.body).toEqual({
        success: true,
        message: 'Reset password link sent to email.',
      });
    });
    it('Generate reset password link (POST /password/forgot)', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/password/forgot')
        .send({ email: 'ritikkumawat@bitcot.co' });

      expect(response.body).toEqual({
        success: false,
        error: 'User not found',
      });
    });
  });
  describe('/password/reset (PUT)', () => {
    let resettoken: any;
  
    beforeAll(async () => {
      
       resettoken = await obtainResetPasswordToken(); 
    });
    it('should successfully reset the password', async () => {
      const newPassword = 'NewPassword123!';
      const confirmPassword = 'NewPassword123!';
  
      const response = await request(app.getHttpServer())
        .put('/users/password/reset')
        .send({ resettoken, newPassword, confirmPassword })
        .expect(200); 

      expect(response.body).toEqual({
        success: true,
        message: "Password successfully reset."
      });
    });
  
    it('should fail to reset password due to invalid token', async () => {
      const token = '04e3595b-66aa-494d-9ce8-4ea32ac5acae';
      const newPassword = 'NewPassword123!';
      const confirmPassword = 'NewPassword123!';
  
      const response = await request(app.getHttpServer())
        .put('/users/password/reset')
        .send({ token, newPassword, confirmPassword })
        .expect(200); 
  
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid token',
      });
    });
  });
  describe('/users/password/change (PUT)', () => {

    let token: any;
  
    beforeAll(async () => {
      
       token = await obtainUserToken(); 
       
    });
  
    it('should successfully change the password', async () => {
      const { accessToken } = token;
      const response = await request(app.getHttpServer())
        .put('/users/password/change')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'NewPassword123!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!'
        });
  
      expect(response.body).toEqual({
        success: true,
        message: 'Password successfully changed.'
      });
      expect(response.statusCode).toBe(200);
    });
  
    it('should fail to change the password with incorrect current password', async () => {
      const { accessToken } = token;
      const response = await request(app.getHttpServer())
        .put('/users/password/change')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'IncorrectPassword',
          newPassword: 'NewPassword123',
          confirmPassword: 'NewPassword123'
        });
  
      expect(response.body).toEqual({
        success: false,
        error: 'Current password is incorrect' 
      });
      expect(response.statusCode).toBe(200); 
    });
  
    it('should fail to change the password with incorrect Token', async () => {
      const { accessToken } = token;
      const response = await request(app.getHttpServer())
        .put('/users/password/change')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'IncorrectPassword',
          newPassword: 'NewPassword123',
          confirmPassword: 'NewPassword123'
        });
  
      expect(response.body).toEqual({
        message: "Unauthorized",
        statusCode: 401
      });
      expect(response.statusCode).toBe(401); 
    });
  
  });


  describe('/users/refresh-token (GET)', () => {
    let token: any;
  
    beforeAll(async () => {
       token = await obtainUserToken(); 
    });

  it('Refresh the access token with a valid refresh token', async () => {
    const { refreshToken } = token;

    const response = await request(app.getHttpServer())
      .get('/users/refresh-token')
      .set('Authorization', `Bearer ${refreshToken}`) 
      .expect(200); 

    expect(response.body.success).toBeTruthy();
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });

  it('Refresh the access token with a inValid refresh token', async () => {

    const response = await request(app.getHttpServer())
      .get('/users/refresh-token')
      .set('Authorization', `Bearer ${token}`) 
      .expect(200); 

      expect(response.body).toEqual({
        success: false,
        error: "Refresh Token Invalid"
      });
  });
})
});
