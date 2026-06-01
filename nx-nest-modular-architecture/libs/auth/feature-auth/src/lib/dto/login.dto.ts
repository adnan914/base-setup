import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_MIN_LENGTH, VALIDATION_MESSAGES } from '@lib/core/common';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_AT_LEAST })
  password: string;
}
