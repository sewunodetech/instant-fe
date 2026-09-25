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

/** An OpenAI-compatible chat-completions endpoint we can draft with. */
type Provider = {
  name: string;
  url: string;
  apiKey: string;
  model: string;
  headers?: Record<string, string>;
  extraBody?: Record<string, unknown>;
};

function listFromEnv(value: string | undefined, exclude: string) {
  return (value || "")
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m && m !== exclude);
}

/** Gemini (free tier via Google AI Studio) first, OpenRouter as backup. */
function providers(): Provider[] {
  const list: Provider[] = [];
  if (process.env.GEMINI_API_KEY) {
    list.push({
      name: "gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    });
  }
  if (process.env.OPENROUTER_API_KEY) {
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
    const fallbacks = listFromEnv(process.env.OPENROUTER_FALLBACK_MODELS, model);
    list.push({
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: process.env.OPENROUTER_API_KEY,
      model,
      headers: { "HTTP-Referer": "https://instant.fun", "X-Title": "instant.fun" },
      // OpenRouter tries these in order when the primary errors or is rate-limited.
      extraBody: fallbacks.length ? { models: fallbacks } : undefined,
    });
  }
  return list;
}

async function complete(provider: Provider, prompt: string) {
  const body = JSON.stringify({
    model: provider.model,
    ...provider.extraBody,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
  });

  let response: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    response = await fetch(provider.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
        ...provider.headers,
      },
      body,
      signal: AbortSignal.timeout(30_000),
    }).catch(() => null);
    if (response?.status !== 429 || attempt === 1) break;
    // One short retry, honouring Retry-After when it's small.
    const retryAfter = Number(response.headers.get("retry-after"));
    await new Promise((r) =>
      setTimeout(r, Number.isFinite(retryAfter) && retryAfter > 0 && retryAfter <= 5 ? retryAfter * 1000 : 1500)
    );
  }

  if (!response?.ok) {
    const detail = response ? (await response.text().catch(() => "")).slice(0, 300) : "network error";
    console.warn(`[ai] ${provider.name} request failed`, { status: response?.status, model: provider.model, detail });
    return { ok: false as const, status: response?.status ?? 0 };
  }
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return { ok: true as const, content: data.choices?.[0]?.message?.content ?? "" };
}

export class AIService {
  static get isConfigured() {
    return providers().length > 0;
  }

  static async generateCampaign(prompt: string): Promise<CampaignDraft> {
    const list = providers();
    if (list.length === 0) throw new HttpError(503, "AI drafting isn't available right now — fill the form manually.");

    let rateLimited = false;
    for (const provider of list) {
      const result = await complete(provider, prompt);
      if (result.ok) return parseDraft(result.content);
      rateLimited ||= result.status === 429;
    }

    if (rateLimited) {
      throw new HttpError(429, "The AI is busy right now. Wait a minute and try again, or fill the form manually.");
    }
    throw new HttpError(502, "AI drafting failed. Try again in a moment.");
  }

  static async generateFromTrends(topics: string[]) {
    return this.generateCampaign(`Design a photo challenge around these trending topics: ${topics.join(", ")}`);
  }
}
