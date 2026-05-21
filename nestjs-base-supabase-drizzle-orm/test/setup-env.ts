process.env.NODE_ENV ??= 'test';
process.env.API_PREFIX ??= 'api/v1';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
process.env.JWT_SECRET ??= 'e2e-secret-that-is-long-enough-for-validation';
process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ??= '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ??= '7d';
process.env.TEST_DATABASE_URL ??=
  'postgresql://postgres:postgres@localhost:5433/nestjs_app_test';
process.env.DATABASE_SSL ??= 'false';
process.env.SUPABASE_URL ??= 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key';
process.env.SWAGGER_ENABLED ??= 'false';
