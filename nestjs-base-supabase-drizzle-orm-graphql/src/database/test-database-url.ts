import { MESSAGES } from '@/shared/constants';

export function assertTestDatabaseUrl(databaseUrl?: string) {
  if (!databaseUrl) {
    throw new Error(MESSAGES.TEST_DATABASE_URL_REQUIRED);
  }

  let databaseName: string;

  try {
    databaseName = new URL(databaseUrl).pathname.replace(/^\//, '');
  } catch {
    throw new Error(MESSAGES.TEST_DATABASE_URL_INVALID);
  }

  if (!databaseName.toLowerCase().includes('test')) {
    throw new Error(MESSAGES.TEST_DATABASE_NAME_REQUIRED);
  }

  return databaseUrl;
}
