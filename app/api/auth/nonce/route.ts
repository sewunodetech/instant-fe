import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildAuthMessage, signToken } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress || typeof walletAddress !== "string") {
      return errorResponse(400, "walletAddress is required");
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return errorResponse(400, "Invalid wallet address format");
    }

    const addr = walletAddress.toLowerCase();
    const nonce = randomUUID();
    const nonceExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.upsert({
      where: { walletAddress: addr },
      update: { nonce, nonceExpiresAt },
      create: { walletAddress: addr, nonce, nonceExpiresAt },
    });

    const message = buildAuthMessage(nonce, addr);

    return successResponse({
      nonce,
      message,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
