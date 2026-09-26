import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { ChainSyncService } from "@/lib/services/chain-sync.service";

/**
 * Index an InstantFun transaction by hash. Everything else is read from the chain, so callers cannot
 * spoof amounts or recipients. Returns status PENDING until the receipt is mined — poll until it settles.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json().catch(() => ({}));
    const { txHash, donationId } = body as { txHash?: unknown; donationId?: unknown };

    if (!txHash || typeof txHash !== "string") {
      return errorResponse(400, "txHash is required");
    }
    if (donationId !== undefined && typeof donationId !== "string") {
      return errorResponse(400, "donationId must be a string");
    }

    const result = await ChainSyncService.sync(txHash, { userId: user.id, donationId });
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
