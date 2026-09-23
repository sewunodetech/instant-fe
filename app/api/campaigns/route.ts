import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { CampaignService } from "@/lib/services/campaign.service";
import { paginatedResponse, successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";
import { CampaignStatus } from "@/lib/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as CampaignStatus | null;
    const category = searchParams.get("category");

    const { campaigns, total } = await CampaignService.findAll(
      { status: status || undefined, category: category || undefined },
      page,
      limit
    );

    return paginatedResponse(campaigns, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedUser(request);
    const body = await request.json();
    const { title, description, category, rules, maxPostsPerUser, startsAt, endsAt } = body;

    if (!title || typeof title !== "string" || title.length < 3 || title.length > 200) {
      return errorResponse(400, "Title must be between 3 and 200 characters");
    }
    if (description && typeof description === "string" && description.length > 2000) {
      return errorResponse(400, "Description must be at most 2000 characters");
    }
    if (rules && !Array.isArray(rules)) {
      return errorResponse(400, "Rules must be an array of strings");
    }
    if (maxPostsPerUser && (typeof maxPostsPerUser !== "number" || maxPostsPerUser < 1)) {
      return errorResponse(400, "maxPostsPerUser must be a positive number");
    }
    if (startsAt && endsAt) {
      if (new Date(endsAt) <= new Date(startsAt)) {
        return errorResponse(400, "endsAt must be after startsAt");
      }
    }

    const campaign = await CampaignService.create({
      title,
      description,
      category,
      rules,
      maxPostsPerUser,
      startsAt,
      endsAt,
    });

    return successResponse(campaign);
  } catch (error) {
    return handleApiError(error);
  }
}
