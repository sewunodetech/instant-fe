import { NextRequest } from "next/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;

    const campaign = await CampaignService.findById(id);
    if (!campaign) return errorResponse(404, "Campaign not found");

    const creatorPost = await prisma.post.findFirst({
      where: { campaignId: id, userId: user.id },
    });
    if (!creatorPost) return errorResponse(403, "Not authorized to update this campaign");

    const body = await request.json();
    const { title, description, category, rules, maxPostsPerUser, startsAt, endsAt } = body;

    if (title !== undefined && (typeof title !== "string" || title.length < 3 || title.length > 200)) {
      return errorResponse(400, "Title must be between 3 and 200 characters");
    }

    const updated = await CampaignService.update(id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(rules !== undefined && { rules }),
      ...(maxPostsPerUser !== undefined && { maxPostsPerUser }),
      ...(startsAt !== undefined && { startsAt: new Date(startsAt) }),
      ...(endsAt !== undefined && { endsAt: new Date(endsAt) }),
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
