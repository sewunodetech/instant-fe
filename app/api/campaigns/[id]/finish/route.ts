import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { CampaignFinishService } from "@/lib/services/campaign-finish.service";
import { successResponse } from "@/lib/api-response";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthenticatedUser(_request);
    const { id } = await params;
    const result = await CampaignFinishService.finishCampaign(id);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
