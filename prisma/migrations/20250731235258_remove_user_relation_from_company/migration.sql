/*
  Warnings:

  - You are about to drop the column `companyId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_companyId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "companyId";
