export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  gateway: {
    port: parseInt(process.env.API_GATEWAY_PORT ?? '3000', 10)
  },
  grpc: {
    authUrl: process.env.AUTH_GRPC_URL ?? 'auth-service:50051',
    userUrl: process.env.USER_GRPC_URL ?? 'user-service:50052'
  },
  database: {
    url: process.env.DATABASE_URL
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'redis',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10)
  },
  nats: {
    url: process.env.NATS_URL ?? 'nats://nats:4222'
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL ?? '900s',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d'
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT ?? '100', 10)
  }
});
