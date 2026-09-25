import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError, successResponse } from "@/lib/api-response";
import { CampaignService } from "@/lib/services/campaign.service";

/** POST /api/campaigns/:id/end — host closes voting and announces winners now. */
export async function POST(request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]/end">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    return successResponse(await CampaignService.end(id, user.id));
  } catch (error) {
    return handleApiError(error);
  }
}
