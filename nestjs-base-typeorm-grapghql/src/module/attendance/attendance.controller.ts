import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateAttendanceDto } from './dtos/CreateAttendance.dto';
import { AttendanceService } from './attendance.service';
import { ConstantConfig } from 'src/lib/constant/constant.config';
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService, private constant: ConstantConfig) {}
  @Get()
  async getAttendance() {
    try {
      const attendance = await this.attendanceService.findAllAttendance();
      return { success: true, data: attendance };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  @Post()
  async createAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
    try {
      const newAttendance =
      await this.attendanceService.createAttendance(createAttendanceDto);
      console.log(newAttendance)
      return { success: true, data: newAttendance };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
