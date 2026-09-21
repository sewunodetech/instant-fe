import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { CampaignService } from "@/lib/services/campaign.service";
import { successResponse } from "@/lib/api-response";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthenticatedUser(_request);
    const { id } = await params;
    const campaign = await CampaignService.start(id);
    return successResponse(campaign);
  } catch (error) {
    return handleApiError(error);
  }
}
