import { IsDateString, IsEnum } from 'class-validator';
import { DayOfWeek } from '../../../typeorm/entities/attendence.entity'; // Ensure the path is correct

export class CreateAttendanceDto {
  @IsDateString()
  date: string;
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;
}

export { DayOfWeek };
