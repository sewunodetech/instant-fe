import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWalletSignature, signToken, buildAuthMessage } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature } = body;

    if (!walletAddress || typeof walletAddress !== "string") {
      return errorResponse(400, "walletAddress is required");
    }
    if (!signature || typeof signature !== "string") {
      return errorResponse(400, "signature is required");
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return errorResponse(400, "Invalid wallet address format");
    }

    const addr = walletAddress.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { walletAddress: addr },
    });

    if (!user) {
      return errorResponse(404, "User not found. Please request a nonce first.");
    }

    if (user.nonceExpiresAt < new Date()) {
      return errorResponse(401, "Nonce expired. Please request a new nonce.");
    }

    const expectedMessage = buildAuthMessage(user.nonce, addr);
    const isValid = verifyWalletSignature(expectedMessage, signature, walletAddress);

    if (!isValid) {
      return errorResponse(401, "Invalid signature");
    }

    const newNonce = crypto.randomUUID();
    await prisma.user.update({
      where: { id: user.id },
      data: { nonce: newNonce, nonceExpiresAt: new Date() },
    });

    const token = await signToken({
      userId: user.id,
      walletAddress: user.walletAddress,
    });

    return successResponse({
      accessToken: token,
      user: {
        id: user.id,
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
