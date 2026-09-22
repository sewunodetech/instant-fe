import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { CampaignService } from "@/lib/services/campaign.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(_request);
    const { id } = await params;

    const campaign = await CampaignService.findById(id);
    if (!campaign) return errorResponse(404, "Campaign not found");

    const creatorPost = await prisma.post.findFirst({
      where: { campaignId: id, userId: user.id },
    });
    if (!creatorPost) return errorResponse(403, "Not authorized to start this campaign");

    const started = await CampaignService.start(id);
    return successResponse(started);
  } catch (error) {
    return handleApiError(error);
  }
}
