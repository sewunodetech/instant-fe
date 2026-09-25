import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { AIService } from "@/lib/services/ai.service";

/**
 * POST /api/ai/campaign/generate { prompt }
 * Drafts a campaign brief. Nothing is saved — the host reviews and publishes via POST /api/campaigns.
 */
export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedUser(request);
    const body = (await request.json().catch(() => ({}))) as { prompt?: unknown };
    const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 400) : "";
    if (prompt.length < 8) return errorResponse(400, "Describe your idea in at least 8 characters");

    return successResponse(await AIService.generateCampaign(prompt));
  } catch (error) {
    return handleApiError(error);
  }
}
