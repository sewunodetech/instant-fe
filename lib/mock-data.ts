// Placeholder data until the API is wired up. Images in /public/mock come from the Stitch export.

export type Campaign = {
  id: string;
  tag: string;
  poolUsdc: number;
  daysLeft: number;
  dot: "live" | "blue" | "green" | "muted";
  kind: string;
  description: string;
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
  campaign: { tag: string; poolUsdc: number; icon: string };
  rank: number;
  votes: number;
  comments: number;
  creator: { handle: string; initial: string; verified?: boolean; online?: boolean };
  postedAgo: string;
  liveShutter?: boolean;
  featured?: boolean;
  /** Estimated USDC split among top voters, shown on featured snaps. */
  voterPoolUsdc?: number;
};

export const currentUser = {
  avatar: "/mock/avatar-me.jpg",
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
      votes: 342,
      estUsdc: 84,
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
    description: "Street corners, rooftops, late-night trains. Show us the city the way only you see it.",
    heroImage: "/mock/avatar-me.jpg",
    heroAlt: "A young woman smiling with her phone at a busy street market",
    live: true,
    creators: 640,
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
    description: "That first bite, that perfect plate. Snap the food moment you couldn't not share.",
    heroImage: "/mock/snap-summer-cafe.jpg",
    heroAlt: "Friends sharing drinks and pastries at a Parisian cafe",
    live: true,
    creators: 410,
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
    description: "Tag your ride-or-die. Snap a moment together that proves it.",
    heroImage: "/mock/snap-best-friends.jpg",
    heroAlt: "Two best friends smiling in a golden-hour selfie on a seaside boardwalk",
    live: true,
    creators: 890,
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

export function getCampaign(id: string) {
  return activeCampaigns.find((c) => c.id === id);
}

export const feedSnaps: Snap[] = [
  {
    id: "snap-1",
    image: "/mock/snap-summer-cafe.jpg",
    imageAlt: "A young woman laughing with an iced matcha latte at a sunlit Parisian sidewalk cafe",
    campaign: { tag: "#SummerVibes", poolUsdc: 250, icon: "stars" },
    rank: 1,
    votes: 342,
    comments: 18,
    creator: { handle: "maya_beachlife", initial: "M", verified: true, online: true },
    postedAgo: "2h ago",
    liveShutter: true,
    featured: true,
    voterPoolUsdc: 38,
  },
  {
    id: "snap-2",
    image: "/mock/snap-best-friends.jpg",
    imageAlt: "Two best friends smiling in a golden-hour selfie on a seaside boardwalk",
    campaign: { tag: "#BestFriends", poolUsdc: 300, icon: "group" },
    rank: 4,
    votes: 198,
    comments: 7,
    creator: { handle: "elena_glow", initial: "E" },
    postedAgo: "45m ago",
  },
];
