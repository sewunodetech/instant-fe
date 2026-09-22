import { NextRequest } from "next/server";
import { PostService } from "@/lib/services/post.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await PostService.findById(id);
    if (!post) return errorResponse(404, "Post not found");
    return successResponse(post);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    await PostService.delete(id, user.id);
    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
