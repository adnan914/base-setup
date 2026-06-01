export const SERVICE_NAMES = {
  auth: 'auth-service',
  user: 'user-service',
  apiGateway: 'api-gateway'
} as const;

export const GRPC_PACKAGES = {
  auth: 'auth',
  user: 'user'
} as const;

export const GRPC_SERVICES = {
  auth: 'AuthService',
  user: 'UserService'
} as const;

export const HEALTH_PATH = '/health';
export const METRICS_PATH = '/metrics';
