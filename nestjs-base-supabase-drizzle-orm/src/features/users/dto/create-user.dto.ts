import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MESSAGES } from '@/shared/constants';
import { Role } from '@/shared/enums';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
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

  @ApiPropertyOptional({
    description: 'User roles',
    enum: Role,
    isArray: true,
    default: [Role.USER],
  })
  @IsOptional()
  @IsEnum(Role, { each: true, message: MESSAGES.VALIDATION_ROLE })
  roles?: Role[];
}
