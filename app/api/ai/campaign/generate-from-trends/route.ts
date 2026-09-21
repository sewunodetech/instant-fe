import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { AIService } from "@/lib/services/ai.service";
import { CampaignService } from "@/lib/services/campaign.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedUser(request);
    const body = await request.json();
    const { topics } = body as { topics?: string[] };

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return errorResponse(400, "topics array is required");
    }

    const generated = await AIService.generateFromTrends(topics);

    const campaign = await CampaignService.create({
      title: generated.title,
      description: generated.description,
      category: generated.category,
      rules: generated.rules,
      maxPostsPerUser: 3,
    });

    return successResponse({ generated, campaign });
  } catch (error) {
    return handleApiError(error);
  }
}
