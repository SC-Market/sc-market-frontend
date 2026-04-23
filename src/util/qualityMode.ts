/**
 * Quality mode determination for game items.
 * Shared between listing creation, buy orders, and stock management.
 *
 * game_items.type values come from P4K_TYPE_MAP in the import service:
 *   Helmet, Torso, Legs, Arms, Backpack, Undersuit — armor pieces (tier)
 *   Ranged Weapon, Ship Weapon, Weapon Attachment — weapons (tier)
 *   Commodity — resources sold in SCU (value)
 *   Container, Ship Livery, Other, Food/Drink, etc. — no quality
 */

export type QualityMode = "none" | "tier" | "value"

/** Item types that use numeric quality value (0-1000) — crafting ingredients/resources */
const VALUE_TYPES = new Set([
  "commodity",
])

/** Item types that use quality tier (1-5) — crafted outputs */
const TIER_TYPES = new Set([
  "helmet", "torso", "legs", "arms", "backpack", "undersuit",
  "ranged weapon", "weapon attachment",
  "jackets", "legwear", "shirts", "footwear", "gloves", "hat",
])

/**
 * Determine which quality input to show for a given item type.
 * - "value": numeric 0-1000 (commodities/resources)
 * - "tier": dropdown 1-5 (armor, weapons, clothing)
 * - "none": no quality input (ships, components, misc)
 */
export function getQualityMode(itemType: string | null | undefined): QualityMode {
  if (!itemType) return "none"
  const lower = itemType.toLowerCase()
  if (VALUE_TYPES.has(lower)) return "value"
  if (TIER_TYPES.has(lower)) return "tier"
  return "none"
}

/** Format quality for display */
export function formatQuality(mode: QualityMode, min?: number, max?: number): string | null {
  if (mode === "none" || (min == null && max == null)) return null
  if (mode === "tier") {
    if (min != null && max != null && min !== max) return `Tier ${min}–${max}`
    return `Tier ${min ?? max}`
  }
  if (min != null && max != null && min !== max) return `${min}–${max}`
  return `${min ?? max}`
}
