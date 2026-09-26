import { prisma } from "@/lib/prisma";
import { Prisma, TransactionType } from "@/lib/generated/prisma/client";
import { HttpError } from "@/lib/api-response";
import { CHAIN_ID, TOKEN_SYMBOL, bytes32ToUuid, fromTokenUnits } from "@/lib/contracts/instant-fun";
import type { InstantFunEvent } from "@/lib/interfaces/blockchain.interface";
import { BlockchainService } from "./blockchain.service";

type TxClient = Prisma.TransactionClient;
type Ctx = { tx: TxClient; txHash: string; blockNumber: bigint; donationId?: string };

export type SyncResult =
  | { status: "PENDING"; txHash: string }
  | { status: "FAILED"; txHash: string }
  | {
      status: "CONFIRMED";
      txHash: string;
      type: TransactionType;
      campaignId: string | null;
      alreadyProcessed: boolean;
    };

const TX_HASH_RE = /^0x[0-9a-f]{64}$/;

const EVENT_TYPE: Record<InstantFunEvent["name"], TransactionType> = {
  SupportSent: TransactionType.DONATION,
  EscrowFunded: TransactionType.ESCROW_DEPOSIT,
  EscrowPaid: TransactionType.ESCROW_PAYOUT,
  EscrowRefunded: TransactionType.ESCROW_REFUND,
};

/**
 * Indexes InstantFun transactions into the database. The chain is the source of truth: the client only
 * hands us a tx hash, and every amount, sender and recipient is read back from the receipt's events.
 * Idempotent — a hash is processed once (Transaction.txHash is unique).
 */
export class ChainSyncService {
  static async sync(rawHash: string, opts: { userId: string; donationId?: string }): Promise<SyncResult> {
    const txHash = rawHash.toLowerCase();
    if (!TX_HASH_RE.test(txHash)) throw new HttpError(400, "Invalid transaction hash");

    const existing = await prisma.transaction.findUnique({ where: { txHash } });
    if (existing?.status === "CONFIRMED") {
      return { status: "CONFIRMED", txHash, type: existing.type, campaignId: existing.campaignId, alreadyProcessed: true };
    }

    const receipt = await BlockchainService.getInstantFunReceipt(txHash);
    if (receipt.status === "pending") return { status: "PENDING", txHash };
    if (receipt.status === "failed") {
      if (opts.donationId) {
        await prisma.donation.updateMany({
          where: { id: opts.donationId, userId: opts.userId, status: "PENDING" },
          data: { status: "FAILED" },
        });
      }
      return { status: "FAILED", txHash };
    }
    if (receipt.events.length === 0) {
      throw new HttpError(422, "Transaction has no instant.fun contract events");
    }

    const type = EVENT_TYPE[receipt.events[0].name];
    const total = receipt.events.reduce((sum, e) => sum + e.amount, BigInt(0));

    try {
      const campaignId = await prisma.$transaction(async (tx: TxClient) => {
        const ctx: Ctx = { tx, txHash, blockNumber: BigInt(receipt.blockNumber), donationId: opts.donationId };
        let campaignId: string | null = null;
        for (const event of receipt.events) {
          campaignId = await applyEvent(ctx, event);
        }

        const sender = await tx.user.findUnique({ where: { walletAddress: receipt.from } });
        await tx.transaction.create({
          data: {
            txHash,
            chainId: CHAIN_ID,
            userId: sender?.id ?? null,
            campaignId,
            type,
            status: "CONFIRMED",
            amount: fromTokenUnits(total),
            token: TOKEN_SYMBOL,
            blockNumber: ctx.blockNumber,
            metadata: { events: receipt.events.map((e) => ({ name: e.name, logIndex: e.logIndex })) },
          },
        });
        return campaignId;
      });
      return { status: "CONFIRMED", txHash, type, campaignId, alreadyProcessed: false };
    } catch (error) {
      // Lost a race with a concurrent sync of the same hash — it has been indexed, nothing left to do.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const row = await prisma.transaction.findUnique({ where: { txHash } });
        if (row) return { status: "CONFIRMED", txHash, type: row.type, campaignId: row.campaignId, alreadyProcessed: true };
      }
      throw error;
    }
  }
}

function applyEvent(ctx: Ctx, event: InstantFunEvent): Promise<string> {
  switch (event.name) {
    case "SupportSent":
      return applySupport(ctx, event);
    case "EscrowFunded":
      return applyEscrowFunded(ctx, event);
    case "EscrowPaid":
      return applyEscrowPaid(ctx, event);
    case "EscrowRefunded":
      return applyEscrowRefunded(ctx, event);
  }
}

async function findPost(tx: TxClient, postIdBytes: string) {
  const postId = bytes32ToUuid(postIdBytes);
  const post = postId
    ? await tx.post.findUnique({ where: { id: postId }, include: { user: { select: { walletAddress: true } } } })
    : null;
  if (!post) throw new HttpError(422, "Transaction references a post that does not exist");
  return post;
}

async function findBrandCampaign(tx: TxClient, campaignIdBytes: string, brand: string) {
  const campaignId = bytes32ToUuid(campaignIdBytes);
  const campaign = campaignId
    ? await tx.campaign.findUnique({ where: { id: campaignId }, include: { creator: { select: { walletAddress: true } } } })
    : null;
  if (!campaign || campaign.type !== "BRAND") {
    throw new HttpError(422, "Transaction references a brand campaign that does not exist");
  }
  // Escrows are keyed by (brand, campaignId) on-chain; only the campaign owner's escrow counts.
  if (campaign.creator?.walletAddress?.toLowerCase() !== brand) {
    throw new HttpError(422, "Escrow belongs to a wallet that does not own this campaign");
  }
  return campaign;
}

async function applySupport(ctx: Ctx, e: Extract<InstantFunEvent, { name: "SupportSent" }>) {
  const { tx, txHash, blockNumber } = ctx;
  const post = await findPost(tx, e.postId);
  // Anyone can call support() with any postId; only count it if the money reached the post's creator.
  if (post.user.walletAddress?.toLowerCase() !== e.creator) {
    throw new HttpError(422, "Support was not sent to this post's creator wallet");
  }
  const supporter = await tx.user.findUnique({ where: { walletAddress: e.supporter } });
  if (!supporter) throw new HttpError(422, "Supporter wallet is not linked to an instant.fun account");

  const amount = fromTokenUnits(e.amount);
  // Prefer the intent the client told us about, else the oldest matching intent, else record it fresh.
  const match = { postId: post.id, userId: supporter.id, status: "PENDING" as const, txHash: null };
  const pending =
    (ctx.donationId && (await tx.donation.findFirst({ where: { id: ctx.donationId, ...match } }))) ||
    (await tx.donation.findFirst({ where: { ...match, amount }, orderBy: { createdAt: "asc" } }));

  if (pending) {
    await tx.donation.update({
      where: { id: pending.id },
      data: { status: "CONFIRMED", txHash, blockNumber, amount },
    });
  } else {
    await tx.donation.create({
      data: {
        campaignId: post.campaignId,
        postId: post.id,
        userId: supporter.id,
        amount,
        token: TOKEN_SYMBOL,
        status: "CONFIRMED",
        txHash,
        blockNumber,
      },
    });
  }

  await tx.post.update({
    where: { id: post.id },
    data: { donationCount: { increment: 1 }, donationAmount: { increment: amount } },
  });
  return post.campaignId;
}

async function applyEscrowFunded(ctx: Ctx, e: Extract<InstantFunEvent, { name: "EscrowFunded" }>) {
  const campaign = await findBrandCampaign(ctx.tx, e.campaignId, e.brand);
  const now = new Date();
  await ctx.tx.campaign.update({
    where: { id: campaign.id },
    data: {
      escrowFunded: { increment: fromTokenUnits(e.amount) },
      escrowStatus: "FUNDED",
      endsAt: new Date(Number(e.endsAt) * 1000),
      // A brand campaign goes live the moment its budget is locked.
      ...(campaign.status === "DRAFT" && { status: "ACTIVE", startsAt: campaign.startsAt ?? now }),
    },
  });
  return campaign.id;
}

async function applyEscrowPaid(ctx: Ctx, e: Extract<InstantFunEvent, { name: "EscrowPaid" }>) {
  const { tx, txHash, blockNumber } = ctx;
  const campaign = await findBrandCampaign(tx, e.campaignId, e.brand);
  const post = await findPost(tx, e.postId);
  if (post.campaignId !== campaign.id) throw new HttpError(422, "Paid post is not part of this campaign");
  if (post.user.walletAddress?.toLowerCase() !== e.creator) {
    throw new HttpError(422, "Payout was not sent to this post's creator wallet");
  }

  const amount = fromTokenUnits(e.amount);
  await tx.escrowPayout.create({
    data: {
      campaignId: campaign.id,
      postId: post.id,
      creatorId: post.userId,
      amount,
      token: TOKEN_SYMBOL,
      txHash,
      logIndex: e.logIndex,
      blockNumber,
    },
  });
  await tx.campaign.update({ where: { id: campaign.id }, data: { escrowPaidOut: { increment: amount } } });
  await tx.post.update({ where: { id: post.id }, data: { escrowPaidAmount: { increment: amount } } });
  return campaign.id;
}

async function applyEscrowRefunded(ctx: Ctx, e: Extract<InstantFunEvent, { name: "EscrowRefunded" }>) {
  const campaign = await findBrandCampaign(ctx.tx, e.campaignId, e.brand);
  await ctx.tx.campaign.update({
    where: { id: campaign.id },
    data: {
      escrowRefunded: { increment: fromTokenUnits(e.amount) },
      escrowStatus: "CLOSED",
      status: "ENDED",
    },
  });
  return campaign.id;
}
