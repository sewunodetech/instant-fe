import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { EscrowService } from "@/lib/services/escrow.service";

/** Build the `fundEscrow` call for the campaign's brand. Omit `amount` to deposit the rest of the planned budget. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { amount } = body as { amount?: unknown };

    if (amount !== undefined && (typeof amount !== "number" || !Number.isFinite(amount))) {
      return errorResponse(400, "amount must be a number");
    }

    const transaction = await EscrowService.fundIntent(id, user.id, amount as number | undefined);
    return successResponse({ transaction });
  } catch (error) {
    return handleApiError(error);
  }
}
