/**
 * System API module.
 * Health checks and data status.
 */

import { apiClient } from "@/lib/api/client";
import type { DataStatusResponse, HealthResponse } from "@/types/api/common";

const BASE = "/api/v1";

/**
 * GET /api/v1/system/health
 */
export async function getHealth(): Promise<HealthResponse> {
  return apiClient.get(`${BASE}/system/health`);
}

/**
 * GET /api/v1/data-status
 * Returns record counts and last update time.
 */
export async function getDataStatus(): Promise<DataStatusResponse> {
  return apiClient.get(`${BASE}/data-status`);
}
