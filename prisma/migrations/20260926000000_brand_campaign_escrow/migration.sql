-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('COMMUNITY', 'BRAND');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('AWAITING_DEPOSIT', 'FUNDED', 'CLOSED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'ESCROW_DEPOSIT';
ALTER TYPE "TransactionType" ADD VALUE 'ESCROW_PAYOUT';
ALTER TYPE "TransactionType" ADD VALUE 'ESCROW_REFUND';

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "brandName" VARCHAR(100),
ADD COLUMN     "escrowBudget" DECIMAL(20,8),
ADD COLUMN     "escrowFunded" DECIMAL(20,8) NOT NULL DEFAULT 0,
ADD COLUMN     "escrowPaidOut" DECIMAL(20,8) NOT NULL DEFAULT 0,
ADD COLUMN     "escrowRefunded" DECIMAL(20,8) NOT NULL DEFAULT 0,
ADD COLUMN     "escrowStatus" "EscrowStatus",
ADD COLUMN     "type" "CampaignType" NOT NULL DEFAULT 'COMMUNITY';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "escrowPaidAmount" DECIMAL(20,8) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "EscrowPayout" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "postId" TEXT,
    "creatorId" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "token" VARCHAR(10) NOT NULL DEFAULT 'USDC',
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscrowPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EscrowPayout_campaignId_idx" ON "EscrowPayout"("campaignId");

-- CreateIndex
CREATE INDEX "EscrowPayout_postId_idx" ON "EscrowPayout"("postId");

-- CreateIndex
CREATE INDEX "EscrowPayout_creatorId_idx" ON "EscrowPayout"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowPayout_txHash_logIndex_key" ON "EscrowPayout"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "Campaign_type_idx" ON "Campaign"("type");

-- AddForeignKey
ALTER TABLE "EscrowPayout" ADD CONSTRAINT "EscrowPayout_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowPayout" ADD CONSTRAINT "EscrowPayout_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowPayout" ADD CONSTRAINT "EscrowPayout_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

