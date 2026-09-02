/**
 * Player API types.
 * Mirrors: FCUpgrade.Contracts.DTOs (player-related)
 */

/**
 * Player list item for paginated player list.
 * Mirrors: PlayerListItemDto
 */
export interface PlayerListItem {
  id: number;
  sourceId: string;
  name: string;
  nameShort: string;
  imageUrl: string;
  defaultSeason?: PlayerSeasonSummary;
}

export interface PlayerSeasonSummary {
  ovr: number;
  seasonCode: string;
  pos1: string;
  teamName: string;
  nationName: string;
  priceKr: number;
}

/**
 * Full player detail including all season variants.
 * Mirrors: PlayerDetailDto
 */
export interface PlayerDetail {
  id: number;
  sourceId: string;
  name: string;
  nameShort: string;
  imageUrl: string;
  seasons: PlayerSeasonListItem[];
}

/**
 * Player-season list item used in player detail and player-season list.
 * Mirrors: PlayerSeasonListItemDto
 */
export interface PlayerSeasonListItem {
  id: number;
  sourceId: string;
  imageUrl: string;

  // Flattened player info
  playerId: number;
  playerName: string;

  // Season info
  seasonId: number;
  seasonCode: string;
  seasonName: string;

  // Core stats
  ovr: number;
  pos1: string;

  // Affiliation
  teamName: string;
  nationName: string;
  leagueName: string;

  // Price
  priceKr: number;
}

/**
 * Full player-season detail with all 6 stats, traits, etc.
 * Mirrors: PlayerSeasonDetailDto
 */
export interface PlayerSeasonDetail {
  id: number;
  sourceId: string;
  imageUrl: string;

  playerId: number;
  playerName: string;
  playerNameShort: string;

  seasonId: number;
  seasonCode: string;
  seasonName: string;

  ovr: number;
  pos1: string;
  pos2: string;

  footPref: number; // 0 = Left, 1 = Right
  footPrefString: string;
  footWeak: number;
  skillLevel: number;

  height: number;
  weight: number;
  age: number;

  teamId: number;
  teamName: string;
  nationId: number;
  nationName: string;
  leagueId: number;
  leagueName: string;

  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;

  priceKr: number;

  traits: string;
  bodyType: string;
  workRateAtt: string;
  workRateDef: string;

  lastUpdatedAt: string; // ISO 8601 date string
}

/**
 * Query parameters for GET /api/v1/players
 */
export interface PlayersQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  seasonId?: number;
  position?: string;
  minOvr?: number;
  maxOvr?: number;
  sortBy?: "ovr" | "name" | "price" | "height" | "age" | "updatedAt";
  sortDirection?: "asc" | "desc";
}

/**
 * Query parameters for GET /api/v1/player-seasons
 */
export interface PlayerSeasonsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  position?: string;
  seasonId?: number;
  seasonCode?: string;
  teamId?: number;
  nationId?: number;
  leagueId?: number;
  minOvr?: number;
  maxOvr?: number;
  sortBy?: "ovr" | "name" | "price" | "height" | "age" | "updatedAt";
  sortDirection?: "asc" | "desc";
}
