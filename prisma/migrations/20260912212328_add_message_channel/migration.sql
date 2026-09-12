-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "channel" TEXT,
ALTER COLUMN "receiverId" DROP NOT NULL;

