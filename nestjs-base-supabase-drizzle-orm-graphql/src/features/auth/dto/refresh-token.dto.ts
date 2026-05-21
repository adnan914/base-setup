import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MESSAGES } from '@/shared/constants';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: MESSAGES.REFRESH_TOKEN_STRING })
  @IsNotEmpty({ message: MESSAGES.REFRESH_TOKEN_REQUIRED })
  refreshToken: string;
}
