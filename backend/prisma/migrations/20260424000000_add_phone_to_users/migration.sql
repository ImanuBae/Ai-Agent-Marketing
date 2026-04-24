-- AlterTable: add optional phone column to users (idempotent)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
