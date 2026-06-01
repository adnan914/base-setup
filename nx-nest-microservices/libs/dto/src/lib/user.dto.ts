import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RoleDto {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT'
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(RoleDto)
  role?: RoleDto;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(RoleDto)
  role?: RoleDto;
}
