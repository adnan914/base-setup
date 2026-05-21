import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MESSAGES } from '@/shared/constants';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: MESSAGES.EMAIL_VALID })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Use-A-Long-Password-123',
  })
  @IsString({ message: MESSAGES.PASSWORD_STRING })
  @MinLength(12, { message: MESSAGES.PASSWORD_MIN_LENGTH })
  password: string;
}
