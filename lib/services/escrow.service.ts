import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { HttpError } from "@/lib/api-response";
import {
  CHAIN_ID,
  INSTANT_FUN_ADDRESS,
  USDC_ADDRESS,
  isContractConfigured,
  toTokenUnits,
  uuidToBytes32,
} from "@/lib/contracts/instant-fun";
import type { TransactionIntent } from "@/lib/interfaces/blockchain.interface";

const MAX_PAYOUTS_PER_TX = 20;

/**
 * Brand campaign escrow. These methods only authorize and build the contract call; the brand's wallet
 * signs it, and ChainSyncService records the result from on-chain events.
 */
export class EscrowService {
  static async fundIntent(campaignId: string, userId: string, amount?: number): Promise<TransactionIntent> {
    const { campaign, brandWallet } = await loadOwnedBrandCampaign(campaignId, userId);
    if (campaign.escrowStatus === "CLOSED") throw new HttpError(400, "Escrow is already closed");
    if (!campaign.endsAt || campaign.endsAt <= new Date()) {
      throw new HttpError(400, "Campaign needs an end date in the future before it can be funded");
    }

    // First deposit defaults to the rest of the planned budget; later calls are explicit top-ups.
    const remainingBudget = new Prisma.Decimal(campaign.escrowBudget ?? 0).minus(campaign.escrowFunded);
    const value = amount ?? (remainingBudget.gt(0) ? remainingBudget.toNumber() : 0);
    if (!(value >= 1)) throw new HttpError(400, "Escrow deposit must be at least 1 USDC");
    if (value > 1_000_000) throw new HttpError(400, "Escrow deposit cannot exceed 1,000,000 USDC");

    const units = toTokenUnits(value).toString();
    return intent("fundEscrow", brandWallet, [
      uuidToBytes32(campaign.id),
      units,
      Math.floor(campaign.endsAt.getTime() / 1000).toString(),
    ], units);
  }

  static async payoutIntent(
    campaignId: string,
    userId: string,
    items: { postId: string; amount: number }[]
  ): Promise<TransactionIntent> {
    if (items.length === 0) throw new HttpError(400, "Choose at least one post to pay");
    if (items.length > MAX_PAYOUTS_PER_TX) {
      throw new HttpError(400, `At most ${MAX_PAYOUTS_PER_TX} payouts per transaction`);
    }
    const { campaign, brandWallet } = await loadOwnedBrandCampaign(campaignId, userId);
    if (campaign.escrowStatus !== "FUNDED") throw new HttpError(400, "Escrow is not funded");

    const posts = await prisma.post.findMany({
      where: { id: { in: items.map((i) => i.postId) }, campaignId },
      include: { user: { select: { walletAddress: true } } },
    });
    const byId = new Map(posts.map((p) => [p.id, p]));

    let total = new Prisma.Decimal(0);
    const creators: string[] = [];
    const postIds: string[] = [];
    const amounts: string[] = [];
    for (const item of items) {
      const post = byId.get(item.postId);
      if (!post) throw new HttpError(400, `Post ${item.postId} is not in this campaign`);
      if (post.userId === userId) throw new HttpError(400, "You cannot pay your own post");
      if (!post.user.walletAddress) throw new HttpError(400, "A selected creator has no wallet yet");
      if (!(item.amount >= 0.01)) throw new HttpError(400, "Each payout must be at least 0.01 USDC");
      total = total.plus(item.amount);
      creators.push(post.user.walletAddress);
      postIds.push(uuidToBytes32(post.id));
      amounts.push(toTokenUnits(item.amount).toString());
    }

    const balance = escrowBalance(campaign);
    if (total.gt(balance)) {
      throw new HttpError(400, `Payouts total ${total} USDC but only ${balance} USDC is left in escrow`);
    }

    const campaignKey = uuidToBytes32(campaign.id);
    return items.length === 1
      ? intent("payout", brandWallet, [campaignKey, creators[0], postIds[0], amounts[0]], null)
      : intent("payoutMany", brandWallet, [campaignKey, creators, postIds, amounts], null);
  }

  static async refundIntent(campaignId: string, userId: string): Promise<TransactionIntent> {
    const { campaign, brandWallet } = await loadOwnedBrandCampaign(campaignId, userId);
    if (campaign.escrowStatus !== "FUNDED") throw new HttpError(400, "Escrow is not funded");
    if (!campaign.endsAt || campaign.endsAt > new Date()) {
      throw new HttpError(400, "Unspent budget can be refunded once the campaign has ended");
    }
    return intent("refund", brandWallet, [uuidToBytes32(campaign.id)], null);
  }

  static async listPayouts(campaignId: string, page = 1, limit = 20) {
    const where = { campaignId };
    const [payouts, total] = await Promise.all([
      prisma.escrowPayout.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: { select: { id: true, walletAddress: true, username: true, displayName: true, avatarUrl: true } },
          post: { select: { id: true, imageUrl: true, caption: true } },
        },
      }),
      prisma.escrowPayout.count({ where }),
    ]);
    return { payouts, total };
  }
}

export function escrowBalance(c: {
  escrowFunded: Prisma.Decimal;
  escrowPaidOut: Prisma.Decimal;
  escrowRefunded: Prisma.Decimal;
}) {
  return new Prisma.Decimal(c.escrowFunded).minus(c.escrowPaidOut).minus(c.escrowRefunded);
}

async function loadOwnedBrandCampaign(campaignId: string, userId: string) {
  if (!isContractConfigured()) throw new HttpError(503, "Escrow contract is not configured");

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { creator: { select: { walletAddress: true } } },
  });
  if (!campaign) throw new HttpError(404, "Campaign not found");
  if (campaign.type !== "BRAND") throw new HttpError(400, "Only brand campaigns have an escrow");
  if (campaign.creatorId !== userId) throw new HttpError(403, "Only the brand that created this campaign can do this");

  const brandWallet = campaign.creator?.walletAddress;
  if (!brandWallet) throw new HttpError(400, "Connect a wallet before managing the escrow");
  return { campaign, brandWallet };
}

function intent(
  method: TransactionIntent["method"],
  from: string,
  args: TransactionIntent["args"],
  approveAmount: string | null
): TransactionIntent {
  return {
    chainId: CHAIN_ID,
    from,
    contractAddress: INSTANT_FUN_ADDRESS,
    tokenAddress: USDC_ADDRESS,
    method,
    args,
    approveAmount,
  };
}
