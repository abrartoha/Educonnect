/*
  Warnings:

  - You are about to drop the column `universityId` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConversationRead` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `targetId` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetRole` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_providerId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_userAId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_userBId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationRead" DROP CONSTRAINT "ConversationRead_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationRead" DROP CONSTRAINT "ConversationRead_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_universityId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropIndex
DROP INDEX "Lead_universityId_status_idx";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "universityId",
ADD COLUMN     "targetId" TEXT NOT NULL,
ADD COLUMN     "targetRole" "Role" NOT NULL;

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "ConversationRead";

-- DropTable
DROP TABLE "Meeting";

-- DropTable
DROP TABLE "Message";

-- DropEnum
DROP TYPE "BookingStatus";

-- CreateIndex
CREATE INDEX "Lead_targetId_status_idx" ON "Lead"("targetId", "status");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
