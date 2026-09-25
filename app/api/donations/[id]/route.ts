import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { DonationService } from "@/lib/services/donation.service";

/** POST /api/donations/:id { txHash } — verify the signed transfer on-chain. */
export async function POST(request: NextRequest, { params }: RouteContext<"/api/donations/[id]">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { txHash?: unknown };
    if (typeof body.txHash !== "string") return errorResponse(400, "txHash is required");

    return successResponse(await DonationService.confirm(id, user.id, body.txHash));
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/donations/:id — discard an intent that was never signed. */
export async function DELETE(request: NextRequest, { params }: RouteContext<"/api/donations/[id]">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    await DonationService.cancel(id, user.id);
    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
