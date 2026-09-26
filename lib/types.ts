export type CampaignStatus = "DRAFT" | "ACTIVE" | "ENDED";

export type PublicUser = {
  id: string;
  walletAddress: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type AppUser = PublicUser & {
  privyId: string | null;
  bio: string | null;
  isPrivate: boolean;
};

export type UserStats = {
  snaps: number;
  campaignsJoined: number;
  campaignsCreated: number;
  votesReceived: number;
  wins: number;
  supportReceived: number;
};

export type AppUserWithStats = AppUser & { stats?: UserStats | null };

export type PublicProfile = PublicUser & {
  bio: string | null;
  createdAt: string;
  isPrivate: boolean;
  /** Private profile viewed by someone else: stats and lists are hidden. */
  restricted: boolean;
  stats: UserStats | null;
};

export type CampaignStats = {
  snaps: number;
  creators: number;
  votes: number;
};

export type ApiCampaign = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  rules: string[];
  coverImageUrl: string | null;
  prizePool: number;
  maxPostsPerUser: number;
  status: CampaignStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  creator: PublicUser | null;
  stats: CampaignStats;
  /** Top snap image, used as a cover when the host didn't upload one. */
  topImageUrl: string | null;
  /** The signed-in viewer has posted at least one snap here. */
  joined: boolean;
};

export type ApiPost = {
  id: string;
  campaignId: string;
  imageUrl: string;
  caption: string | null;
  voteCount: number;
  donationCount: number;
  donationAmount: number;
  createdAt: string;
  user: PublicUser;
  campaign: {
    id: string;
    title: string;
    status: CampaignStatus;
    endsAt: string | null;
    prizePool: number;
  };
  /** Whether the signed-in viewer has voted this snap. */
  hasVoted: boolean;
  /** Current rank inside its campaign (1 = most votes). */
  rank: number | null;
};

export type LeaderboardEntry = {
  rank: number;
  prize: number;
  post: ApiPost;
};

export type TopVoter = {
  user: PublicUser;
  votes: number;
};

export type Leaderboard = {
  campaign: ApiCampaign;
  entries: LeaderboardEntry[];
  topVoters: TopVoter[];
  /** The viewer's best-ranked snap in this campaign, if any. */
  myEntry: LeaderboardEntry | null;
  prizeSplit: number[];
};

export type ActivityKind = "vote" | "support_in" | "support_out" | "win" | "campaign_end";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  createdAt: string;
  actor: PublicUser | null;
  post: { id: string; imageUrl: string } | null;
  campaign: { id: string; title: string } | null;
  amount?: number;
  rank?: number;
  prize?: number;
};

export type DonationTransfer = {
  /** "native" = plain BNB transfer; "token" = ERC-20 (USDC) transfer. */
  kind: "native" | "token";
  to: string;
  /** Only for kind "token". */
  tokenAddress: string | null;
  decimals: number;
  chainId: number;
  amountRaw: string;
};

export type DonationIntent = {
  donation: { id: string; amount: number; status: "PENDING" | "CONFIRMED" | "FAILED" };
  transfer: DonationTransfer;
};

export type DonationConfirmResult = {
  status: "PENDING" | "CONFIRMED" | "FAILED";
  post?: { id: string; donationCount: number; donationAmount: number };
};

export type VoteResult = { voteCount: number; hasVoted: boolean };

export type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginatedMeta;
};

export type UploadResult = {
  url: string;
  key: string;
  contentType: string;
  size: number;
};

export type WalletBalance = {
  address: string;
  symbol: string;
  decimals: number;
  /** Human-readable token balance, e.g. "42.5". */
  balance: string;
  balanceRaw: string;
  /** Human-readable native (gas) balance, e.g. "0.05". */
  nativeBalance: string;
  nativeSymbol: string;
  chainId: number;
  tokenAddress: string;
  /** Whether the reward coin can be used (always true for native BNB). */
  configured: boolean;
  /** False when the chain couldn't be reached — the zeros are placeholders. */
  onchainAvailable: boolean;
};

export type WalletTransfer = {
  hash: string;
  direction: "in" | "out";
  /** Signed human-readable amount (negative for outgoing). */
  amount: number;
  counterparty: string;
  blockNumber: number;
  logIndex: number;
};
