import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, Status } from '@/shared/enums';

export class UserResponseDto {
  @ApiProperty({ example: '5443be70-a277-4af6-a678-7b1787d19496' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ enum: Role, isArray: true, example: [Role.USER] })
  roles: Role[];

  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  status: Status;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/users/john.png',
    nullable: true,
  })
  profileImg: string | null;

  @ApiPropertyOptional({
    example: '2026-05-22T12:00:00.000Z',
    format: 'date-time',
    nullable: true,
  })
  lastLoginAt: Date | null;

  @ApiProperty({ example: '2026-05-22T12:00:00.000Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-22T12:00:00.000Z', format: 'date-time' })
  updatedAt: Date;
}
