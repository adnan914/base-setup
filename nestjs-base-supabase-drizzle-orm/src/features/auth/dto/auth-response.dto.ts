import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '@/features/users/dto/user-response.dto';

export class AuthTokensResponseDto {
  @ApiProperty({
    description: 'JWT access token used in the Bearer Authorization header.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token used to rotate the access token pair.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class AuthSessionResponseDto extends AuthTokensResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;
}
