/**
 * Players API module.
 * All player-related API calls go through this module.
 */

import { apiClient, buildQueryString } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api/common";
import type {
  PlayerDetail,
  PlayerListItem,
  PlayerSeasonDetail,
  PlayerSeasonListItem,
  PlayerSeasonsQueryParams,
  PlayersQueryParams,
} from "@/types/api/players";

const BASE = "/api/v1";

/**
 * GET /api/v1/players
 * Paginated list of players.
 */
export async function getPlayers(
  params: PlayersQueryParams = {}
): Promise<ApiResponse<PaginatedResponse<PlayerListItem>>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return apiClient.get(`${BASE}/players${qs}`);
}

/**
 * GET /api/v1/players/{id}
 * Full player detail with all season variants.
 */
export async function getPlayer(
  id: number
): Promise<ApiResponse<PlayerDetail>> {
  return apiClient.get(`${BASE}/players/${id}`);
}

/**
 * GET /api/v1/player-seasons
 * Paginated list of all player-season cards with filters.
 */
export async function getPlayerSeasons(
  params: PlayerSeasonsQueryParams = {}
): Promise<ApiResponse<PaginatedResponse<PlayerSeasonListItem>>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return apiClient.get(`${BASE}/player-seasons${qs}`);
}

/**
 * GET /api/v1/player-seasons/{id}
 * Full detail for a specific player-season card.
 */
export async function getPlayerSeason(
  id: number
): Promise<ApiResponse<PlayerSeasonDetail>> {
  return apiClient.get(`${BASE}/player-seasons/${id}`);
}

/**
 * GET /api/v1/players/{playerId}/player-seasons
 * All season cards for a specific player.
 */
export async function getPlayerSeasonsByPlayer(
  playerId: number,
  params: PlayerSeasonsQueryParams = {}
): Promise<ApiResponse<PaginatedResponse<PlayerSeasonListItem>>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return apiClient.get(`${BASE}/players/${playerId}/player-seasons${qs}`);
}
