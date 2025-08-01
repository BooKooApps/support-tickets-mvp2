/*
  Warnings:

  - You are about to drop the column `experienceId` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `experienceId` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `experienceId` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `experienceId` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `tickets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "settings_experienceId_userId_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "experienceId",
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "username";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "experienceId",
DROP COLUMN "username",
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "experienceId";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "experienceId",
DROP COLUMN "username",
ADD COLUMN     "companyId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_userId_key" ON "settings"("userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
