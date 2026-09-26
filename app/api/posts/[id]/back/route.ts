import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { DonationService } from "@/lib/services/donation.service";

/**
 * POST /api/posts/:id/back { amount }
 * Creates a pending support and returns the transfer (BNB or USDC) the client signs.
 */
export async function POST(request: NextRequest, { params }: RouteContext<"/api/posts/[id]/back">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id: postId } = await params;
    const body = (await request.json().catch(() => ({}))) as { amount?: unknown };
    if (typeof body.amount !== "number") return errorResponse(400, "A support amount is required");

    return successResponse(await DonationService.createIntent(user.id, postId, body.amount));
  } catch (error) {
    return handleApiError(error);
  }
}
