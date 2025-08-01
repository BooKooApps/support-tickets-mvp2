/*
  Warnings:

  - You are about to drop the column `ticketId` on the `reviews` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_ticketId_fkey";

-- DropIndex
DROP INDEX "reviews_ticketId_key";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "ticketId";

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
