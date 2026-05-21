import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { assertTestDatabaseUrl } from './src/database/test-database-url';

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` });

const databaseUrl =
  process.env.NODE_ENV === 'test'
    ? assertTestDatabaseUrl(process.env.TEST_DATABASE_URL)
    : process.env.DATABASE_URL;

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl!,
  },
  strict: true,
  verbose: true,
});
