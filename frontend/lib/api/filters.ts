/**
 * Filters API module.
 * Provides filter options for dropdowns (positions, teams, nations, leagues).
 */

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api/common";
import type { FilterOption } from "@/types/api/filters";

const BASE = "/api/v1";

/**
 * GET /api/v1/filters/positions
 */
export async function getPositions(): Promise<ApiResponse<FilterOption[]>> {
  return apiClient.get(`${BASE}/filters/positions`);
}

/**
 * GET /api/v1/filters/teams
 */
export async function getTeams(): Promise<ApiResponse<FilterOption[]>> {
  return apiClient.get(`${BASE}/filters/teams`);
}

/**
 * GET /api/v1/filters/nations
 */
export async function getNations(): Promise<ApiResponse<FilterOption[]>> {
  return apiClient.get(`${BASE}/filters/nations`);
}

/**
 * GET /api/v1/filters/leagues
 */
export async function getLeagues(): Promise<ApiResponse<FilterOption[]>> {
  return apiClient.get(`${BASE}/filters/leagues`);
}
