import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { ChainService } from "@/lib/services/chain.service";
import { successResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/wallet/transfers?limit=20
 * Read-only recent USDC Transfer history for the authenticated user's wallet (BSC testnet).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const limitParam = Number(new URL(request.url).searchParams.get("limit"));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 20;

    try {
      const transfers = await ChainService.getUsdcTransfers(user.walletAddress, limit);
      return successResponse(transfers, { onchainAvailable: true });
    } catch (chainError) {
      console.error("Wallet transfers read failed:", chainError);
      return successResponse([], { onchainAvailable: false });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
