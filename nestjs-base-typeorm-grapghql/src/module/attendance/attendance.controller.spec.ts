import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, DayOfWeek } from './dtos/CreateAttendance.dto';
import { ConflictException } from '@nestjs/common';
class MockAttendanceService {
  findAllAttendance() {
    return [];
  }
  attendanceIdExists(attendance_id: number) {
    return attendance_id === 1;
  }
  createAttendance(createAttendanceDto: CreateAttendanceDto) {
    if (this.attendanceIdExists(1)) {
      throw new ConflictException('Attendance ID already exists');
    }
    return {
      id: 1,
      ...createAttendanceDto,
      created_at: new Date(),
    };
  }
}
describe('AttendanceController', () => {
  let controller: AttendanceController;
  let attendanceService: MockAttendanceService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useClass: MockAttendanceService,
        },
      ],
    }).compile();
    controller = module.get<AttendanceController>(AttendanceController);
    attendanceService = module.get<MockAttendanceService>(AttendanceService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(attendanceService).toBeDefined();
  });
  describe('getAttendance', () => {
    it('should return an array of attendance', async () => {
      const attendance = await controller.getAttendance();
      expect(attendance).toEqual({ success: true, data: [] });
    });
  });
  describe('createAttendance', () => {
    it('should create a new attendance', async () => {
      const createAttendanceDto: CreateAttendanceDto = {
        date: '2023-01-01',
        dayOfWeek: DayOfWeek.MONDAY,
      };
      jest
        .spyOn(attendanceService, 'attendanceIdExists')
        .mockReturnValue(false);
      jest.spyOn(attendanceService, 'createAttendance').mockReturnValue({
        id: 1,
        ...createAttendanceDto,
        created_at: new Date(),
      });
      const result = await controller.createAttendance(createAttendanceDto);
      expect(result).toEqual({
        success: true,
        data: { id: 1, ...createAttendanceDto, created_at: expect.any(Date) },
      });
    });
    it('should handle conflict if the attendance ID already exists', async () => {
      const createAttendanceDto: CreateAttendanceDto = {
        date: '2023-01-01',
        dayOfWeek: DayOfWeek.MONDAY,
      };
      jest.spyOn(attendanceService, 'attendanceIdExists').mockReturnValue(true);
      try {
        await controller.createAttendance(createAttendanceDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.response).toEqual({
          success: false,
          error: 'Attendance ID already exists',
        });
      }
    });
  });
});
