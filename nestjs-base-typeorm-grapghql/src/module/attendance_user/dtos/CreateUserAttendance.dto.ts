import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateUserAttendanceDto {
  @IsInt({ message: 'User ID must be an integer' })
  @IsNotEmpty({ message: 'User ID is required' })
  user_id: number;

  @IsInt({ message: 'Attendance ID must be an integer' })
  @IsNotEmpty({ message: 'Attendance ID is required' })
  attendance_id: number;
}
