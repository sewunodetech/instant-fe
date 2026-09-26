import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { ChainService } from "@/lib/services/chain.service";
import { successResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/wallet/balance
 * On-chain balance for the signed-in user's wallet: BNB first (the reward coin), USDC in USDC mode.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    try {
      const balance = await ChainService.getBalances(user.walletAddress);
      return successResponse(balance);
    } catch (chainError) {
      // On-chain read failed (RPC down, rate limit, etc.) — return a graceful
      // zero balance flagged as unavailable rather than a hard 500.
      console.error("Wallet balance read failed:", chainError);
      return successResponse(ChainService.unavailableBalance(user.walletAddress));
    }
  } catch (error) {
    return handleApiError(error);
  }
}
