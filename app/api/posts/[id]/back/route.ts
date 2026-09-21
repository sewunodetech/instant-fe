import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { DonationService } from "@/lib/services/donation.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(_request);
    const { id: postId } = await params;
    const body = await _request.json().catch(() => ({}));
    const { amount } = body as { amount?: number };

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return errorResponse(400, "A positive donation amount is required");
    }

    const result = await DonationService.createDonationIntent(user.id, postId, amount);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
