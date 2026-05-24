 import { config } from 'dotenv';
 config();
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AttendanceUserModule } from '../src/module/attendance_user/attendance_user.module';
import { AttendanceUser } from '../src/typeorm/entities/attendance_user.entity';
import { UsersModule } from '../src/module/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/typeorm/entities/user.entity';
import { Attendance } from '../src/typeorm/entities/attendence.entity';

describe('Attendance-usersController (e2e)', () => {
  let app: INestApplication;
  async function obtainUserToken() {
    const loginResponse = await request(app.getHttpServer())
   .post('/users/login')
        .send({ email: 'jafer@test.com', password: 'NewPassword123!' })
    return loginResponse.body.data
  }
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          AttendanceUserModule,UsersModule,
          TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'test@123',
            database: 'nestappTest',
            entities: [User,Attendance,AttendanceUser],
            synchronize: true
          }),
        ],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();
    });
  
    afterAll(async () => {
      await app.close();
    })
     describe('GET /attendance-users', () => {
    it('Should successfully retrieve attendance users', async () => {
      const response = await request(app.getHttpServer())
        .get('/attendance-users')
        .expect(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data).toBeInstanceOf(Array);
    });
    it('Should handle no attendance records found', async () => {
      const response = await request(app.getHttpServer())
        .get('/attendance-user')
        .expect(404);
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toEqual("Cannot GET /attendance-user");
    });
  });
  describe('create Attendence with User/Attendence_ID(POST)', () => {

    it('should create an attendance user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/attendance-users')
        .send({
          user_id:5,
          attendance_id:1
        })
        .expect(201); 
      expect(response.body.success).toBeTruthy();
      expect(response.body.data).toBeDefined();
    });
    
  it('should handle validation errors when creating an attendance user', async () => {

    const response = await request(app.getHttpServer())
      .post('/attendance-users')
      .send({
      })
      .expect(201); 
    expect(response.body.success).toBeFalsy();
  });

})
describe('PUT /attendance/markedby-update/:userId/:attendanceId', () => {
  let token: any;
  
  beforeAll(async () => {
    
     token = await obtainUserToken(); 
     
  });
    it('should successfully update markedBy', async () => {
      const { accessToken } = token;
      const response = await request(app.getHttpServer())
        .put('/attendance-users/markedby-update/1/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200); 
      expect(response.body.success).toBeTruthy();
      expect(response.body.data).toBeDefined();
    });
      it('should handle invalid parameters', async () => {
        const invalidUserId = 'invalid'; 
        const invalidAttendanceId = 'invalid'; 
        const token = 'your_jwt_token_here'; 
        await request(app.getHttpServer())
          .put(`/attendance/markedby-update/${invalidUserId}/${invalidAttendanceId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404); 
      });
})
})