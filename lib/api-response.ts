export interface ApiResponse<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

/** Prisma returns BigInt for block numbers, which `Response.json` cannot serialize. */
function json(body: unknown, init?: ResponseInit): Response {
  return new Response(
    JSON.stringify(body, (_key, value) => (typeof value === "bigint" ? value.toString() : value)),
    { ...init, headers: { "Content-Type": "application/json", ...init?.headers } }
  );
}

export function successResponse<T>(data: T, meta?: Record<string, unknown>): Response {
  const body: ApiResponse<T> = { data };
  if (meta) body.meta = meta;
  return json(body);
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  extraMeta?: Record<string, unknown>
): Response {
  return json({
    data,
    meta: {
      ...extraMeta,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export function errorResponse(
  statusCode: number,
  message: string | string[],
  error?: string
): Response {
  const body: ApiError = {
    statusCode,
    message,
    error: error || getErrorLabel(statusCode),
  };
  return Response.json(body, { status: statusCode });
}

function getErrorLabel(code: number): string {
  if (code === 400) return "Bad Request";
  if (code === 401) return "Unauthorized";
  if (code === 403) return "Forbidden";
  if (code === 404) return "Not Found";
  if (code === 409) return "Conflict";
  if (code === 422) return "Unprocessable Entity";
  if (code === 429) return "Too Many Requests";
  return "Internal Server Error";
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error?: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof HttpError) {
    return errorResponse(error.statusCode, error.message, error.error);
  }
  console.error("Unhandled error:", error);
  return errorResponse(500, "Internal server error");
}
