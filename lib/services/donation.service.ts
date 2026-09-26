import { ethers } from "ethers";
import { prisma } from "@/lib/prisma";
import { CampaignStatus, DonationStatus } from "@/lib/generated/prisma/client";
import { HttpError } from "@/lib/api-response";
import { ChainService } from "@/lib/services/chain.service";
import { publicUserSelect, toNumber } from "@/lib/serializers";
import type { DonationConfirmResult, DonationIntent } from "@/lib/types";
import { COIN, IS_NATIVE, MAX_SUPPORT, MIN_SUPPORT, amount as fmt } from "@/lib/currency";

const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;

/** Raw on-chain units for a support amount (wei for BNB, token units for USDC). */
async function toRaw(value: number, token: string) {
  if (token !== "USDC") return ethers.parseEther(value.toFixed(8));
  const decimals = await ChainService.getTokenDecimals();
  return ethers.parseUnits(value.toFixed(Math.min(decimals, 6)), decimals);
}

/**
 * Support ("tip") flow without a smart contract: the supporter signs a plain
 * transfer (BNB by default, or USDC) to the creator's wallet from their Privy
 * wallet, then the server verifies it on-chain before counting it.
 */
export class DonationService {
  static async createIntent(userId: string, postId: string, amount: number): Promise<DonationIntent> {
    if (!Number.isFinite(amount) || amount < MIN_SUPPORT) {
      throw new HttpError(400, `Minimum support is ${fmt(MIN_SUPPORT)} ${COIN}`);
    }
    if (amount > MAX_SUPPORT) throw new HttpError(400, `Maximum support is ${fmt(MAX_SUPPORT)} ${COIN}`);
    if (!IS_NATIVE && !ChainService.isConfigured) throw new HttpError(503, "USDC support isn't available yet");

    const [post, supporter] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId },
        include: { campaign: true, user: { select: { walletAddress: true } } },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { walletAddress: true } }),
    ]);
    if (!post) throw new HttpError(404, "Snap not found");
    if (post.userId === userId) throw new HttpError(400, "You can't support your own snap");
    if (post.campaign.status !== CampaignStatus.ACTIVE) throw new HttpError(400, "This campaign has ended");
    if (!post.user.walletAddress) throw new HttpError(400, "This creator hasn't set up a wallet yet");
    if (!supporter?.walletAddress) throw new HttpError(400, "Your wallet isn't ready yet — reopen the app and try again");

    const token = IS_NATIVE ? COIN : "USDC";
    const amountRaw = await toRaw(amount, token);
    const decimals = IS_NATIVE ? 18 : await ChainService.getTokenDecimals();

    const donation = await prisma.donation.create({
      data: {
        campaignId: post.campaignId,
        postId,
        userId,
        amount,
        token,
        status: DonationStatus.PENDING,
      },
    });

    return {
      donation: { id: donation.id, amount, status: donation.status },
      transfer: {
        kind: IS_NATIVE ? "native" : "token",
        to: ethers.getAddress(post.user.walletAddress),
        tokenAddress: IS_NATIVE ? null : ChainService.tokenAddress,
        decimals,
        chainId: ChainService.chainId,
        amountRaw: amountRaw.toString(),
      },
    };
  }

  static async confirm(donationId: string, userId: string, txHash: string): Promise<DonationConfirmResult> {
    if (!TX_HASH_RE.test(txHash)) throw new HttpError(400, "Invalid transaction hash");

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        user: { select: { walletAddress: true } },
        post: { select: { id: true, user: { select: { walletAddress: true } } } },
      },
    });
    if (!donation || donation.userId !== userId) throw new HttpError(404, "Support not found");

    if (donation.status === DonationStatus.CONFIRMED) {
      const post = await prisma.post.findUnique({
        where: { id: donation.postId },
        select: { id: true, donationCount: true, donationAmount: true },
      });
      return { status: "CONFIRMED", post: post ? { ...post, donationAmount: toNumber(post.donationAmount) } : undefined };
    }
    if (donation.status === DonationStatus.FAILED) return { status: "FAILED" };
    if (donation.txHash && donation.txHash !== txHash) throw new HttpError(409, "Support already linked to another transaction");

    const reused = await prisma.donation.findUnique({ where: { txHash }, select: { id: true } });
    if (reused && reused.id !== donation.id) throw new HttpError(409, "Transaction already used");

    if (!donation.txHash) {
      await prisma.donation.update({ where: { id: donation.id }, data: { txHash } });
    }

    const from = donation.user.walletAddress;
    const to = donation.post.user.walletAddress;
    if (!from || !to) throw new HttpError(400, "Wallet missing for this support");

    // Verify with the coin recorded on the donation, so switching config never breaks old intents.
    const minRaw = await toRaw(toNumber(donation.amount), donation.token);
    const check =
      donation.token === "USDC"
        ? await ChainService.verifyUsdcTransfer({ hash: txHash, from, to, minAmountRaw: minRaw })
        : await ChainService.verifyNativeTransfer({ hash: txHash, from, to, minWei: minRaw });

    if (check.status === "pending") return { status: "PENDING" };
    if (check.status === "failed") {
      await prisma.donation.update({ where: { id: donation.id }, data: { status: DonationStatus.FAILED } });
      throw new HttpError(400, check.reason);
    }

    const post = await prisma.$transaction(async (tx) => {
      const { count } = await tx.donation.updateMany({
        where: { id: donation.id, status: DonationStatus.PENDING },
        data: { status: DonationStatus.CONFIRMED, blockNumber: BigInt(check.blockNumber) },
      });
      if (count === 0) {
        return tx.post.findUniqueOrThrow({
          where: { id: donation.postId },
          select: { id: true, donationCount: true, donationAmount: true },
        });
      }
      await tx.transaction.create({
        data: {
          txHash,
          chainId: ChainService.chainId,
          userId: donation.userId,
          campaignId: donation.campaignId,
          type: "DONATION",
          status: "CONFIRMED",
          amount: donation.amount,
          token: donation.token,
          blockNumber: BigInt(check.blockNumber),
        },
      });
      return tx.post.update({
        where: { id: donation.postId },
        data: { donationCount: { increment: 1 }, donationAmount: { increment: donation.amount } },
        select: { id: true, donationCount: true, donationAmount: true },
      });
    });

    return { status: "CONFIRMED", post: { ...post, donationAmount: toNumber(post.donationAmount) } };
  }

  /** Confirmed supports, newest first. */
  static async list(where: { campaignId?: string; postId?: string; userId?: string }, page = 1, limit = 20) {
    const filter = { ...where, status: DonationStatus.CONFIRMED };
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          postId: true,
          campaignId: true,
          amount: true,
          token: true,
          txHash: true,
          createdAt: true,
          user: { select: publicUserSelect },
        },
      }),
      prisma.donation.count({ where: filter }),
    ]);
    return { donations: donations.map((d) => ({ ...d, amount: toNumber(d.amount) })), total };
  }

  /** Supporter closed the wallet prompt — drop the unsent intent. */
  static async cancel(donationId: string, userId: string) {
    await prisma.donation.deleteMany({
      where: { id: donationId, userId, status: DonationStatus.PENDING, txHash: null },
    });
  }
}
