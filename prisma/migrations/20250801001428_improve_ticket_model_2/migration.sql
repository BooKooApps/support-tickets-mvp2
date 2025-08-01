/*
  Warnings:

  - Made the column `creatorId` on table `tickets` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_creatorId_fkey";

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "creatorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
