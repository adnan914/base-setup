import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
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
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
