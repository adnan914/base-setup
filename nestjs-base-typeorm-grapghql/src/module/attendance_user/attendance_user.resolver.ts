// src/attendance_user/attendance_user.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { AttendanceUserService } from './attendance_user.service';
import { AttendanceUser } from '../../typeorm/entities/attendance_user.entity';

@Resolver(() => AttendanceUser)
export class AttendanceUserResolver {
  constructor(private attendanceUserService: AttendanceUserService) {}

  @Query(() => [AttendanceUser])
  async attendanceUsers() {
    return this.attendanceUserService.findAttendanceUsers();
  }
}
