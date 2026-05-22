import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceUserController } from './attendance_user.controller';
import { AttendanceUserService } from './attendance_user.service';
import { AttendanceUser } from '../../typeorm/entities/attendance_user.entity';
import { AttendanceUserResolver } from './attendance_user.resolver';
import { User } from '../../typeorm/entities/user.entity';
import { Attendance } from '../../typeorm/entities/attendence.entity';
import { ConstantModule } from 'src/lib/constant/constant.module';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceUser, User, Attendance]),ConstantModule],
  controllers: [AttendanceUserController],
  providers: [AttendanceUserService, AttendanceUserResolver],
})
export class AttendanceUserModule {}
