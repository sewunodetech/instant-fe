import { NextRequest } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { toAppUser } from "@/lib/services/user.service";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

/**
 * POST /api/auth/verify { privyToken }
 * Provisions (or refreshes) the app user for a Privy session and links their EVM wallet.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { privyToken?: unknown };
    const { privyToken } = body;

    if (!privyToken || typeof privyToken !== "string") {
      return errorResponse(400, "privyToken is required");
    }

    const privyId = await privy
      .verifyAuthToken(privyToken)
      .then((claims) => claims.userId)
      .catch(() => null);
    if (!privyId) return errorResponse(401, "Invalid or expired session");

    let walletAddress: string | undefined;
    try {
      const privyUser = await privy.getUser(privyId);
      // Prefer the Privy embedded EVM wallet; fall back to any linked EVM wallet.
      const evmWallets = (privyUser.linkedAccounts ?? []).filter(
        (a): a is Extract<typeof a, { type: "wallet" }> =>
          a.type === "wallet" && "address" in a && /^0x[a-fA-F0-9]{40}$/.test(String(a.address))
      );
      const wallet = evmWallets.find((w) => w.walletClientType === "privy") ?? evmWallets[0];
      if (wallet) walletAddress = wallet.address.toLowerCase();
    } catch {
      // Rate limits / wallet not created yet — provision without one; the client re-syncs once it exists.
    }

    let user = await prisma.user.findUnique({ where: { privyId } });

    if (!user) {
      const taken = walletAddress
        ? await prisma.user.findUnique({ where: { walletAddress } })
        : null;
      user = await prisma.user.create({
        data: {
          privyId,
          ...(walletAddress && !taken ? { walletAddress } : {}),
        },
      });
    } else if (walletAddress && !user.walletAddress) {
      const taken = await prisma.user.findUnique({ where: { walletAddress } });
      if (!taken) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { walletAddress },
        });
      }
    }

    return successResponse({ user: toAppUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
