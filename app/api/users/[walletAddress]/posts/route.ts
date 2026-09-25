import { NextRequest } from "next/server";
import { getOptionalUser } from "@/lib/auth";
import { PostService } from "@/lib/services/post.service";
import { UserService } from "@/lib/services/user.service";
import { errorResponse, handleApiError, paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

/** GET /api/users/:handle/posts — a creator's snaps, newest first. */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/users/[walletAddress]/posts">) {
  try {
    const { walletAddress: handle } = await params;
    const viewer = await getOptionalUser(request);
    const resolved = await UserService.resolveForViewer(handle, viewer?.id);
    if (!resolved) return errorResponse(404, "User not found");
    if (resolved.restricted) return errorResponse(403, "This account is private");

    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { posts, total } = await PostService.feed({ userId: resolved.user.id, page, limit }, viewer?.id);
    return paginatedResponse(posts, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
