import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceUserService } from './attendance_user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceUser } from '../typeorm/entities/attendance_user.entity';
import { User, UserRole } from '../typeorm/entities/user.entity';
import { Attendance } from '../typeorm/entities/attendence.entity';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserAttendanceDto } from './dtos/CreateUserAttendance.dto';

describe('AttendanceUserService', () => {
  let service: AttendanceUserService;
  let userRepository: Repository<User>;
  let attendanceUserRepository: Repository<AttendanceUser>;
  let attendanceRepository: Repository<Attendance>;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockAttendanceUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAttendanceRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceUserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(AttendanceUser),
          useValue: mockAttendanceUserRepository,
        },
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepository,
        },
      ],
    }).compile();

    service = module.get<AttendanceUserService>(AttendanceUserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    attendanceUserRepository = module.get<Repository<AttendanceUser>>(
      getRepositoryToken(AttendanceUser),
    );
    attendanceRepository = module.get<Repository<Attendance>>(
      getRepositoryToken(Attendance),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAttendanceUsers', () => {
    it('should return an array of attendance users', async () => {
      const mockAttendanceUsers = []; // Replace with mock data
      mockAttendanceUserRepository.find.mockResolvedValue(mockAttendanceUsers);
      const result = await service.findAttendanceUsers();
      expect(result).toEqual(mockAttendanceUsers);
      expect(mockAttendanceUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('createAttendanceUser', () => {
    it('should successfully create a new attendance user', async () => {
      const dto = new CreateUserAttendanceDto();
      dto.user_id = 1;
      dto.attendance_id = 1;

      const newAttendanceUser = {}; // Replace with mock data
      mockUserRepository.findOne.mockResolvedValue(new User()); // Assuming a user is found
      mockAttendanceRepository.findOne.mockResolvedValue(new Attendance()); // Assuming an attendance is found
      mockAttendanceUserRepository.findOne.mockResolvedValue(null); // Assuming no conflict
      mockAttendanceUserRepository.create.mockReturnValue(newAttendanceUser);
      mockAttendanceUserRepository.save.mockResolvedValue(newAttendanceUser);

      const result = await service.createAttendanceUser(dto);
      expect(result).toEqual(newAttendanceUser);
      expect(mockAttendanceUserRepository.save).toHaveBeenCalledWith(
        newAttendanceUser,
      );
    });
    it('should throw a NotFoundException if user is not found', async () => {
      const dto: CreateUserAttendanceDto = { user_id: 1, attendance_id: 1 };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createAttendanceUser(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Additional tests for other error cases like attendance not found, conflict exception, etc.
  });

  describe('updateMarkedBy', () => {
    it('should successfully update the markedBy user', async () => {
      const userId = 1;
      const attendanceId = 1;
      const markedById = 2;

      const mockMarkingUser = new User();
      mockMarkingUser.role = UserRole.Manager;

      const mockUserInAttendance = new User();
      mockUserInAttendance.role = UserRole.Employee;

      const mockAttendanceUser = new AttendanceUser();
      mockAttendanceUser.user = mockUserInAttendance;
      mockAttendanceUser.markedBy = null;

      mockAttendanceUserRepository.findOne.mockResolvedValue(
        mockAttendanceUser,
      );
      mockUserRepository.findOne.mockResolvedValue(mockMarkingUser);
      mockAttendanceUserRepository.save.mockResolvedValue(mockAttendanceUser);

      const result = await service.updateMarkedBy(
        userId,
        attendanceId,
        markedById,
      );
      expect(result).toEqual(mockAttendanceUser);
      expect(mockAttendanceUserRepository.save).toHaveBeenCalledWith(
        mockAttendanceUser,
      );
    });

    it('should throw a NotFoundException if the attendance user is not found', async () => {
      mockAttendanceUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateMarkedBy(1, 1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a UnauthorizedException if the user is not authorized', async () => {
      const mockUser = new User();
      mockUser.role = UserRole.Employee;
      const mockAttendanceUser = new AttendanceUser();

      mockAttendanceUser.user = new User(); // Another user object, potentially with a different role
      mockAttendanceUserRepository.findOne.mockResolvedValue(
        mockAttendanceUser,
      );
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      mockAttendanceUser.user.role = UserRole.Employee; // Role that should not authorize

      mockUserRepository.findOne.mockResolvedValue(mockAttendanceUser.user);

      await expect(service.updateMarkedBy(1, 1, 2)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // Additional tests for createAttendanceUser error scenarios
  describe('createAttendanceUser Error Scenarios', () => {
    it('should throw a ConflictException for existing attendance user', async () => {
      const dto: CreateUserAttendanceDto = { user_id: 1, attendance_id: 1 };
      mockUserRepository.findOne.mockResolvedValue(new User());
      mockAttendanceRepository.findOne.mockResolvedValue(new Attendance());
      mockAttendanceUserRepository.findOne.mockResolvedValue(
        new AttendanceUser(),
      );

      await expect(service.createAttendanceUser(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw a NotFoundException if attendance is not found', async () => {
      const dto: CreateUserAttendanceDto = { user_id: 1, attendance_id: 1 };
      mockUserRepository.findOne.mockResolvedValue(new User());
      mockAttendanceRepository.findOne.mockResolvedValue(null);

      await expect(service.createAttendanceUser(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
