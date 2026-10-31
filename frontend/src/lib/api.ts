/**
 * BRIGHTLOOP typed API client.
 * Wraps fetch, handles errors in one shape, used by TanStack Query hooks.
 * In mock mode (NEXT_PUBLIC_USE_MOCK=true), MSW intercepts these requests.
 * In production, requests go through the Next.js proxy to FastAPI.
 */

const BASE = process.env.NEXT_PUBLIC_USE_MOCK === "true"
  ? "/api/mock"       // MSW intercepts this prefix in the browser
  : "/api/proxy";     // Next.js proxy forwards to FastAPI

/** Standard error shape shared by mock and real API */
export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string[]>;
}

/** Standard list response from any paginated endpoint */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

/** Query params for list endpoints */
export interface ListParams {
  page?: number;
  page_size?: number;
  sort?: string;
  order?: "asc" | "desc";
  q?: string;
  [key: string]: string | number | boolean | undefined;
}

class ApiFetchError extends Error {
  status: number;
  data: ApiError;

  constructor(status: number, data: ApiError) {
    super(data.message);
    this.name = "ApiFetchError";
    this.status = status;
    this.data = data;
  }
}

export { ApiFetchError };

/** Build URL with query params, filtering out undefined values */
function buildUrl(path: string, params?: ListParams): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const url = new URL(`${BASE}${path}`, origin);
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        url.searchParams.set(key, String(val));
      }
    });
  }
  return url.toString();
}

/** Core fetch wrapper */
async function request<T>(
  path: string,
  options: RequestInit = {},
  params?: ListParams
): Promise<T> {
  const url = buildUrl(path, params);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    let data: ApiError;
    try {
      data = await res.json();
    } catch {
      data = { message: `Request failed with status ${res.status}` };
    }
    throw new ApiFetchError(res.status, data);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

/** API client object with typed methods */
export const api = {
  get: <T>(path: string, params?: ListParams) =>
    request<T>(path, { method: "GET" }, params),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};
