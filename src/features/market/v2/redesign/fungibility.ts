/**
 * Phase 0 fungibility heuristic.
 *
 * The backend does not yet expose a `fungible` flag on game_items
 * (see MARKET_V2_RESEARCH.md §11.4/§11.5), so for the redesign preview we derive
 * it from the item's category/type. Rule: an item is treated as NON-fungible
 * only when it is clearly per-instance unique or a multi-item set — Ships and
 * Bundles. Everything else (commodities, components, weapons, armor, clothing…)
 * is treated as fungible and aggregates across sellers.
 *
 * This is deliberately conservative: it only pulls out the unambiguous
 * non-fungible cases. When the real game-data-driven flag lands, replace
 * `isFungibleType` with the backend value.
 *
 * `game_item_type` on search results corresponds to the subcategory in
 * GET /api/v2/game-items/categories (e.g. "Ship for Sale/Rental", "Bundle").
 */

/** Subcategory values (game_item_type) that are non-fungible in Phase 0. */
const NON_FUNGIBLE_TYPES = new Set<string>([
  "Ship for Sale/Rental", // ships: per-instance paint/loadout/insurance
  "Bundle", // multi-item set sold as a unit
])

/**
 * Returns true when a listing's item type should aggregate across sellers.
 * Unknown/empty types default to fungible (the common case for SC items).
 */
export function isFungibleType(gameItemType: string | null | undefined): boolean {
  if (!gameItemType) return true
  return !NON_FUNGIBLE_TYPES.has(gameItemType)
}
