import { NextRequest } from "next/server";
import { getAuthenticatedUser, getOptionalUser } from "@/lib/auth";
import { PostService } from "@/lib/services/post.service";
import { isAllowedImageUrl } from "@/lib/services/user.service";
import { errorResponse, handleApiError, paginatedResponse, successResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

/** GET /api/campaigns/:id/posts?sort=latest|top */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]/posts">) {
  try {
    const { id } = await params;
    const viewer = await getOptionalUser(request);
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const sort = request.nextUrl.searchParams.get("sort") === "top" ? "top" : "latest";
    const [{ posts, total }, remainingSnaps] = await Promise.all([
      PostService.feed({ campaignId: id, sort, page, limit }, viewer?.id),
      viewer ? PostService.remainingSnaps(id, viewer.id) : null,
    ]);
    return paginatedResponse(posts, total, page, limit, { remainingSnaps });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]/posts">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id: campaignId } = await params;
    const body = (await request.json().catch(() => ({}))) as { imageUrl?: unknown; caption?: unknown };

    if (typeof body.imageUrl !== "string" || !isAllowedImageUrl(body.imageUrl)) {
      return errorResponse(400, "A valid image is required");
    }
    if (body.caption !== undefined && body.caption !== null && typeof body.caption !== "string") {
      return errorResponse(400, "Caption must be text");
    }
    const caption = typeof body.caption === "string" ? body.caption.trim() : "";
    if (caption.length > 500) return errorResponse(400, "Caption must be at most 500 characters");

    const post = await PostService.create(campaignId, user.id, body.imageUrl, caption || undefined);
    return successResponse(post);
  } catch (error) {
    return handleApiError(error);
  }
}
