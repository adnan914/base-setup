import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { DatabaseService } from './database.service';
import { users } from './schema';
import { Role, Status } from '@/shared/enums';
import { MESSAGES } from '@/shared/constants';
import { normalizeEmail } from '@/shared/utils/email.util';

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` });

async function seed() {
  const databaseService = new DatabaseService(new ConfigService());
  const db = databaseService.db;

  const email = normalizeEmail(
    process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
  );
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const firstName = process.env.SEED_ADMIN_FIRST_NAME ?? 'Admin';
  const lastName = process.env.SEED_ADMIN_LAST_NAME ?? 'User';

  const [existingAdmin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingAdmin) {
    console.log(`${MESSAGES.SEED_ADMIN_EXISTS}: ${email}`);
    await databaseService.onModuleDestroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    email,
    firstName,
    lastName,
    password: hashedPassword,
    roles: [Role.ADMIN],
    status: Status.ACTIVE,
  });

  console.log(`${MESSAGES.SEED_ADMIN_CREATED}: ${email}`);
  await databaseService.onModuleDestroy();
}

seed().catch((error) => {
  console.error(MESSAGES.DATABASE_SEED_FAILED, error);
  process.exit(1);
});
