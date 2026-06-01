import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_COMPLEXITY_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  Status,
  UserRole,
  VALIDATION_MESSAGES,
} from '@lib/core/common';

export enum AdminRoleName {
  SUPER_ADMIN = UserRole.SUPER_ADMIN,
  PLATFORM_ADMIN = UserRole.PLATFORM_ADMIN,
  SUPPORT_ADMIN = UserRole.SUPPORT_ADMIN,
  ADMIN = UserRole.ADMIN,
}

export const ADMIN_ROLE_NAMES = Object.values(AdminRoleName);

export enum AdminSortField {
  NAME = 'name',
  EMAIL = 'email',
  PHONE = 'phone',
  ROLE = 'role',
  STATUS = 'status',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class AdminListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: AdminSortField })
  @IsOptional()
  @IsEnum(AdminSortField)
  sortBy?: AdminSortField;

  @ApiPropertyOptional({ enum: SortOrder })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ enum: ADMIN_ROLE_NAMES })
  @IsOptional()
  @IsIn(ADMIN_ROLE_NAMES)
  role?: AdminRoleName;

  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class CreateAdminDto {
  @ApiProperty()
  @IsString({ message: VALIDATION_MESSAGES.NAME_STRING })
  @MinLength(2, { message: VALIDATION_MESSAGES.NAME_MIN })
  @MaxLength(50, { message: VALIDATION_MESSAGES.NAME_MAX })
  name: string;

  @ApiProperty()
  @IsEmail({}, { message: VALIDATION_MESSAGES.VALID_EMAIL_PROVIDE })
  @MaxLength(100, { message: 'Email can be at most 100 characters.' })
  email: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d+$/, { message: 'Phone number must contain digits only.' })
  @MaxLength(15, { message: 'Phone number can be at most 15 digits.' })
  phone: string;

  @ApiProperty({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH })
  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(PASSWORD_MIN_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_AT_LEAST })
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_COMPLEXITY_PATTERN, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  password: string;

  @ApiProperty({ enum: ADMIN_ROLE_NAMES })
  @IsIn(ADMIN_ROLE_NAMES)
  roleName: AdminRoleName;

  @ApiPropertyOptional({ enum: Status, default: Status.ACTIVE })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

}

export class UpdateAdminDto {
  @ApiPropertyOptional()
  @IsString({ message: VALIDATION_MESSAGES.NAME_STRING })
  @MinLength(2, { message: VALIDATION_MESSAGES.NAME_MIN })
  @MaxLength(50, { message: VALIDATION_MESSAGES.NAME_MAX })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Phone number must contain digits only.' })
  @MaxLength(15, { message: 'Phone number can be at most 15 digits.' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH })
  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(PASSWORD_MIN_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_AT_LEAST })
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_COMPLEXITY_PATTERN, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: ADMIN_ROLE_NAMES })
  @IsIn(ADMIN_ROLE_NAMES)
  @IsOptional()
  roleName?: AdminRoleName;

  @ApiPropertyOptional({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
