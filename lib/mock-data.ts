// Placeholder data until the API is wired up. Images in /public/mock come from the Stitch export.

export type Campaign = {
  id: string;
  tag: string;
  poolUsdc: number;
  daysLeft: number;
  dot: "live" | "blue" | "green" | "muted";
  kind: string;
  /** One-line pitch shown on discovery cards. */
  tagline: string;
  description: string;
  cover: string;
  badge?: "New" | "Top Pool";
  trending?: boolean;
  heroImage: string;
  heroAlt: string;
  live: boolean;
  creators: number;
  votesCast: number;
  leader: {
    handle: string;
    verified?: boolean;
    snapImage: string;
    votes: number;
    estUsdc: number;
  };
  topVoterAvatars: string[];
  otherVoters: number;
};

export type Snap = {
  id: string;
  image: string;
  imageAlt: string;
  campaignId: string;
  campaign: { tag: string; poolUsdc: number; icon: string };
  caption: string;
  location?: string;
  rank: number;
  votes: number;
  comments: number;
  creator: {
    handle: string;
    name: string;
    initial: string;
    avatar?: string;
    verified?: boolean;
    online?: boolean;
  };
  postedAgo: string;
  liveShutter?: boolean;
  featured?: boolean;
  /** Estimated USDC split among top voters, shown on featured snaps. */
  voterPoolUsdc?: number;
};

export const currentUser = {
  name: "Maya",
  handle: "maya_beachlife",
  avatar: "/mock/avatar-me.jpg",
  wallet: { network: "Base", address: "0x4a9...8e21" },
  usdcBalance: 42.5,
  hasUnread: true,
  streakDays: 5,
  streakBonusPct: 10,
  votePower: { left: 8, max: 10 },
};

export const activeCampaigns: Campaign[] = [
  {
    id: "summer-vibes",
    tag: "#SummerVibes",
    poolUsdc: 250,
    daysLeft: 5,
    dot: "live",
    kind: "Community Drop",
    tagline: "Show us your golden-hour patio or beach hangout crew!",
    cover: "/mock/campaigns/summer-vibes.jpg",
    trending: true,
    description:
      "Capture your best summer moments! Grab an iced drink, hang out with friends, and snap authentic sunshine vibes.",
    heroImage: "/mock/campaign-summer-hero.jpg",
    heroAlt: "Friends laughing at a beachfront cafe with iced drinks",
    live: true,
    creators: 1200,
    votesCast: 4800,
    leader: {
      handle: "maya_beachlife",
      verified: true,
      snapImage: "/mock/snap-summer-beach.jpg",
      votes: 1420,
      estUsdc: 80,
    },
    topVoterAvatars: ["/mock/avatar-voter-1.jpg", "/mock/avatar-voter-2.jpg"],
    otherVoters: 48,
  },
  {
    id: "city-life",
    tag: "#CityLife",
    poolUsdc: 150,
    daysLeft: 3,
    dot: "blue",
    kind: "Community Drop",
    tagline: "Metro aesthetic, crosswalks & city rhythm",
    cover: "/mock/campaigns/city-life.jpg",
    badge: "New",
    description: "Street corners, rooftops, late-night trains. Show us the city the way only you see it.",
    heroImage: "/mock/campaigns/city-life.jpg",
    heroAlt: "Friends crossing a busy neon-lit city street",
    live: true,
    creators: 843,
    votesCast: 2100,
    leader: {
      handle: "urban.kai",
      snapImage: "/mock/avatar-me.jpg",
      votes: 187,
      estUsdc: 45,
    },
    topVoterAvatars: ["/mock/avatar-voter-2.jpg", "/mock/avatar-voter-1.jpg"],
    otherVoters: 21,
  },
  {
    id: "foodie-moment",
    tag: "#FoodieMoment",
    poolUsdc: 100,
    daysLeft: 7,
    dot: "green",
    kind: "Community Drop",
    tagline: "Snap the bite before your first savor",
    cover: "/mock/campaigns/foodie-moment.jpg",
    description: "That first bite, that perfect plate. Snap the food moment you couldn't not share.",
    heroImage: "/mock/campaigns/foodie-moment.jpg",
    heroAlt: "A colorful poke bowl on a cafe table",
    live: true,
    creators: 672,
    votesCast: 1300,
    leader: {
      handle: "chef.lina",
      snapImage: "/mock/snap-summer-cafe.jpg",
      votes: 96,
      estUsdc: 30,
    },
    topVoterAvatars: ["/mock/avatar-voter-1.jpg"],
    otherVoters: 12,
  },
  {
    id: "best-friends",
    tag: "#BestFriends",
    poolUsdc: 300,
    daysLeft: 10,
    dot: "muted",
    kind: "Sponsored",
    tagline: "Unfiltered duo memories & spontaneous giggles",
    cover: "/mock/campaigns/best-friends.jpg",
    badge: "Top Pool",
    trending: true,
    description: "Tag your ride-or-die. Snap a moment together that proves it.",
    heroImage: "/mock/snap-best-friends.jpg",
    heroAlt: "Two best friends smiling in a golden-hour selfie on a seaside boardwalk",
    live: true,
    creators: 1400,
    votesCast: 3600,
    leader: {
      handle: "elena_glow",
      snapImage: "/mock/snap-best-friends.jpg",
      votes: 198,
      estUsdc: 96,
    },
    topVoterAvatars: ["/mock/avatar-voter-2.jpg", "/mock/avatar-voter-1.jpg"],
    otherVoters: 35,
  },
];

export const pastCampaigns: Campaign[] = [
  {
    id: "golden-hour",
    tag: "#GoldenHour",
    poolUsdc: 250,
    daysLeft: 0,
    dot: "muted",
    kind: "Community Drop",
    tagline: "Chase the light for the warmest glow of the week",
    cover: "/mock/leaderboard/snap-1.jpg",
    description: "Chase the light. Snap the warmest, glowiest golden-hour moment of your week.",
    heroImage: "/mock/leaderboard/snap-1.jpg",
    heroAlt: "A surfer walking along the beach at sunset",
    live: false,
    creators: 1500,
    votesCast: 6840,
    leader: {
      handle: "maya_beachlife",
      verified: true,
      snapImage: "/mock/leaderboard/snap-1.jpg",
      votes: 1420,
      estUsdc: 80,
    },
    topVoterAvatars: ["/mock/leaderboard/voter-1.jpg", "/mock/leaderboard/voter-2.jpg"],
    otherVoters: 64,
  },
];

export function getCampaign(id: string) {
  return [...activeCampaigns, ...pastCampaigns].find((c) => c.id === id);
}

export type Creator = {
  rank: number;
  handle: string;
  verified?: boolean;
  avatar?: string;
  snapImage: string;
  votes: number;
  payoutUsdc: number;
  tagline?: string;
};

export type RewardedVoter = {
  rank: number;
  handle: string;
  avatar: string;
  note: string;
  dividendUsdc: number;
};

export type Leaderboard = {
  creators: Creator[];
  voters: RewardedVoter[];
  voterDividend: { count: number; eachUsdc: number };
};

const L = "/mock/leaderboard";

// Every campaign shares one mock leaderboard for now.
const sharedLeaderboard: Leaderboard = {
  creators: [
    {
      rank: 1,
      handle: "maya_beachlife",
      verified: true,
      avatar: `${L}/avatar-1.jpg`,
      snapImage: `${L}/snap-1.jpg`,
      votes: 1420,
      payoutUsdc: 80,
      tagline: "Chasing golden sunsets & tide pools",
    },
    { rank: 2, handle: "alex_skater", avatar: `${L}/avatar-2.jpg`, snapImage: `${L}/snap-2.jpg`, votes: 982, payoutUsdc: 50 },
    { rank: 3, handle: "sarah_sun", avatar: `${L}/avatar-3.jpg`, snapImage: `${L}/snap-3.jpg`, votes: 740, payoutUsdc: 30 },
    { rank: 4, handle: "kai_vibes", verified: true, snapImage: `${L}/snap-4.jpg`, votes: 612, payoutUsdc: 18 },
    { rank: 5, handle: "lucas_travels", snapImage: `${L}/snap-5.jpg`, votes: 540, payoutUsdc: 14 },
    { rank: 6, handle: "elena_glow", verified: true, snapImage: `${L}/snap-6.jpg`, votes: 488, payoutUsdc: 12 },
    { rank: 7, handle: "matcha_breeze", snapImage: `${L}/snap-7.jpg`, votes: 410, payoutUsdc: 10 },
    { rank: 8, handle: "dan_ocean", snapImage: `${L}/snap-8.jpg`, votes: 365, payoutUsdc: 8 },
    { rank: 9, handle: "chloe_petals", snapImage: `${L}/snap-9.jpg`, votes: 312, payoutUsdc: 6 },
    { rank: 10, handle: "trio_nomad", snapImage: `${L}/snap-10.jpg`, votes: 289, payoutUsdc: 4 },
  ],
  voters: [
    { rank: 1, handle: "curator_pro", avatar: `${L}/voter-1.jpg`, note: "Predicted #1 Winner early", dividendUsdc: 4.45 },
    { rank: 2, handle: "summer_scout", avatar: `${L}/voter-2.jpg`, note: "Predicted #1 & #2", dividendUsdc: 4.45 },
    { rank: 3, handle: "zoe_superfan", avatar: `${L}/voter-3.jpg`, note: "Cast 45 active votes", dividendUsdc: 4.45 },
  ],
  voterDividend: { count: 10, eachUsdc: 4.45 },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- id will select real data once the API exists
export function getLeaderboard(campaignId: string): Leaderboard {
  return sharedLeaderboard;
}

export const upcomingCampaign = {
  id: "sunset-chasers",
  tag: "#SunsetChasers",
  poolUsdc: 300,
  theme: "Golden Hour Theme",
  startsIn: "2h 14m",
};

export const feedSnaps: Snap[] = [
  {
    id: "snap-1",
    image: "/mock/snap-summer-cafe.jpg",
    imageAlt: "A young woman laughing with an iced matcha latte at a sunlit Parisian sidewalk cafe",
    campaignId: "summer-vibes",
    caption: "Sunny patio laughter with besties! Matcha latte + iced tea = pure summer ☀️🌴 #SummerVibes #GoldenHour",
    location: "Venice Beach, CA",
    campaign: { tag: "#SummerVibes", poolUsdc: 250, icon: "stars" },
    rank: 1,
    votes: 1420,
    comments: 18,
    creator: {
      handle: "maya_beachlife",
      name: "Maya",
      initial: "M",
      avatar: "/mock/leaderboard/avatar-1.jpg",
      verified: true,
      online: true,
    },
    postedAgo: "2h ago",
    liveShutter: true,
    featured: true,
    voterPoolUsdc: 38,
  },
  {
    id: "snap-2",
    image: "/mock/snap-best-friends.jpg",
    imageAlt: "Two best friends smiling in a golden-hour selfie on a seaside boardwalk",
    campaignId: "best-friends",
    caption: "Boardwalk sunsets with my forever person 🧡 #BestFriends",
    location: "Santa Monica Pier, CA",
    campaign: { tag: "#BestFriends", poolUsdc: 300, icon: "group" },
    rank: 4,
    votes: 198,
    comments: 7,
    creator: { handle: "elena_glow", name: "Elena", initial: "E" },
    postedAgo: "45m ago",
  },
];

export function getSnap(id: string) {
  return feedSnaps.find((s) => s.id === id);
}

export type VoteTier = { usdc: number; votes: number; bonusPct?: number };

export const voteTiers: VoteTier[] = [
  { usdc: 1, votes: 1 },
  { usdc: 5, votes: 5 },
  { usdc: 10, votes: 12, bonusPct: 20 },
];

/** Share of the prize pool that goes to voters of winning snaps. */
export const VOTER_POOL_SHARE = 0.3;
/** Mock projection until the backend returns a real estimate. */
export const EST_PAYOUT_PER_VOTE_USDC = 3.2;

/** Votes earned for a USDC amount: 20% bonus from 10 USDC up. */
export function votesFor(usdc: number) {
  return usdc >= 10 ? Math.floor(usdc * 1.2) : Math.floor(usdc);
}

export type RewardLine = {
  label: string;
  note?: string;
  icon: string;
  tone: "primary" | "secondary" | "tertiary" | "neutral";
  amountUsdc: number;
  /** Rendered with a leading "+" as a bonus on top of the base prize. */
  bonus?: boolean;
};

export const pendingReward = {
  campaignId: "golden-hour",
  place: 1,
  lines: [
    { label: "Base Creator 1st Prize", icon: "military_tech", tone: "primary", amountUsdc: 70 },
    { label: "Community Early-Bird Bonus", icon: "speed", tone: "secondary", amountUsdc: 5, bonus: true },
    { label: "5-Day Streak Multiplier (+10%)", icon: "local_fire_department", tone: "tertiary", amountUsdc: 5, bonus: true },
    { label: "Network Gas Fee", note: "Sponsored by Base", icon: "local_gas_station", tone: "neutral", amountUsdc: 0 },
  ] satisfies RewardLine[],
};
