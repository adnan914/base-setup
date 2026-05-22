import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AttendanceUserService } from './attendance_user.service';
import { CreateUserAttendanceDto } from './dtos/CreateUserAttendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Controller('attendance-users')
export class AttendanceUserController {
  constructor(private attendanceUserService: AttendanceUserService, private constant: ConstantConfig) {}

  @Get()
  getAttendanceUsers() {
    return this.buildResponse(this.attendanceUserService.findAttendanceUsers());
  }

  @Post()
  createAttendanceUser(
    @Body() createUserAttendanceDto: CreateUserAttendanceDto,
  ) {
    return this.buildResponse(
      this.attendanceUserService.createAttendanceUser(createUserAttendanceDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('markedby-update/:userId/:attendanceId')
  updateMarkedBy(
    @Param('userId') userId: number,
    @Param('attendanceId') attendanceId: number,
    @Req() req,
  ) {
    const changerUserId = req.user?.id;
    return this.buildResponse(
      this.attendanceUserService.updateMarkedBy(
        userId,
        attendanceId,
        changerUserId,
      ),
    );
  }

  private async buildResponse(methodPromise: Promise<any>) {
    try {
      const result = await methodPromise;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
