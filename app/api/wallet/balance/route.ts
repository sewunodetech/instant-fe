import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { ChainService } from "@/lib/services/chain.service";
import { successResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/wallet/balance
 * Read-only on-chain USDC balance for the authenticated user's wallet (BSC testnet).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    try {
      const balance = await ChainService.getUsdcBalance(user.walletAddress);
      return successResponse(balance);
    } catch (chainError) {
      // On-chain read failed (RPC down, rate limit, etc.) — return a graceful
      // zero balance flagged as unavailable rather than a hard 500.
      console.error("Wallet balance read failed:", chainError);
      return successResponse(ChainService.emptyBalance(user.walletAddress), { onchainAvailable: false });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
