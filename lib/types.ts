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
