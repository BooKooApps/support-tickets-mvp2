/*
  Warnings:

  - You are about to drop the column `agentId` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `claimedById` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `claimedByUsername` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "agentId",
DROP COLUMN "claimedById",
DROP COLUMN "claimedByUsername",
ALTER COLUMN "creatorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
