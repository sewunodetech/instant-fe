import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { CampaignService, type CampaignFilter } from "@/lib/services/campaign.service";
import { isAllowedImageUrl } from "@/lib/services/user.service";
import { errorResponse, handleApiError, paginatedResponse, successResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

const FILTERS: CampaignFilter[] = ["active", "ended", "all"];

/** GET /api/campaigns?status=active|ended|all&category= */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(params);
    const raw = (params.get("status") || "active").toLowerCase() as CampaignFilter;
    const filter = FILTERS.includes(raw) ? raw : "active";
    const { campaigns, total } = await CampaignService.list(filter, page, limit, params.get("category") || undefined);
    return paginatedResponse(campaigns, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (title.length < 3 || title.length > 60) return errorResponse(400, "Name must be 3–60 characters");

    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (description.length > 2000) return errorResponse(400, "Description must be at most 2000 characters");

    const category = typeof body.category === "string" ? body.category.trim().slice(0, 50) : "";

    if (body.rules !== undefined && !Array.isArray(body.rules)) return errorResponse(400, "Rules must be a list");
    const rules = ((body.rules as unknown[]) ?? [])
      .filter((r): r is string => typeof r === "string")
      .map((r) => r.trim())
      .filter(Boolean);
    if (rules.length > 10 || rules.some((r) => r.length > 140)) {
      return errorResponse(400, "Up to 10 rules, 140 characters each");
    }

    const durationDays = Number(body.durationDays);
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 30) {
      return errorResponse(400, "Duration must be 1–30 days");
    }

    const prizePool = body.prizePool === undefined ? 0 : Number(body.prizePool);
    if (!Number.isFinite(prizePool) || prizePool < 0 || prizePool > 100_000) {
      return errorResponse(400, "Prize pool must be between 0 and 100,000 USDC");
    }

    const maxPostsPerUser = body.maxPostsPerUser === undefined ? 3 : Number(body.maxPostsPerUser);
    if (!Number.isInteger(maxPostsPerUser) || maxPostsPerUser < 1 || maxPostsPerUser > 10) {
      return errorResponse(400, "Snaps per creator must be 1–10");
    }

    const coverImageUrl = typeof body.coverImageUrl === "string" ? body.coverImageUrl : undefined;
    if (coverImageUrl && !isAllowedImageUrl(coverImageUrl)) return errorResponse(400, "Invalid cover image");

    const campaign = await CampaignService.create(user.id, {
      title,
      description: description || undefined,
      category: category || undefined,
      rules,
      coverImageUrl,
      prizePool,
      maxPostsPerUser,
      durationDays,
    });
    return successResponse(campaign);
  } catch (error) {
    return handleApiError(error);
  }
}
