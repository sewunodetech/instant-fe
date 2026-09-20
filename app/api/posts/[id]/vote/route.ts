import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { VoteService } from "@/lib/services/vote.service";
import { successResponse } from "@/lib/api-response";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(_request);
    const { id } = await params;
    await VoteService.vote(user.id, id);
    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(_request);
    const { id } = await params;
    await VoteService.unvote(user.id, id);
    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
