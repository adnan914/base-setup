import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { Role, Status, TokenType } from '@/shared/enums';

export const roleEnum = pgEnum('user_role', [Role.ADMIN, Role.USER]);
export const statusEnum = pgEnum('user_status', [
  Status.ACTIVE,
  Status.INACTIVE,
]);
export const tokenTypeEnum = pgEnum('token_type', [
  TokenType.ACCESS,
  TokenType.REFRESH,
  TokenType.FORGOTPASSWORD,
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 150 }).notNull(),
    password: text('password').notNull(),
    roles: roleEnum('roles')
      .array()
      .notNull()
      .default(sql`ARRAY['User']::user_role[]`),
    status: statusEnum('status').notNull().default(Status.ACTIVE),
    profileImg: varchar('profile_img', { length: 512 }),
    refreshToken: text('refresh_token'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    statusIdx: index('users_status_idx').on(table.status),
  }),
);

export const tokens = pgTable(
  'tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    token: text('token').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    used: boolean('used').default(false).notNull(),
    type: tokenTypeEnum('type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    tokenIdx: uniqueIndex('tokens_token_idx').on(table.token),
    userIdIdx: index('tokens_user_id_idx').on(table.userId),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PublicUser = Omit<User, 'password' | 'refreshToken'>;
export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;
