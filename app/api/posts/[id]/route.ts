import { NextRequest } from "next/server";
import { PostService } from "@/lib/services/post.service";
import { getAuthenticatedUser, getOptionalUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";

export async function GET(request: NextRequest, { params }: RouteContext<"/api/posts/[id]">) {
  try {
    const { id } = await params;
    const viewer = await getOptionalUser(request);
    const post = await PostService.getById(id, viewer?.id);
    if (!post) return errorResponse(404, "Snap not found");
    return successResponse(post);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext<"/api/posts/[id]">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    await PostService.delete(id, user.id);
    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
