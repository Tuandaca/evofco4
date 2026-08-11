/**
 * Common API response types.
 * Mirrors: FCUpgrade.Contracts.Common
 */

/**
 * Standard API response wrapper.
 * All successful API responses are wrapped in this envelope.
 * Mirrors: ApiResponse<T>
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * Paginated response for list endpoints.
 * Mirrors: PaginatedResponse<T>
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Standard error response from the API.
 * Mirrors: ApiErrorResponse
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Data status response from /api/v1/data-status
 */
export interface DataStatusResponse {
  playerCount: number;
  playerSeasonCount: number;
  seasonCount: number;
  lastUpdatedAt: string | null;
  status: "healthy" | "empty" | "stale" | "unknown";
}

/**
 * Health check response from /api/v1/system/health
 */
export interface HealthResponse {
  status: string;
}
