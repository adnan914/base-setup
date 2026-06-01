export const DEFAULT_API_PREFIX = 'api';
export const DEFAULT_BODY_SIZE_LIMIT = '1mb';
export const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60000;
export const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 120;
export const DEFAULT_AUTH_RATE_LIMIT_MAX_REQUESTS = 10;
export const DEFAULT_GATEWAY_PROXY_TIMEOUT_MS = 5000;
export const DEFAULT_GATEWAY_PROXY_RETRIES = 1;

export const LOCAL_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
] as const;

export const DEFAULT_SWAGGER_VERSION = '1.0';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;
export const PASSWORD_COMPLEXITY_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
