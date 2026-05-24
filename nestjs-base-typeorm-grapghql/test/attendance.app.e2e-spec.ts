import { config } from 'dotenv';
config();
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AttendanceModule } from '../src/module/attendance/attendance.module';
import { Attendance } from '../src/typeorm/entities/attendence.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AttendanceController (e2e)', () => {
    let app: INestApplication;
  
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
            AttendanceModule,
          TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'test@123',
            database: 'nestappTest',
            entities: [Attendance],
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
describe('AttendenceController (e2e)', () => {
    it('Should get attendance records successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/attendance')
          .expect(200); 
        expect(response.body.success).toBeTruthy();
        expect(response.body.data).toBeDefined();
      });
    it('error in Path of get attendence ', async () => {
        const response = await request(app.getHttpServer())
          .get('/attendanc')
          .expect(404); 
          expect(response.body).toEqual({
            message: "Cannot GET /attendanc",
            error: "Not Found",
            statusCode: 404
          });
      });
    })

    describe('POST /attendance', () => {
      it('should create attendance successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/attendance')
          .send({
            date:"2024-04-02",
            dayOfWeek:"saturday"
        })
        .expect(201);
        expect(response.body.success).toBeTruthy();
        expect(response.body.data).toBeDefined();
      });
  
      it(' attendance already exist', async () => {
        const response = await request(app.getHttpServer())
          .post('/attendance')
          .send({
            date:"2024-01-10",
            dayOfWeek:"friday"
        })
        .expect(201);
        expect(response.body).toEqual({
          success: false,
          error: "Attendance for the given date already exists"
        });
      });
  
      it('should handle validation errors', async () => {
        const response = await request(app.getHttpServer())
          .post('/attendance')
          .send({
            date:"2024-01-09",
            dayOfWeek:"w"
        })    
         expect(response.body.success).toBeFalsy();
        expect(response.body.error).toBeDefined();
      });
    });
})
