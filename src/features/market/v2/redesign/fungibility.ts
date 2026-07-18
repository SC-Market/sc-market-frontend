/**
 * Phase 0 fungibility heuristic.
 *
 * The backend does not yet expose a `fungible` flag on game_items
 * (see MARKET_V2_RESEARCH.md §11.4/§11.5), and the extracted game data has no
 * `stackable`/`fungible` field either — the only reliable signal is the item
 * category. So we derive fungibility from the item's category with a
 * conservative allowlist.
 *
 * DECISION (Phase 0): "narrow" split — only raw goods with no per-instance
 * identity aggregate across sellers. Everything that carries a grade/size or
 * per-instance state (ship components, weapons, armor, clothing, paints) and
 * all ships are non-fungible and render as standalone listings, matching how
 * the game treats them (health/wear/loadout are per-instance).
 *
 * `game_item_type` on search results is the SUBCATEGORY from
 * GET /api/v2/game-items/categories (e.g. "Commodity", "Food/Drink",
 * "Quantum Drive", "Ship for Sale/Rental"). We match on subcategory, with a
 * top-level-category fallback via `isFungibleCategory`.
 *
 * FUTURE (not committed): two wider splits are possible if we later decide
 * aggregation should cover more:
 *   - "intermediate": also treat grade-standardized components/weapons/armor as
 *     fungible (aggregation genuinely helps there), keeping ships/bundles/
 *     custom/paints non-fungible.
 *   - "wide": everything except ships and bundles is fungible.
 * To move to those, extend FUNGIBLE_SUBCATEGORIES / FUNGIBLE_CATEGORIES below
 * (or, better, replace this whole module with the backend `fungible` flag once
 * it exists). Keep this heuristic behind the market_v2_redesign flag until then.
 */

/**
 * Subcategories (game_item_type) that are fungible in the Phase 0 "narrow"
 * split — raw goods only. Sourced from GET /api/v2/game-items/categories.
 */
const FUNGIBLE_SUBCATEGORIES = new Set<string>([
  "Commodity", // Commodity category
  "Container", // Other > Container — how sellers list bulk resources/materials
  // (refined ore, gas, etc.); interchangeable by contents, so aggregate them.
  "Food/Drink", // Consumable
  "Medical Pen", // Consumable
  "Weapon Magazine", // Consumable (ammo — interchangeable by SKU)
])

/**
 * Top-level categories that are entirely fungible, used as a fallback when a
 * result's game_item_type happens to carry the top-level category instead of a
 * subcategory. "Commodity" and "Consumable" are wholly raw goods.
 */
const FUNGIBLE_CATEGORIES = new Set<string>(["Commodity", "Consumable"])

/**
 * Returns true when a listing's item type should aggregate across sellers.
 * Narrow Phase 0 rule: only raw goods aggregate; everything else (graded
 * components, weapons, armor, clothing, paints, ships, bundles, custom) is
 * standalone. Unknown/empty types default to NON-fungible (standalone) so we
 * never wrongly merge distinct items.
 */
export function isFungibleType(gameItemType: string | null | undefined): boolean {
  if (!gameItemType) return false
  return (
    FUNGIBLE_SUBCATEGORIES.has(gameItemType) || FUNGIBLE_CATEGORIES.has(gameItemType)
  )
}
