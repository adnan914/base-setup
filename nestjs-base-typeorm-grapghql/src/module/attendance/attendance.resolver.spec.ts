import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from '../typeorm/entities/attendence.entity';

describe('AttendanceResolver', () => {
  let resolver: AttendanceResolver;

  const mockAttendanceRepository = {
    // mock methods that your service uses
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceResolver,
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepository,
        },
      ],
    }).compile();

    resolver = module.get<AttendanceResolver>(AttendanceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
