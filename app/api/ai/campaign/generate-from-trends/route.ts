import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { AIService } from "@/lib/services/ai.service";

/** POST /api/ai/campaign/generate-from-trends { topics } — drafts a brief; nothing is saved. */
export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedUser(request);
    const body = (await request.json().catch(() => ({}))) as { topics?: unknown };
    const topics = Array.isArray(body.topics)
      ? body.topics.filter((t): t is string => typeof t === "string" && t.trim().length > 0).slice(0, 10)
      : [];
    if (topics.length === 0) return errorResponse(400, "topics array is required");

    return successResponse(await AIService.generateFromTrends(topics));
  } catch (error) {
    return handleApiError(error);
  }
}
