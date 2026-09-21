import { NextRequest } from "next/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await CampaignService.findById(id);
    if (!campaign) return errorResponse(404, "Campaign not found");
    return successResponse(campaign);
  } catch (error) {
    return handleApiError(error);
  }
}
