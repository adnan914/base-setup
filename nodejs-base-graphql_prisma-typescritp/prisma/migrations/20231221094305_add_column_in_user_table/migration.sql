-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
