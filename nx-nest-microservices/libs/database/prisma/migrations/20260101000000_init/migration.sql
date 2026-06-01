CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPPORT');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'PENDING');

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "refresh_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" TEXT NOT NULL,
  "user_agent" TEXT,
  "ip_address" TEXT,
  "revoked_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- Future partitioning preparation:
-- CREATE TABLE orders (...) PARTITION BY RANGE (created_at);
-- CREATE TABLE payments (...) PARTITION BY RANGE (created_at);
