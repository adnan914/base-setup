import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from '../../typeorm/entities/attendence.entity';
import { AttendanceResolver } from './attendance.resolver';
import { ConstantModule } from 'src/lib/constant/constant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]),ConstantModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceResolver],
})
export class AttendanceModule {}
