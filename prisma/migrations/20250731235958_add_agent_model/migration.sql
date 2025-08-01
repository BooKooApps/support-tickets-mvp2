/*
  Warnings:

  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "settings";

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL DEFAULT 'Support Agent',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Thank you for contacting support. How can we help you today?',
    "autoMessage" TEXT NOT NULL DEFAULT 'We''ve received your ticket and will respond shortly.',
    "reminderMessage" TEXT NOT NULL DEFAULT 'Hi! Just checking in on your support ticket. Do you need any additional help?',
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderHours" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
