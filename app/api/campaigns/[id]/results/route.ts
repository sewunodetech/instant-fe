import { NextRequest } from "next/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const results = await CampaignService.getCampaignResults(id);
    return successResponse(results);
  } catch (error) {
    return handleApiError(error);
  }
}
