import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError, successResponse } from "@/lib/api-response";
import { VoteService } from "@/lib/services/vote.service";

export async function POST(request: NextRequest, { params }: RouteContext<"/api/posts/[id]/vote">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    return successResponse(await VoteService.vote(user.id, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext<"/api/posts/[id]/vote">) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    return successResponse(await VoteService.unvote(user.id, id));
  } catch (error) {
    return handleApiError(error);
  }
}
