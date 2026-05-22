import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { MESSAGES } from '@/shared/constants';
import { normalizeEmail } from '@/shared/utils/normalize-email';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeEmail(value) : value,
  )
  @IsEmail({}, { message: MESSAGES.VALIDATION_EMAIL })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Use-A-Long-Password-123',
    minLength: 12,
  })
  @IsString({ message: MESSAGES.VALIDATION_PASSWORD_STRING })
  @MinLength(12, { message: MESSAGES.VALIDATION_PASSWORD_MIN_LENGTH })
  password: string;
}
