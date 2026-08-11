/**
 * Seasons API module.
 */

import { apiClient, buildQueryString } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api/common";
import type {
  SeasonDetail,
  SeasonListItem,
  SeasonsQueryParams,
} from "@/types/api/seasons";
import type { PlayerSeasonListItem, PlayerSeasonsQueryParams } from "@/types/api/players";

const BASE = "/api/v1";

/**
 * GET /api/v1/seasons
 * Paginated list of all seasons.
 */
export async function getSeasons(
  params: SeasonsQueryParams = {}
): Promise<ApiResponse<PaginatedResponse<SeasonListItem>>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return apiClient.get(`${BASE}/seasons${qs}`);
}

/**
 * GET /api/v1/seasons/{id}
 * Full season detail.
 */
export async function getSeason(
  id: number
): Promise<ApiResponse<SeasonDetail>> {
  return apiClient.get(`${BASE}/seasons/${id}`);
}

/**
 * GET /api/v1/seasons/{id}/players
 * All player-season cards for a specific season.
 */
export async function getSeasonPlayers(
  seasonId: number,
  params: PlayerSeasonsQueryParams = {}
): Promise<ApiResponse<PaginatedResponse<PlayerSeasonListItem>>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return apiClient.get(`${BASE}/seasons/${seasonId}/players${qs}`);
}
