import { NextRequest } from "next/server";
import { getOptionalUser } from "@/lib/auth";
import { handleApiError, paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";
import { PostService, type FeedSort } from "@/lib/services/post.service";

/** GET /api/posts?sort=latest|top — snaps from live campaigns (home feed). */
export async function GET(request: NextRequest) {
  try {
    const viewer = await getOptionalUser(request);
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const sort: FeedSort = request.nextUrl.searchParams.get("sort") === "top" ? "top" : "latest";
    const { posts, total } = await PostService.feed({ sort, activeOnly: true, page, limit }, viewer?.id);
    return paginatedResponse(posts, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
