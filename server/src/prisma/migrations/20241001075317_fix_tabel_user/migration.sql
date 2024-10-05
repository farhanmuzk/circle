/*
  Warnings:

  - You are about to drop the column `followers` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `following` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Made the column `avatar` on table `User` required. This step will fail if there are existing NULL values in that column.

*/

-- Update kolom avatar yang memiliki nilai NULL agar tidak gagal
UPDATE "User" SET "avatar" = 'default-avatar-url' WHERE "avatar" IS NULL;

-- Update kolom followers dan following menjadi 0 sebelum dihapus
UPDATE "User" SET "followers" = 0 WHERE "followers" IS NOT NULL;
UPDATE "User" SET "following" = 0 WHERE "following" IS NOT NULL;

-- Alter table setelah melakukan update
ALTER TABLE "User"
  DROP COLUMN "followers",
  DROP COLUMN "following",
  DROP COLUMN "name",
  ALTER COLUMN "avatar" SET NOT NULL,
  ALTER COLUMN "avatar" SET DEFAULT 'default-avatar-url',
  ALTER COLUMN "fullName" SET DEFAULT 'user_default';
