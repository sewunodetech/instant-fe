import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError, successResponse } from "@/lib/api-response";
import { EscrowService } from "@/lib/services/escrow.service";

/** Build the `refund` call that returns unspent budget to the brand after the campaign ends. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    const transaction = await EscrowService.refundIntent(id, user.id);
    return successResponse({ transaction });
  } catch (error) {
    return handleApiError(error);
  }
}
