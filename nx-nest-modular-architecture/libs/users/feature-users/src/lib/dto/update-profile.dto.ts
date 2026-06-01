import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  PASSWORD_COMPLEXITY_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  VALIDATION_MESSAGES,
} from '@lib/core/common';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsString({ message: VALIDATION_MESSAGES.NAME_STRING })
  @MinLength(2, { message: VALIDATION_MESSAGES.NAME_MIN })
  @MaxLength(50, { message: VALIDATION_MESSAGES.NAME_MAX })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(PASSWORD_MIN_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_AT_LEAST })
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_COMPLEXITY_PATTERN, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  @IsOptional()
  password?: string;
}
