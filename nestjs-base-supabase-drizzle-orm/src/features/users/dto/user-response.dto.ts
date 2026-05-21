import { ApiProperty } from '@nestjs/swagger';
import { Role, Status } from '@/shared/enums';

export class UserResponseDto {
  @ApiProperty({
    example: '67e55044-10b1-426f-9247-bb680e5fe0c8',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', format: 'email' })
  email: string;

  @ApiProperty({ enum: Role, isArray: true, example: [Role.USER] })
  roles: Role[];

  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  status: Status;

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
  })
  profileImg: string | null;

  @ApiProperty({
    example: '2026-05-21T10:24:31.000Z',
    format: 'date-time',
    nullable: true,
  })
  lastLoginAt: Date | null;

  @ApiProperty({
    example: '2026-05-21T10:24:31.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-21T10:24:31.000Z',
    format: 'date-time',
  })
  updatedAt: Date;
}
