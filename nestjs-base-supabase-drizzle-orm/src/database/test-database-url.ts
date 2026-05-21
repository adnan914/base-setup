export function assertTestDatabaseUrl(databaseUrl?: string) {
  if (!databaseUrl) {
    throw new Error('TEST_DATABASE_URL is required when NODE_ENV=test');
  }

  let databaseName: string;

  try {
    databaseName = new URL(databaseUrl).pathname.replace(/^\//, '');
  } catch {
    throw new Error('TEST_DATABASE_URL must be a valid Postgres URL');
  }

  if (!databaseName.toLowerCase().includes('test')) {
    throw new Error('E2E tests must use a database name containing "test"');
  }

  return databaseUrl;
}
