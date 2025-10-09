import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceUserResolver } from './attendance_user.resolver';
import { AttendanceUserService } from './attendance_user.service';
import { AttendanceUser } from '../typeorm/entities/attendance_user.entity';

describe('AttendanceUserResolver', () => {
  let resolver: AttendanceUserResolver;
  let service: AttendanceUserService;

  const mockAttendanceUserService = {
    findAttendanceUsers: jest.fn().mockResolvedValue([new AttendanceUser()]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceUserResolver,
        {
          provide: AttendanceUserService,
          useValue: mockAttendanceUserService,
        },
      ],
    }).compile();

    resolver = module.get<AttendanceUserResolver>(AttendanceUserResolver);
    service = module.get<AttendanceUserService>(AttendanceUserService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('attendanceUsers', () => {
    it('should return an array of attendance users', async () => {
      const result = [new AttendanceUser()];
      jest
        .spyOn(service, 'findAttendanceUsers')
        .mockImplementation(async () => result);

      expect(await resolver.attendanceUsers()).toBe(result);
    });
  });
});
