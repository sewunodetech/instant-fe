import { prisma } from "@/lib/prisma";
import { TrendProviderInterface, TrendData } from "@/lib/interfaces/trend-provider.interface";
import { HttpError } from "@/lib/api-response";

class MockTrendProvider implements TrendProviderInterface {
  async getCurrentTrends(): Promise<TrendData> {
    return {
      topics: ["OOTD", "streetwear", "rainy season", "campus outfit"],
      categories: ["fashion", "lifestyle"],
      hashtags: ["#ootd", "#streetwear", "#rainyseason"],
      source: "mock",
    };
  }
}

export class AIService {
  private static trendProvider: TrendProviderInterface = new MockTrendProvider();

  static setTrendProvider(provider: TrendProviderInterface) {
    this.trendProvider = provider;
  }

  static async generateCampaign(prompt?: string) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    if (!apiKey) {
      return this.generateMockCampaign(prompt);
    }

    try {
      const systemPrompt = `You are a social media campaign generator for Instant.fun, an on-chain social platform. Generate a campaign in JSON format with these exact fields:
{
  "title": "string - catchy campaign title",
  "description": "string - campaign description",
  "category": "string - campaign category (fashion, food, tech, art, lifestyle, etc)",
  "rules": ["string array of campaign rules"],
  "durationHours": number - campaign duration in hours
}

Return ONLY valid JSON, no markdown, no explanation.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://instant.fun",
          "X-Title": "Instant.fun",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt || "Generate a fun social media campaign" },
          ],
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      let generatedData;
      try {
        generatedData = JSON.parse(content);
      } catch {
        throw new HttpError(500, "Failed to parse AI response");
      }

      await prisma.aICampaignGeneration.create({
        data: {
          prompt: prompt || "Generate a fun social media campaign",
          model,
          generatedData,
        },
      });

      return generatedData;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      return this.generateMockCampaign(prompt);
    }
  }

  static async generateFromTrends(topics: string[]) {
    const prompt = `Generate a social campaign based on these trending topics: ${topics.join(", ")}`;
    return this.generateCampaign(prompt);
  }

  static async generateMockCampaign(prompt?: string) {
    const trendingTopics = await this.trendProvider.getCurrentTrends();
    const topics = trendingTopics.topics;

    const mockCampaigns = [
      {
        title: "Rainy Day OOTD",
        description: "Show your best outfit for a rainy day. No filters, just vibes.",
        category: "fashion",
        rules: ["No filters", "Maximum 3 photos", "Original photo only"],
        durationHours: 24,
      },
      {
        title: "Street Eats Challenge",
        description: "Capture the best street food near you. Be authentic!",
        category: "food",
        rules: ["Must be street food", "No restaurant photos", "Maximum 3 photos"],
        durationHours: 48,
      },
      {
        title: "Campus Life",
        description: "Show us your campus moments. Study, chill, explore.",
        category: "lifestyle",
        rules: ["Original photo only", "Must be on campus", "Maximum 3 photos"],
        durationHours: 72,
      },
    ];

    const selected = mockCampaigns[Math.floor(Math.random() * mockCampaigns.length)];

      await prisma.aICampaignGeneration.create({
        data: {
          prompt: prompt || `Generate campaign for topics: ${topics.join(", ")}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          trendContext: trendingTopics as any,
          model: "mock",
          generatedData: selected,
        },
      });

    return selected;
  }
}
