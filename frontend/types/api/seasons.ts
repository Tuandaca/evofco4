/**
 * Season API types.
 * Mirrors: FCUpgrade.Contracts.DTOs (season-related)
 */

/**
 * Season list item for paginated season list.
 * Mirrors: SeasonListItemDto
 */
export interface SeasonListItem {
  id: number;
  seasonId: string;
  code: string;
  name: string;
  isActive: boolean;
  playerCount: number;
  lastUpdatedAt: string; // ISO 8601 date string
}

/**
 * Full season detail.
 * Mirrors: SeasonDetailDto
 */
export interface SeasonDetail {
  id: number;
  seasonId: string;
  code: string;
  name: string;
  isActive: boolean;
  firstSeenAt: string; // ISO 8601 date string
  lastSeenAt: string; // ISO 8601 date string
  totalPlayers: number;
}

/**
 * Query parameters for GET /api/v1/seasons
 */
export interface SeasonsQueryParams {
  page?: number;
  pageSize?: number;
}
