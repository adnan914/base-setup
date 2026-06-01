import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  API_GATEWAY_PORT?: number;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL!: string;

  @IsOptional()
  @IsString()
  AUTH_GRPC_URL?: string;

  @IsOptional()
  @IsString()
  USER_GRPC_URL?: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsNumber()
  REDIS_PORT?: number;

  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true, protocols: ['nats'] })
  NATS_URL?: string;

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsNumber()
  @Min(10)
  BCRYPT_ROUNDS?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  RATE_LIMIT_TTL?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  RATE_LIMIT_LIMIT?: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}
