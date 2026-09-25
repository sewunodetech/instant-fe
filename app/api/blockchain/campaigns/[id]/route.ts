import { NextRequest } from "next/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/** @deprecated Same payload as GET /api/campaigns/:id. */
export async function GET(_request: NextRequest, { params }: RouteContext<"/api/blockchain/campaigns/[id]">) {
  try {
    const { id } = await params;
    const campaign = await CampaignService.getById(id);
    if (!campaign) return errorResponse(404, "Campaign not found");
    return successResponse(campaign);
  } catch (error) {
    return handleApiError(error);
  }
}
