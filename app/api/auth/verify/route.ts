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

    let user = await prisma.user.findUnique({ where: { privyId } });

    if (!user) {
      user = await prisma.user.create({
        data: { privyId },
      });
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
