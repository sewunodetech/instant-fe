import { HttpError } from "@/lib/api-response";

export type CampaignDraft = {
  title: string;
  description: string;
  category: string;
  rules: string[];
  durationDays: number;
};

const SYSTEM_PROMPT = `You design photo challenges for instant.fun, a mobile app where people snap live photos for a themed campaign and the community votes; the top 3 snaps win the prize pool.
Return ONLY a JSON object with exactly these fields:
{
  "title": "catchy challenge name, max 40 characters, no hashtag",
  "description": "2-3 sentences explaining what to capture, max 300 characters",
  "category": "one word: lifestyle, food, travel, fashion, pets, sports, art, nature, city or friends",
  "rules": ["3 to 5 short rules, each under 100 characters"],
  "durationDays": integer between 3 and 14
}`;

function clampText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseDraft(content: string): CampaignDraft {
  const json = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new HttpError(502, "AI returned an unreadable draft. Try again.");
  }

  const title = clampText(raw.title, 60).replace(/^#/, "");
  if (title.length < 3) throw new HttpError(502, "AI draft was incomplete. Try again.");

  const days = Number(raw.durationDays ?? (Number(raw.durationHours) || 0) / 24);
  return {
    title,
    description: clampText(raw.description, 2000),
    category: clampText(raw.category, 50).toLowerCase(),
    rules: (Array.isArray(raw.rules) ? raw.rules : [])
      .map((r) => clampText(r, 140))
      .filter(Boolean)
      .slice(0, 5),
    durationDays: Number.isFinite(days) ? Math.min(30, Math.max(1, Math.round(days) || 7)) : 7,
  };
}

export class AIService {
  static get isConfigured() {
    return Boolean(process.env.OPENROUTER_API_KEY);
  }

  static async generateCampaign(prompt: string): Promise<CampaignDraft> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new HttpError(503, "AI drafting isn't available right now — fill the form manually.");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://instant.fun",
        "X-Title": "instant.fun",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(30_000),
    }).catch(() => null);

    if (!response?.ok) throw new HttpError(502, "AI drafting failed. Try again in a moment.");
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return parseDraft(data.choices?.[0]?.message?.content ?? "");
  }

  static async generateFromTrends(topics: string[]) {
    return this.generateCampaign(`Design a photo challenge around these trending topics: ${topics.join(", ")}`);
  }
}
