import type { ApiCampaign, ApiPost } from "@/lib/types";
import type { Campaign as MockCampaign, Snap as MockSnap } from "@/lib/mock-data";

const HERO_FALLBACKS = [
  { img: "/mock/campaign-summer-hero.jpg", alt: "Friends at a sunny outdoor cafe" },
  { img: "/mock/campaigns/city-life.jpg", alt: "Neon-lit city street" },
  { img: "/mock/campaigns/foodie-moment.jpg", alt: "Colorful food bowl" },
  { img: "/mock/campaigns/best-friends.jpg", alt: "Two friends at golden hour" },
];

function hashId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function daysUntil(iso: string | null | undefined) {
  if (!iso) return 7;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

function toTag(title: string) {
  const cleaned = title.replace(/^#/, "").replace(/\s+/g, "");
  return `#${cleaned.slice(0, 24) || "Challenge"}`;
}

function creatorHandle(user?: ApiPost["user"]) {
  if (user?.username) return user.username;
  if (user?.walletAddress) {
    const w = user.walletAddress;
    return `${w.slice(0, 6)}…${w.slice(-4)}`.toLowerCase();
  }
  return "creator";
}

function creatorName(user?: ApiPost["user"]) {
  return user?.displayName || user?.username || "Creator";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function mapApiCampaign(c: ApiCampaign, fallbackIndex = 0): MockCampaign {
  const hero = HERO_FALLBACKS[fallbackIndex % HERO_FALLBACKS.length];
  const daysLeft = daysUntil(c.endsAt);
  const h = hashId(c.id);
  const cover = `/mock/campaigns/${["summer-vibes", "city-life", "foodie-moment", "best-friends"][h % 4]}.jpg`;

  return {
    id: c.id,
    tag: toTag(c.title),
    // Only brand campaigns have real money attached (their escrow); community campaigns have no pool.
    poolUsdc: c.type === "BRAND" ? Number(c.escrowFunded ?? 0) : 0,
    daysLeft,
    dot: c.status === "ACTIVE" ? (daysLeft <= 3 ? "live" : "blue") : "muted",
    kind: c.type === "BRAND" && c.brandName ? `By ${c.brandName}` : c.category || "Community Drop",
    tagline: c.description?.split("\n")[0]?.slice(0, 80) || c.title,
    description: c.description || c.title,
    cover,
    badge: c.status === "ACTIVE" && daysLeft > 0 ? "New" : undefined,
    trending: h % 3 === 0,
    heroImage: hero.img,
    heroAlt: hero.alt,
    live: c.status === "ACTIVE",
    creators: 10 + (h % 40),
    votesCast: 50 + (h % 200),
    leader: {
      handle: "top_creator",
      snapImage: "/mock/snap-summer-beach.jpg",
      votes: 10 + (h % 90),
      estUsdc: 10 + (h % 40),
    },
    topVoterAvatars: ["/mock/avatar-voter-1.jpg", "/mock/avatar-voter-2.jpg"],
    otherVoters: h % 30,
  };
}

export function mapApiPost(p: ApiPost, index = 0): MockSnap {
  const campaignTag = p.campaign?.title ? toTag(p.campaign.title) : "#Challenge";
  const handle = creatorHandle(p.user);

  return {
    id: p.id,
    image: p.imageUrl,
    imageAlt: `Snap by @${handle}`,
    campaignId: p.campaignId,
    campaign: {
      tag: campaignTag,
      poolUsdc: 100,
      icon: "stars",
    },
    rank: index + 1,
    votes: p.voteCount,
    creator: {
      handle,
      name: creatorName(p.user),
      initial: creatorName(p.user)[0]?.toUpperCase() || "C",
      avatar: p.user?.avatarUrl || undefined,
      verified: Boolean(p.user?.username),
      online: false,
    },
    postedAgo: timeAgo(p.createdAt),
    liveShutter: false,
    featured: index === 0,
  };
}

export type { ApiCampaign, ApiPost, MockCampaign, MockSnap };
export type { AppUser, AppUserWithStats, Paginated, UploadResult } from "@/lib/types";
