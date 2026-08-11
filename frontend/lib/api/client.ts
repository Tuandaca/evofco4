/**
 * Central API client for FC Upgrade Intelligence.
 *
 * Architecture:
 *   Next.js → API Client → .NET 10 REST API → PostgreSQL
 *
 * Features:
 *   - Centralized base URL (never hard-coded in components)
 *   - Typed responses via generics
 *   - Centralized error handling → typed ApiClientError
 *   - AbortController timeout (10 seconds default)
 *   - JSON parsing with error handling
 */

import { config } from "@/lib/config/env";
import type { ApiErrorResponse } from "@/types/api/common";

const DEFAULT_TIMEOUT_MS = 10_000;

// ─── Error Types ─────────────────────────────────────────────────────────────

export class ApiClientError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }

  get isNotFound() {
    return this.statusCode === 404;
  }

  get isBadRequest() {
    return this.statusCode === 400;
  }

  get isServerError() {
    return this.statusCode >= 500;
  }

  get isNetworkError() {
    return this.statusCode === 0;
  }
}

// ─── HTTP Methods ─────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  /** Next.js revalidation tags or seconds (server-side only) */
  next?: NextFetchRequestConfig;
}

/**
 * Core fetch wrapper. All API calls go through this function.
 */
async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers: extraHeaders = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    next,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${config.api.baseUrl}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extraHeaders,
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      next,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError(0, "TIMEOUT", `Request timeout after ${timeoutMs}ms: ${url}`);
    }

    if (error instanceof TypeError) {
      // Network error (ECONNREFUSED, DNS failure, etc.)
      throw new ApiClientError(0, "NETWORK_ERROR", `Cannot reach API: ${url}. Is the backend running?`);
    }

    throw new ApiClientError(0, "UNKNOWN_ERROR", `Unexpected error: ${String(error)}`);
  }
}

async function handleErrorResponse(response: Response): Promise<never> {
  let code = "HTTP_ERROR";
  let message = `HTTP ${response.status}: ${response.statusText}`;

  try {
    const json = (await response.json()) as ApiErrorResponse;
    if (json?.error?.code) code = json.error.code;
    if (json?.error?.message) message = json.error.message;
  } catch {
    // If JSON parsing fails, use default message
  }

  throw new ApiClientError(response.status, code, message);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return apiFetch<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body: unknown, options?: Omit<RequestOptions, "method">) {
    return apiFetch<T>(path, { ...options, method: "POST", body });
  },

  put<T>(path: string, body: unknown, options?: Omit<RequestOptions, "method">) {
    return apiFetch<T>(path, { ...options, method: "PUT", body });
  },

  patch<T>(path: string, body: unknown, options?: Omit<RequestOptions, "method">) {
    return apiFetch<T>(path, { ...options, method: "PATCH", body });
  },

  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return apiFetch<T>(path, { ...options, method: "DELETE" });
  },
};

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Build a query string from an object, omitting undefined/null values.
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}
