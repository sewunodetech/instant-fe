import { NextRequest } from "next/server";
import { PostService } from "@/lib/services/post.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

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
