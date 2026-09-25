import { NextRequest } from "next/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { isAllowedImageUrl } from "@/lib/services/user.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]">) {
  try {
    const { id } = await params;
    const campaign = await CampaignService.getById(id);
    if (!campaign) return errorResponse(404, "Campaign not found");
    return successResponse(campaign);
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/campaigns/:id — host edits the brief while the campaign is live. */
export async function PATCH(request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data: { description?: string; rules?: string[]; coverImageUrl?: string | null } = {};

    if (body.description !== undefined) {
      if (typeof body.description !== "string" || body.description.length > 2000) {
        return errorResponse(400, "Description must be at most 2000 characters");
      }
      data.description = body.description.trim();
    }
    if (body.rules !== undefined) {
      if (!Array.isArray(body.rules)) return errorResponse(400, "Rules must be a list");
      data.rules = body.rules.filter((r): r is string => typeof r === "string" && r.trim().length > 0).slice(0, 10);
    }
    if (body.coverImageUrl !== undefined) {
      if (body.coverImageUrl !== null && (typeof body.coverImageUrl !== "string" || !isAllowedImageUrl(body.coverImageUrl))) {
        return errorResponse(400, "Invalid cover image");
      }
      data.coverImageUrl = body.coverImageUrl as string | null;
    }

    return successResponse(await CampaignService.update(id, user.id, data));
  } catch (error) {
    return handleApiError(error);
  }
}
