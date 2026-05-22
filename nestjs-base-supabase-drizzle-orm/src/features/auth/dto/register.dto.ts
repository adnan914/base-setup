import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { MESSAGES } from '@/shared/constants';
import { normalizeEmail } from '@/shared/utils/normalize-email';

export class RegisterDto {
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
    description: 'User first name',
    example: 'John',
  })
  @IsString({ message: MESSAGES.VALIDATION_FIRST_NAME_STRING })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString({ message: MESSAGES.VALIDATION_LAST_NAME_STRING })
  lastName: string;

  @ApiProperty({
    description: 'User password (minimum 12 characters)',
    example: 'Use-A-Long-Password-123',
    minLength: 12,
  })
  @IsString({ message: MESSAGES.VALIDATION_PASSWORD_STRING })
  @MinLength(12, { message: MESSAGES.VALIDATION_PASSWORD_MIN_LENGTH })
  password: string;
}
