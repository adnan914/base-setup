import { ApiProperty } from '@nestjs/swagger';
import { Role, Status } from '@/shared/enums';

export class AuthUserResponseDto {
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
}

export class AuthTokensResponseDto {
  @ApiProperty({
    description: 'Short-lived JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Rotating JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class AuthSessionResponseDto extends AuthTokensResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}

export class LogoutResponseDataDto {
  @ApiProperty({ example: 'Logout successful' })
  message: string;
}
