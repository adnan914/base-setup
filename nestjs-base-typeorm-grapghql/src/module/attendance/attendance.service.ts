import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../typeorm/entities/attendence.entity';
import { CreateAttendanceDto } from './dtos/CreateAttendance.dto';
import { ConstantConfig } from 'src/lib/constant/constant.config';
@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private constant:ConstantConfig
  ) {}
  async findAllAttendance(): Promise<Attendance[]> {
    return await this.attendanceRepository.find();
  }
  async attendanceIdExists(id: number): Promise<boolean> {
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        id,
      },
    });
    return !!existingAttendance;
  }

  async createAttendance(
    createAttendanceDto: CreateAttendanceDto,
  ): Promise<Attendance> {
    const { date } = createAttendanceDto;

    const attendanceExists = await this.attendanceRepository.findOne({
      where: {
        date: new Date(date),
      },
    });

    if (attendanceExists) {
      throw new ConflictException( this.constant.error.attendance.exists
      );
    }

    const newAttendance = this.attendanceRepository.create(createAttendanceDto);
    return await this.attendanceRepository.save(newAttendance);
  }
}
