import { getAccessToken } from "@privy-io/react-auth";
import type {
  ApiCampaign,
  ApiDonation,
  ApiPost,
  AppUser,
  AppUserWithStats,
  DonationIntentResult,
  Paginated,
  UploadResult,
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

type ApiEnvelope<T> =
  | { data: T; meta?: Record<string, unknown> }
  | { statusCode: number; message: string | string[] };

async function parseError(res: Response): Promise<ApiClientError> {
  let message = res.statusText || "Request failed";
  try {
    const body = (await res.json()) as ApiEnvelope<unknown> & { message?: string | string[] };
    if (body && "message" in body && body.message) {
      message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    }
  } catch {
    // ignore body parse failures
  }
  return new ApiClientError(res.status, message);
}

async function withAuth(headers: Headers): Promise<Headers> {
  try {
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  } catch {
    // Privy not ready / no session — request goes out unauthenticated
  }
  return headers;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  const isForm = options.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  await withAuth(headers);

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => null)) as { data?: T } | null;
  return (json && "data" in json ? json.data : json) as T;
}

export async function apiFetchPaginated<T>(
  path: string,
  options: RequestInit = {}
): Promise<Paginated<T>> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  await withAuth(headers);

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) throw await parseError(res);

  const json = (await res.json()) as { data?: T[]; meta?: Paginated<T>["meta"] };
  return {
    data: json.data ?? [],
    meta: json.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}

export function fetchMe() {
  return apiFetch<AppUserWithStats>("/api/users/me");
}

export function patchMe(data: Partial<Pick<AppUser, "username" | "displayName" | "avatarUrl">>) {
  return apiFetch<AppUser>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function verifyPrivyToken(privyToken: string) {
  return apiFetch<{ user: AppUser }>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ privyToken }),
  });
}

export function listCampaigns(params?: {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.category) qs.set("category", params.category);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetchPaginated<ApiCampaign>(`/api/campaigns${suffix}`);
}

export function getCampaign(id: string) {
  return apiFetch<ApiCampaign>(`/api/campaigns/${id}`);
}

export function listCampaignPosts(id: string, page = 1, limit = 20) {
  return apiFetchPaginated<ApiPost>(
    `/api/campaigns/${id}/posts?page=${page}&limit=${limit}`
  );
}

export function getPost(id: string) {
  return apiFetch<ApiPost>(`/api/posts/${id}`);
}

export function createPost(campaignId: string, imageUrl: string, caption?: string) {
  return apiFetch<ApiPost>(`/api/campaigns/${campaignId}/posts`, {
    method: "POST",
    body: JSON.stringify({ imageUrl, caption: caption || undefined }),
  });
}

export function votePost(postId: string) {
  return apiFetch<{ success: boolean }>(`/api/posts/${postId}/vote`, {
    method: "POST",
  });
}

export function unvotePost(postId: string) {
  return apiFetch<{ success: boolean }>(`/api/posts/${postId}/vote`, {
    method: "DELETE",
  });
}

export function backPost(postId: string, amount: number) {
  return apiFetch<DonationIntentResult>(`/api/posts/${postId}/back`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export function getPostVotes(postId: string, page = 1, limit = 20) {
  return apiFetchPaginated<{
    id: string;
    createdAt: string;
    user?: {
      id: string;
      walletAddress: string | null;
      username: string | null;
      displayName: string | null;
    } | null;
  }>(`/api/posts/${postId}/votes?page=${page}&limit=${limit}`);
}

export function getPostDonations(postId: string, page = 1, limit = 20) {
  return apiFetchPaginated<ApiDonation>(
    `/api/posts/${postId}/backers?page=${page}&limit=${limit}`
  );
}

export function getWalletBalance() {
  return apiFetch<WalletBalance>("/api/wallet/balance");
}

export function getWalletTransfers(limit = 20) {
  return apiFetch<WalletTransfer[]>(`/api/wallet/transfers?limit=${limit}`);
}

export async function uploadFile(file: Blob | File, filename = "snap.jpg") {
  const form = new FormData();
  const blob =
    file instanceof File
      ? file
      : new File([file], filename, { type: file.type || "image/jpeg" });
  form.append("file", blob);
  return apiFetch<UploadResult>("/api/uploads", { method: "POST", body: form });
}
