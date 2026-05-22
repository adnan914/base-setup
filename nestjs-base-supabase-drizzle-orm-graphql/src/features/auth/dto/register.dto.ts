import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { MESSAGES } from '@/shared/constants';
import { normalizeEmail } from '@/shared/utils/email.util';

export class RegisterDto {
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
    description: 'User first name',
    example: 'John',
  })
  @IsString({ message: MESSAGES.FIRST_NAME_STRING })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString({ message: MESSAGES.LAST_NAME_STRING })
  lastName: string;

  @ApiProperty({
    description: 'User password (minimum 12 characters)',
    example: 'Use-A-Long-Password-123',
    minLength: 12,
  })
  @IsString({ message: MESSAGES.PASSWORD_STRING })
  @MinLength(12, { message: MESSAGES.PASSWORD_MIN_LENGTH })
  password: string;
}
