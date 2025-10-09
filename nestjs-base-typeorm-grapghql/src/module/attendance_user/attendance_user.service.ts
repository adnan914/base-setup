import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceUser } from '../../typeorm/entities/attendance_user.entity';
import { Repository } from 'typeorm';
import { User } from '../../typeorm/entities/user.entity';
import { CreateUserAttendanceDto } from './dtos/CreateUserAttendance.dto';
import { Attendance } from '../../typeorm/entities/attendence.entity';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Injectable()
export class AttendanceUserService {
  constructor(
    @InjectRepository(AttendanceUser)
    private attendanceUserRepository: Repository<AttendanceUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private constant: ConstantConfig
  ) {}

  async findAttendanceUsers() {
    return this.attendanceUserRepository.find({
      relations: ['user', 'attendance', 'markedBy'],
    });
  }

  async createAttendanceUser(
    dto: CreateUserAttendanceDto,
  ): Promise<AttendanceUser> {
    const { user_id, attendance_id } = dto;

    await this.validateUserAndAttendance(user_id, attendance_id);

    await this.checkExistingAttendanceUser(user_id, attendance_id);

    const attendanceUserData = {
      user: { id: user_id },
      attendance: { id: attendance_id },
    };

    const newAttendanceUser =
      this.attendanceUserRepository.create(attendanceUserData);
    return this.attendanceUserRepository.save(newAttendanceUser);
  }

  async updateMarkedBy(
    userId: number,
    attendanceId: number,
    markedById: number,
  ): Promise<AttendanceUser> {
    const attendanceUser = await this.findAttendanceUserByIds(
      userId,
      attendanceId,
    );

    const userWhoMarked = await this.validateMarkingUser(markedById);

    this.checkAuthorization(
      attendanceUser.user.role,
      userWhoMarked.role,
      markedById,
      attendanceUser.user.id,
    );

    attendanceUser.markedBy = userWhoMarked;
    return this.attendanceUserRepository.save(attendanceUser);
  }

  // Protected methods

  protected async validateUserAndAttendance(
    userId: number,
    attendanceId: number,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(this.constant.error.attendance.userNotFound + userId);
    }

    const attendance = await this.attendanceRepository.findOne({
      where: { id: attendanceId },
    });
    if (!attendance) {
      throw new NotFoundException(
        this.constant.error.attendance.attendaceNotFound + attendanceId);
    }
  }

  protected async checkExistingAttendanceUser(
    userId: number,
    attendanceId: number,
  ): Promise<void> {
    const existingAttendanceUser = await this.attendanceUserRepository.findOne({
      where: {
        user: { id: userId },
        attendance: { id: attendanceId },
      },
    });

    if (existingAttendanceUser) {
      throw new ConflictException(
        this.constant.error.attendance.userAndAttendance,
      );
    }
  }

  protected async findAttendanceUserByIds(
    userId: number,
    attendanceId: number,
  ): Promise<AttendanceUser> {
    const attendanceUser = await this.attendanceUserRepository.findOne({
      where: { user: { id: userId }, attendance: { id: attendanceId } },
      relations: ['user', 'markedBy'],
    });

    if (!attendanceUser) {
      throw new NotFoundException(this.constant.error.attendance.notFound);
    }

    return attendanceUser;
  }

  protected async validateMarkingUser(markedById: number): Promise<User> {
    const userWhoMarked = await this.userRepository.findOne({
      where: { id: markedById },
    });
    if (!userWhoMarked) {
      throw new NotFoundException(this.constant.error.attendance.markingUser);
    }

    return userWhoMarked;
  }

  protected checkAuthorization(
    userRole: string,
    markingUserRole: string,
    markedById: number,
    userId: number,
  ): void {
    switch (markingUserRole) {
      case 'manager':
        this.checkManagerAuthorization(userRole, markedById, userId);
        break;

      case 'lead':
        this.checkLeadAuthorization(userRole);
        break;

      default:
        throw new UnauthorizedException(this.constant.error.attendance.unauthorized);
    }
  }

  protected checkManagerAuthorization(
    userRole: string,
    markedById: number,
    userId: number,
  ): void {
    if (userRole === 'manager') {
      if (markedById === userId) {
        return; // Authorized
      }
    } else if (userRole === 'lead' || userRole === 'employee') {
      return; // Authorized
    }

    throw new UnauthorizedException(this.constant.error.attendance.unauthorized);
  }

  protected checkLeadAuthorization(userRole: string): void {
    if (userRole !== 'employee') {
      throw new UnauthorizedException(this.constant.error.attendance.unauthorized);
    }
  }
}
