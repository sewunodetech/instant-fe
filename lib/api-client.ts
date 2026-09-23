import { getAccessToken } from "@privy-io/react-auth";
import type { AppUser, AppUserWithStats } from "@/lib/types";

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ApiEnvelope<T> = { data: T } | { statusCode: number; message: string | string[] };

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

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
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

  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => null)) as { data?: T } | null;
  return (json && "data" in json ? json.data : json) as T;
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
