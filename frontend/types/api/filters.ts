/**
 * Filter API types.
 * Mirrors: FCUpgrade.Contracts.DTOs.FilterOptionDto
 */

/**
 * A single filter option item (used in dropdowns).
 * Mirrors: FilterOptionDto
 */
export interface FilterOption {
  id: string;
  name: string;
  count: number;
}
