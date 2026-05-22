// src/attendance/attendance.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { AttendanceService } from './attendance.service';
import { Attendance } from '../../typeorm/entities/attendence.entity';

@Resolver(() => Attendance)
export class AttendanceResolver {
  constructor(private attendanceService: AttendanceService) {}

  @Query(() => [Attendance])
  async attendances() {
    return this.attendanceService.findAllAttendance();
  }
}
