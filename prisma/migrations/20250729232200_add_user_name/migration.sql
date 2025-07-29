/*
  Warnings:

  - A unique constraint covering the columns `[creatorId]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "claimedById" TEXT,
ADD COLUMN     "claimedByUsername" TEXT,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tickets_creatorId_key" ON "tickets"("creatorId");
