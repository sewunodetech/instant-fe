import { getAccessToken } from "@privy-io/react-auth";
import type {
  ActivityItem,
  ApiCampaign,
  ApiPost,
  AppUser,
  AppUserWithStats,
  DonationConfirmResult,
  DonationIntent,
  Leaderboard,
  Paginated,
  PublicProfile,
  PublicUser,
  UploadResult,
  VoteResult,
  WalletBalance,
  WalletTransfer,
} from "@/lib/types";

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof TypeError) return "You're offline or the server is unreachable.";
  return fallback;
}

async function parseError(res: Response): Promise<ApiClientError> {
  let message = res.statusText || "Request failed";
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (body?.message) {
      message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    }
  } catch {
    // ignore body parse failures
  }
  return new ApiClientError(res.status, message);
}

async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  try {
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  } catch {
    // Privy not ready / no session — request goes out unauthenticated
  }

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) throw await parseError(res);
  return res;
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await request(path, options);
  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => null)) as { data?: T } | null;
  return (json && "data" in json ? json.data : json) as T;
}

export type PaginatedWith<T, M = Record<string, never>> = Paginated<T> & { meta: M };

export async function apiFetchPaginated<T, M = Record<string, never>>(
  path: string,
  options: RequestInit = {}
): Promise<PaginatedWith<T, M>> {
  const res = await request(path, options);
  const json = (await res.json()) as { data?: T[]; meta?: Paginated<T>["meta"] & M };
  return {
    data: json.data ?? [],
    meta: (json.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 }) as Paginated<T>["meta"] & M,
  };
}

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") search.set(k, String(v));
  const s = search.toString();
  return s ? `?${s}` : "";
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

// Auth & me
export const verifyPrivyToken = (privyToken: string) =>
  apiFetch<{ user: AppUser }>("/api/auth/verify", { method: "POST", ...json({ privyToken }) });
export const fetchMe = () => apiFetch<AppUserWithStats>("/api/users/me");
export const patchMe = (data: Partial<Pick<AppUser, "username" | "displayName" | "avatarUrl" | "bio" | "isPrivate">>) =>
  apiFetch<AppUser>("/api/users/me", { method: "PATCH", ...json(data) });
export const getMyActivity = () => apiFetch<ActivityItem[]>("/api/users/me/activity");

// Profiles
export const getProfile = (handle: string) => apiFetch<PublicProfile>(`/api/users/${encodeURIComponent(handle)}`);
export const listUserPosts = (handle: string, page = 1, limit = 24) =>
  apiFetchPaginated<ApiPost>(`/api/users/${encodeURIComponent(handle)}/posts${qs({ page, limit })}`);
export const listUserCampaigns = (handle: string, role: "joined" | "hosted", page = 1, limit = 20) =>
  apiFetchPaginated<ApiCampaign>(`/api/users/${encodeURIComponent(handle)}/campaigns${qs({ role, page, limit })}`);

// Campaigns
export const listCampaigns = (params?: { status?: "active" | "ended" | "all"; page?: number; limit?: number }) =>
  apiFetchPaginated<ApiCampaign>(`/api/campaigns${qs({ ...params })}`);
export const getCampaign = (id: string) => apiFetch<ApiCampaign>(`/api/campaigns/${id}`);
export const createCampaign = (data: {
  title: string;
  description?: string;
  category?: string;
  rules?: string[];
  coverImageUrl?: string;
  prizePool?: number;
  maxPostsPerUser?: number;
  durationDays: number;
}) => apiFetch<ApiCampaign>("/api/campaigns", { method: "POST", ...json(data) });
export const updateCampaign = (
  id: string,
  data: {
    title?: string;
    description?: string | null;
    category?: string | null;
    rules?: string[];
    coverImageUrl?: string | null;
    prizePool?: number;
    maxPostsPerUser?: number;
    extendDays?: number;
  }
) => apiFetch<ApiCampaign>(`/api/campaigns/${id}`, { method: "PATCH", ...json(data) });
export const endCampaign =(id: string) => apiFetch<ApiCampaign>(`/api/campaigns/${id}/end`, { method: "POST" });
export const getLeaderboard = (id: string) => apiFetch<Leaderboard>(`/api/campaigns/${id}/leaderboard`);
export const listCampaignPosts = (id: string, params?: { sort?: "latest" | "top"; page?: number; limit?: number }) =>
  apiFetchPaginated<ApiPost, { remainingSnaps: number | null }>(`/api/campaigns/${id}/posts${qs({ ...params })}`);
export const generateCampaignDraft = (prompt: string) =>
  apiFetch<{ title: string; description: string; category: string; rules: string[]; durationDays: number }>(
    "/api/ai/campaign/generate",
    { method: "POST", ...json({ prompt }) }
  );

// Snaps
export const listFeed = (params?: { sort?: "latest" | "top"; page?: number; limit?: number }) =>
  apiFetchPaginated<ApiPost>(`/api/posts${qs({ ...params })}`);
export const getPost = (id: string) => apiFetch<ApiPost>(`/api/posts/${id}`);
export const createPost = (campaignId: string, imageUrl: string, caption?: string) =>
  apiFetch<ApiPost>(`/api/campaigns/${campaignId}/posts`, { method: "POST", ...json({ imageUrl, caption }) });
export const deletePost = (id: string) => apiFetch<{ success: boolean }>(`/api/posts/${id}`, { method: "DELETE" });
export const votePost = (id: string) => apiFetch<VoteResult>(`/api/posts/${id}/vote`, { method: "POST" });
export const unvotePost = (id: string) => apiFetch<VoteResult>(`/api/posts/${id}/vote`, { method: "DELETE" });
export const listPostVoters = (id: string, page = 1, limit = 20) =>
  apiFetchPaginated<{ id: string; createdAt: string; user: PublicUser }>(`/api/posts/${id}/votes${qs({ page, limit })}`);

// Support (BNB/USDC transfer signed in the user's wallet, verified server-side)
export const createSupportIntent = (postId: string, amount: number) =>
  apiFetch<DonationIntent>(`/api/posts/${postId}/back`, { method: "POST", ...json({ amount }) });
export const confirmSupport = (donationId: string, txHash: string) =>
  apiFetch<DonationConfirmResult>(`/api/donations/${donationId}`, { method: "POST", ...json({ txHash }) });
export const cancelSupport = (donationId: string) =>
  apiFetch<{ success: boolean }>(`/api/donations/${donationId}`, { method: "DELETE" });

// Wallet
export const getWalletBalance = () => apiFetch<WalletBalance>("/api/wallet/balance");
export const getWalletTransfers = (limit = 20) => apiFetch<WalletTransfer[]>(`/api/wallet/transfers?limit=${limit}`);

// Uploads
export async function uploadFile(file: Blob | File, kind: "snaps" | "avatars" | "covers" = "snaps") {
  const form = new FormData();
  const blob = file instanceof File ? file : new File([file], `${kind}.jpg`, { type: file.type || "image/jpeg" });
  form.append("file", blob);
  form.append("kind", kind);
  return apiFetch<UploadResult>("/api/uploads", { method: "POST", body: form });
}
