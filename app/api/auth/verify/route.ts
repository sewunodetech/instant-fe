import { NextRequest } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyToken } = body;

    if (!privyToken || typeof privyToken !== "string") {
      return errorResponse(400, "privyToken is required");
    }

    const { userId: privyId } = await privy.verifyAuthToken(privyToken);

    let walletAddress: string | undefined;
    try {
      const privyUser = await privy.getUser(privyId);
      const walletAccount = privyUser.linkedAccounts?.find(
        (a) => a.type === "wallet" && "address" in a && !!a.address,
      );
      const wallet =
        privyUser.wallet?.address ??
        (walletAccount && "address" in walletAccount
          ? walletAccount.address
          : undefined);
      if (wallet) walletAddress = wallet.toLowerCase();
    } catch {
      // Rate limits / missing wallet — provision without one
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

    return successResponse({
      user: {
        id: user.id,
        privyId: user.privyId,
        walletAddress: user.walletAddress,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
