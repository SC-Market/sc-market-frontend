/**
 * Phase 0 fungibility heuristic.
 *
 * The backend does not yet expose a `fungible` flag on game_items
 * (see MARKET_V2_RESEARCH.md §11.4/§11.5), and the extracted game data has no
 * `stackable`/`fungible` field either — the only reliable signal is the item
 * category. So we derive fungibility from the item's category.
 *
 * DECISION (Phase 0): "wide" split — aggregate almost everything, treat only the
 * genuinely non-fungible cases as standalone. Components, weapons (guns), armor,
 * clothing, ammo, commodities, containers, etc. all aggregate across sellers.
 * Yes, guns/armor/components technically degrade (per-instance health/wear), but
 * in practice buyers shop them by model+grade like commodities, and aggregation
 * across sellers is exactly the value there — so they're treated as fungible.
 *
 * Only SHIPS and BUNDLES stay non-fungible: a ship carries a unique per-instance
 * loadout/paint/insurance, and a bundle is inherently unique to its seller. Items
 * with no catalog type (custom / non-catalog) are also non-fungible.
 *
 * `game_item_type` on search results is the SUBCATEGORY from
 * GET /api/v2/game-items/categories (e.g. "Commodity", "Quantum Drive",
 * "Ranged Weapon", "Ship for Sale/Rental").
 *
 * When the backend `fungible` flag lands, replace this whole module with it.
 * Keep this heuristic behind the market_v2_redesign flag until then.
 */

/**
 * Subcategories (game_item_type) that are NON-fungible — everything else
 * aggregates. Ships have per-instance loadout/paint/insurance; bundles are
 * unique per seller. (Denylist rather than allowlist: with the wide split it's a
 * far shorter, more maintainable list than enumerating every fungible category.)
 */
const NON_FUNGIBLE_SUBCATEGORIES = new Set<string>([
  "Ship for Sale/Rental", // Ship — unique per-instance loadout/paint/insurance
  "Bundle", // Other > Bundle — a multi-item set, unique to its seller
])

/**
 * Returns true when a listing's item type should aggregate across sellers.
 * Wide Phase 0 rule: everything aggregates EXCEPT ships, bundles, and items with
 * no catalog type (custom / non-catalog), which render as standalone listings.
 */
export function isFungibleType(gameItemType: string | null | undefined): boolean {
  if (!gameItemType) return false // custom / non-catalog → standalone
  return !NON_FUNGIBLE_SUBCATEGORIES.has(gameItemType)
}
