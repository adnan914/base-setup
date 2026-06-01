export const SERVICE_URL_ENV_KEYS = {
  auth: 'AUTH_SERVICE_URL',
  users: 'USER_SERVICE_URL',
} as const;

export const AUTH_ROUTE_PATTERNS = ['auth', 'auth/*path'] as const;
export const USER_ROUTE_PATTERNS = [
  'users',
  'users/*path',
  'profiles',
  'profiles/*path',
] as const;
export type ServiceUrlEnvKey =
  (typeof SERVICE_URL_ENV_KEYS)[keyof typeof SERVICE_URL_ENV_KEYS];
