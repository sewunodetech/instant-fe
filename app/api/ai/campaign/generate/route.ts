import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { AIService } from "@/lib/services/ai.service";
import { CampaignService } from "@/lib/services/campaign.service";
import { successResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedUser(request);
    const body = await request.json().catch(() => ({}));
    const { prompt } = body as { prompt?: string };

    const generated = await AIService.generateCampaign(prompt);

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
