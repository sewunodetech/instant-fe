// Placeholder data until the API is wired up. Images in /public/mock come from the Stitch export.

export type Campaign = {
  id: string;
  tag: string;
  poolUsdc: number;
  daysLeft: number;
  dot: "live" | "blue" | "green" | "muted";
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
  { id: "summer-vibes", tag: "#SummerVibes", poolUsdc: 250, daysLeft: 5, dot: "live" },
  { id: "city-life", tag: "#CityLife", poolUsdc: 150, daysLeft: 3, dot: "blue" },
  { id: "foodie-moment", tag: "#FoodieMoment", poolUsdc: 100, daysLeft: 7, dot: "green" },
  { id: "best-friends", tag: "#BestFriends", poolUsdc: 300, daysLeft: 10, dot: "muted" },
];

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
