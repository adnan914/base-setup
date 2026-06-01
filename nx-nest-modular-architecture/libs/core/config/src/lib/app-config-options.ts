import { ConfigModuleOptions } from '@nestjs/config';

type ServiceKind =
  | 'gateway'
  | 'api'
  | 'auth'
  | 'user';

const COMMON_REQUIRED_KEYS = ['API_PREFIX'] as const;
const DATABASE_REQUIRED_KEYS = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USERNAME',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
] as const;
const JWT_REQUIRED_KEYS = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRATION',
  'JWT_REFRESH_EXPIRATION',
] as const;
const GATEWAY_REQUIRED_KEYS = [
  'AUTH_SERVICE_URL',
  'USER_SERVICE_URL',
] as const;
const NUMBER_ENV_KEYS = [
  'DATABASE_PORT',
  'PORT',
  'GATEWAY_PORT',
  'AUTH_SERVICE_PORT',
  'USER_SERVICE_PORT',
  'DATABASE_POOL_MAX',
  'DATABASE_POOL_MIN',
  'DATABASE_IDLE_TIMEOUT_MS',
  'DATABASE_CONNECTION_TIMEOUT_MS',
  'DATABASE_SLOW_QUERY_MS',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'AUTH_RATE_LIMIT_WINDOW_MS',
  'AUTH_RATE_LIMIT_MAX_REQUESTS',
  'GATEWAY_PROXY_TIMEOUT_MS',
  'GATEWAY_PROXY_RETRIES',
] as const;
const BOOLEAN_ENV_KEYS = ['DATABASE_SSL'] as const;
const SIZE_LIMIT_ENV_KEYS = ['BODY_SIZE_LIMIT'] as const;

export function createAppConfigModuleOptions(
  service: ServiceKind,
): ConfigModuleOptions {
  return {
    isGlobal: true,
    envFilePath: '.env',
    expandVariables: true,
    validate: (env: Record<string, string | undefined>) =>
      validateEnvironment(service, env),
  };
}

function validateEnvironment(
  service: ServiceKind,
  env: Record<string, string | undefined>,
) {
  const requiredKeys = new Set<string>(COMMON_REQUIRED_KEYS);

  if (service === 'gateway') {
    GATEWAY_REQUIRED_KEYS.forEach((key) => requiredKeys.add(key));
  }

  if (['api', 'auth', 'user'].includes(service)) {
    DATABASE_REQUIRED_KEYS.forEach((key) => requiredKeys.add(key));
    JWT_REQUIRED_KEYS.forEach((key) => requiredKeys.add(key));
  }

  const missingKeys = Array.from(requiredKeys).filter(
    (key) => !env[key] || env[key]?.trim() === '',
  );

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables for ${service}: ${missingKeys.join(', ')}`,
    );
  }

  validateNumericEnvironmentVariables(env);
  validateBooleanEnvironmentVariables(env);
  validateSizeLimitEnvironmentVariables(env);
  validateCorsEnvironment(service, env);

  if (env['TRUST_PROXY'] && !isValidTrustProxyValue(env['TRUST_PROXY'])) {
    throw new Error(
      'TRUST_PROXY must be true, false, a number, or a supported Express trust proxy value',
    );
  }

  return env;
}

function isValidTrustProxyValue(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (
    ['true', 'false', 'loopback', 'linklocal', 'uniquelocal'].includes(
      normalizedValue,
    )
  ) {
    return true;
  }

  return !Number.isNaN(Number(normalizedValue));
}

function validateNumericEnvironmentVariables(
  env: Record<string, string | undefined>,
) {
  NUMBER_ENV_KEYS.forEach((key) => {
    if (env[key] && Number.isNaN(Number(env[key]))) {
      throw new Error(`${key} must be a number`);
    }
  });

  if (
    env['DATABASE_POOL_MIN'] &&
    env['DATABASE_POOL_MAX'] &&
    Number(env['DATABASE_POOL_MIN']) > Number(env['DATABASE_POOL_MAX'])
  ) {
    throw new Error(
      'DATABASE_POOL_MIN cannot be greater than DATABASE_POOL_MAX',
    );
  }

  if (
    env['GATEWAY_PROXY_RETRIES'] &&
    Number(env['GATEWAY_PROXY_RETRIES']) < 0
  ) {
    throw new Error('GATEWAY_PROXY_RETRIES cannot be negative');
  }
}

function validateBooleanEnvironmentVariables(
  env: Record<string, string | undefined>,
) {
  BOOLEAN_ENV_KEYS.forEach((key) => {
    if (!env[key]) {
      return;
    }

    const normalizedValue = env[key].trim().toLowerCase();
    if (!['true', 'false'].includes(normalizedValue)) {
      throw new Error(`${key} must be true or false`);
    }
  });
}

function validateCorsEnvironment(
  service: ServiceKind,
  env: Record<string, string | undefined>,
) {
  const nodeEnv = (env['NODE_ENV'] || 'development').trim().toLowerCase();
  const corsOrigin = env['CORS_ORIGIN']?.trim();

  if (nodeEnv === 'production' && service === 'gateway' && !corsOrigin) {
    throw new Error(
      'CORS_ORIGIN is required for gateway in production environment',
    );
  }
}

function validateSizeLimitEnvironmentVariables(
  env: Record<string, string | undefined>,
) {
  SIZE_LIMIT_ENV_KEYS.forEach((key) => {
    if (!env[key]) {
      return;
    }

    const normalizedValue = env[key].trim().toLowerCase();
    if (!/^\d+(b|kb|mb)$/i.test(normalizedValue)) {
      throw new Error(`${key} must be a valid size like 256kb or 2mb`);
    }
  });
}
