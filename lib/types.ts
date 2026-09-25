export type AppUser = {
  id: string;
  privyId: string | null;
  walletAddress: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type AppUserStats = {
  posts: number;
  campaigns: number;
  donated: string;
  totalDonated: string;
};

export type AppUserWithStats = AppUser & { stats?: AppUserStats | null };

export type CampaignStatus = "DRAFT" | "ACTIVE" | "ENDED";

export type ApiCampaign = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  rules: unknown;
  maxPostsPerUser: number;
  status: CampaignStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostUser = {
  id: string;
  walletAddress: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ApiPost = {
  id: string;
  campaignId: string;
  userId: string;
  imageUrl: string;
  caption: string | null;
  voteCount: number;
  donationCount: number;
  donationAmount: string | number;
  createdAt: string;
  updatedAt: string;
  user?: PostUser | null;
  campaign?: { id: string; title: string; status: CampaignStatus } | null;
};

export type ApiDonation = {
  id: string;
  campaignId: string;
  postId: string;
  userId: string;
  amount: string | number;
  token: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  txHash: string | null;
  blockNumber?: string | number | null;
  createdAt: string;
};

export type DonationIntentResult = {
  donation: ApiDonation;
  transaction: {
    contractAddress: string;
    chainId: number;
    method: string;
    args: string[];
    value: string;
    token: string;
  };
};

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
  /** Human-readable balance, e.g. "42.5". */
  balance: string;
  balanceRaw: string;
  chainId: number;
  tokenAddress: string;
  /** Whether USDC_CONTRACT_ADDRESS is set on the server. */
  configured: boolean;
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
