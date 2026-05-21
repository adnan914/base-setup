import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
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

export const authSessions = pgTable(
  'auth_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    refreshTokenId: uuid('refresh_token_id').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedReason: varchar('revoked_reason', { length: 100 }),
    userAgent: varchar('user_agent', { length: 512 }),
    ipAddress: varchar('ip_address', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    refreshTokenIdIdx: uniqueIndex('auth_sessions_refresh_token_id_idx').on(
      table.refreshTokenId,
    ),
    userIdIdx: index('auth_sessions_user_id_idx').on(table.userId),
    expiresAtIdx: index('auth_sessions_expires_at_idx').on(table.expiresAt),
  }),
);

export const rateLimits = pgTable(
  'rate_limits',
  {
    key: text('key').notNull(),
    throttlerName: varchar('throttler_name', { length: 100 }).notNull(),
    totalHits: integer('total_hits').default(0).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    blockExpiresAt: timestamp('block_expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    keyIdx: uniqueIndex('rate_limits_key_throttler_name_idx').on(
      table.key,
      table.throttlerName,
    ),
    expiresAtIdx: index('rate_limits_expires_at_idx').on(table.expiresAt),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PublicUser = Omit<User, 'password'>;
export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;
export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;
