import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {
  PASSWORD_COMPLEXITY_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  VALIDATION_MESSAGES,
} from "@lib/core/common";
export class CreateUserDto {
  @ApiProperty()
  @IsEmail({}, { message: VALIDATION_MESSAGES.VALID_EMAIL_PROVIDE })
  @MaxLength(70, { message: VALIDATION_MESSAGES.EMAIL_MAX })
  email: string;

  @ApiProperty()
  @IsString({ message: VALIDATION_MESSAGES.NAME_STRING })
  @MinLength(2, { message: VALIDATION_MESSAGES.NAME_MIN })
  @MaxLength(50, { message: VALIDATION_MESSAGES.NAME_MAX })
  name: string;

  @ApiProperty({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH })
  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(PASSWORD_MIN_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_AT_LEAST })
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_COMPLEXITY_PATTERN, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  password: string;

  @ApiProperty()
  @IsUUID("4", { message: VALIDATION_MESSAGES.ROLE_ID_UUID })
  roleId: string;
}
