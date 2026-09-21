import { NextRequest } from "next/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { PostService } from "@/lib/services/post.service";
import { paginatedResponse, successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { posts, total } = await CampaignService.getCampaignPosts(id, page, limit);
    return paginatedResponse(posts, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id: campaignId } = await params;
    const body = await request.json();
    const { imageUrl, caption } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return errorResponse(400, "imageUrl is required");
    }

    try {
      new URL(imageUrl);
    } catch {
      return errorResponse(400, "Invalid imageUrl format");
    }

    if (caption && typeof caption === "string" && caption.length > 500) {
      return errorResponse(400, "Caption must be at most 500 characters");
    }

    const post = await PostService.create(campaignId, user.id, imageUrl, caption);
    return successResponse(post);
  } catch (error) {
    return handleApiError(error);
  }
}
