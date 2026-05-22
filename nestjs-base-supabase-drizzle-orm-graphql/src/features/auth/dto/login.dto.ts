import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MESSAGES } from '@/shared/constants';
import { normalizeEmail } from '@/shared/utils/email.util';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeEmail(value) : value,
  )
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
