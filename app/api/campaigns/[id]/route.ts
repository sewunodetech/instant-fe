import { NextRequest } from "next/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { isAllowedImageUrl } from "@/lib/services/user.service";
import { getAuthenticatedUser, getOptionalUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";

export async function GET(request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]">) {
  try {
    const { id } = await params;
    const viewer = await getOptionalUser(request);
    const campaign = await CampaignService.getById(id, viewer?.id);
    if (!campaign) return errorResponse(404, "Campaign not found");
    return successResponse(campaign);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/campaigns/:id — host edits a live campaign.
 * Prize pool and snaps-per-creator can only go up; `extendDays` pushes the end date out.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data: Parameters<typeof CampaignService.update>[2] = {};

    if (body.title !== undefined) {
      const title = typeof body.title === "string" ? body.title.trim() : "";
      if (title.length < 3 || title.length > 60) return errorResponse(400, "Name must be 3–60 characters");
      data.title = title;
    }
    if (body.description !== undefined) {
      if (body.description !== null && (typeof body.description !== "string" || body.description.length > 2000)) {
        return errorResponse(400, "Description must be at most 2000 characters");
      }
      data.description = typeof body.description === "string" ? body.description.trim() || null : null;
    }
    if (body.category !== undefined) {
      data.category = typeof body.category === "string" ? body.category.trim().slice(0, 50) || null : null;
    }
    if (body.rules !== undefined) {
      if (!Array.isArray(body.rules)) return errorResponse(400, "Rules must be a list");
      const rules = body.rules
        .filter((r): r is string => typeof r === "string")
        .map((r) => r.trim())
        .filter(Boolean);
      if (rules.length > 10 || rules.some((r) => r.length > 140)) {
        return errorResponse(400, "Up to 10 rules, 140 characters each");
      }
      data.rules = rules;
    }
    if (body.coverImageUrl !== undefined) {
      if (body.coverImageUrl !== null && (typeof body.coverImageUrl !== "string" || !isAllowedImageUrl(body.coverImageUrl))) {
        return errorResponse(400, "Invalid cover image");
      }
      data.coverImageUrl = body.coverImageUrl as string | null;
    }
    if (body.prizePool !== undefined) {
      const prizePool = Number(body.prizePool);
      if (!Number.isFinite(prizePool) || prizePool < 0 || prizePool > 100_000) {
        return errorResponse(400, "Prize pool must be between 0 and 100,000 USDC");
      }
      data.prizePool = prizePool;
    }
    if (body.maxPostsPerUser !== undefined) {
      const max = Number(body.maxPostsPerUser);
      if (!Number.isInteger(max) || max < 1 || max > 10) return errorResponse(400, "Snaps per creator must be 1–10");
      data.maxPostsPerUser = max;
    }
    if (body.extendDays !== undefined && body.extendDays !== 0) {
      const days = Number(body.extendDays);
      if (!Number.isInteger(days) || days < 1 || days > 14) return errorResponse(400, "Extend by 1–14 days");
      data.extendDays = days;
    }

    return successResponse(await CampaignService.update(id, user.id, data));
  } catch (error) {
    return handleApiError(error);
  }
}
