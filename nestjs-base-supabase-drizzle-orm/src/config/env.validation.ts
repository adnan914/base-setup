import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import { assertTestDatabaseUrl } from '@/database/test-database-url';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @IsString()
  @IsNotEmpty()
  API_PREFIX = 'api';

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN = 'http://localhost:3000';

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  TEST_DATABASE_URL?: string;

  @IsBoolean()
  DATABASE_SSL = false;

  @IsBoolean()
  DATABASE_SSL_REJECT_UNAUTHORIZED = true;

  @IsInt()
  @Min(1)
  DATABASE_POOL_MAX = 10;

  @IsInt()
  @Min(1000)
  DATABASE_IDLE_TIMEOUT_MS = 30000;

  @IsInt()
  @Min(1000)
  DATABASE_CONNECTION_TIMEOUT_MS = 5000;

  @IsUrl({ require_tld: false })
  SUPABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  SUPABASE_SERVICE_ROLE_KEY: string;

  @IsBoolean()
  SWAGGER_ENABLED = true;

  @IsOptional()
  @IsString()
  LOG_LEVEL?: string;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const isTest = config.NODE_ENV === Environment.Test;
  const databaseUrl = isTest
    ? assertTestDatabaseUrl(config.TEST_DATABASE_URL as string | undefined)
    : config.DATABASE_URL;

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    {
      ...config,
      DATABASE_URL: databaseUrl,
      DATABASE_SSL: parseBoolean(
        config.DATABASE_SSL,
        config.NODE_ENV === Environment.Production,
      ),
      DATABASE_SSL_REJECT_UNAUTHORIZED: parseBoolean(
        config.DATABASE_SSL_REJECT_UNAUTHORIZED,
        true,
      ),
      SWAGGER_ENABLED: parseBoolean(config.SWAGGER_ENABLED, true),
    },
    {
      enableImplicitConversion: true,
    },
  );
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}

function parseBoolean(value: unknown, defaultValue: boolean) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  if (value === true || value === 'true' || value === '1') {
    return true;
  }

  if (value === false || value === 'false' || value === '0') {
    return false;
  }

  return value;
}
