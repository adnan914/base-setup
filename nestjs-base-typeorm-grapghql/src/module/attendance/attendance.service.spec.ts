import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { Attendance } from '../typeorm/entities/attendence.entity';
import { CreateAttendanceDto } from './dtos/CreateAttendance.dto';
import { DayOfWeek } from '../typeorm/entities/attendence.entity';
import { ConflictException } from '@nestjs/common';
describe('AttendanceService', () => {
  let service: AttendanceService;
  const mockAttendanceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepository,
        },
      ],
    }).compile();
    service = module.get<AttendanceService>(AttendanceService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createAttendance', () => {
    it('should create attendance successfully', async () => {
      const createAttendanceDto: CreateAttendanceDto = {
        date: '2023-01-01',
        dayOfWeek: DayOfWeek.MONDAY,
      };
      mockAttendanceRepository.findOne.mockResolvedValue(null); // No existing attendance on this date
      mockAttendanceRepository.create.mockReturnValue(createAttendanceDto);
      mockAttendanceRepository.save.mockResolvedValue(createAttendanceDto);

      const result = await service.createAttendance(createAttendanceDto);
      expect(result).toEqual(createAttendanceDto);
      expect(mockAttendanceRepository.create).toHaveBeenCalledWith(
        createAttendanceDto,
      );
      expect(mockAttendanceRepository.save).toHaveBeenCalledWith(
        createAttendanceDto,
      );
    });

    it('should throw ConflictException if attendance for the given date already exists', async () => {
      const createAttendanceDto: CreateAttendanceDto = {
        date: '2023-01-01',
        dayOfWeek: DayOfWeek.MONDAY,
      };
      mockAttendanceRepository.findOne.mockResolvedValue(createAttendanceDto); // Existing attendance on this date
      await expect(
        service.createAttendance(createAttendanceDto),
      ).rejects.toThrow(ConflictException);

      mockAttendanceRepository.findOne.mockResolvedValue(createAttendanceDto); // Existing attendance on this date

      await expect(
        service.createAttendance(createAttendanceDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  // Additional test cases for findAllAttendance method
});
