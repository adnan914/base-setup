import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceUserController } from './attendance_user.controller';
import { AttendanceUserService } from './attendance_user.service';
import { CreateUserAttendanceDto } from './dtos/CreateUserAttendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../typeorm/entities/user.entity';
import { AttendanceUser } from '../../typeorm/entities/attendance_user.entity';

describe('AttendanceUserController', () => {
  let controller: AttendanceUserController;
  let service: AttendanceUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceUserController],
      providers: [
        {
          provide: AttendanceUserService,
          useValue: {
            findAttendanceUsers: jest.fn(),
            createAttendanceUser: jest.fn(),
            updateMarkedBy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AttendanceUserController>(AttendanceUserController);
    service = module.get<AttendanceUserService>(AttendanceUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAttendanceUsers', () => {
    it('should return an array of attendance users', async () => {
      const result = [new AttendanceUser()];
      jest
        .spyOn(service, 'findAttendanceUsers')
        .mockImplementation(async () => result);

      expect(await controller.getAttendanceUsers()).toEqual({
        success: true,
        data: result,
      });
    });
  });

  describe('createAttendanceUser', () => {
    it('should successfully create an attendance user', async () => {
      const dto = new CreateUserAttendanceDto();
      const result = new AttendanceUser();
      jest
        .spyOn(service, 'createAttendanceUser')
        .mockImplementation(async () => result);

      expect(await controller.createAttendanceUser(dto)).toEqual({
        success: true,
        data: result,
      });
    });
  });

  describe('updateMarkedBy', () => {
    it('should successfully update the markedBy user', async () => {
      const userId = 1;
      const attendanceId = 1;
      const result = new AttendanceUser();
      const req = { user: { id: 2 } }; // Mock request object
      jest
        .spyOn(service, 'updateMarkedBy')
        .mockImplementation(async () => result);

      expect(
        await controller.updateMarkedBy(userId, attendanceId, req),
      ).toEqual({ success: true, data: result });
    });
  });

  describe('Error Handling in getAttendanceUsers', () => {
    it('should handle errors', async () => {
      jest
        .spyOn(service, 'findAttendanceUsers')
        .mockRejectedValue(new Error('Error occurred'));

      await expect(controller.getAttendanceUsers()).resolves.toEqual({
        success: false,
        message: 'Error occurred',
      });
    });
  });

  describe('Validation in createAttendanceUser', () => {
    it('should handle validation errors', async () => {
      const invalidDto = new CreateUserAttendanceDto();
      jest
        .spyOn(service, 'createAttendanceUser')
        .mockRejectedValue(new NotFoundException('Invalid data'));

      await expect(
        controller.createAttendanceUser(invalidDto),
      ).resolves.toEqual({
        success: false,
        message: 'Invalid data',
      });
    });
  });

  describe('Authorization in updateMarkedBy', () => {
    it('should handle unauthorized access', async () => {
      jest
        .spyOn(service, 'updateMarkedBy')
        .mockRejectedValue(new UnauthorizedException('Unauthorized'));

      const req = { user: { id: 2 } };
      await expect(controller.updateMarkedBy(1, 1, req)).resolves.toEqual({
        success: false,
        message: 'Unauthorized',
      });
    });
  });
});
