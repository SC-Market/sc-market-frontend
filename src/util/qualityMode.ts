/**
 * Quality mode determination for game items.
 * Shared between listing creation, buy orders, and stock management.
 */

export type QualityMode = "none" | "tier" | "value"

/** Item types that use numeric quality value (0-1000) — crafting ingredients */
const VALUE_TYPES = /resource|commodity|ore|mineral|raw material/i

/** Item types that use quality tier (1-5) — crafted outputs */
const TIER_TYPES = /armor|weapon|clothing|undersuit|helmet|backpack|arms|legs|core|magazine|battery/i

/**
 * Determine which quality input to show for a given item type.
 * - "value": numeric 0-1000 (resources, commodities, ores)
 * - "tier": dropdown 1-5 (armor, weapons, clothing)
 * - "none": no quality input (ships, components, misc)
 */
export function getQualityMode(itemType: string | null | undefined): QualityMode {
  if (!itemType) return "none"
  if (VALUE_TYPES.test(itemType)) return "value"
  if (TIER_TYPES.test(itemType)) return "tier"
  return "none"
}

/** Format quality for display */
export function formatQuality(mode: QualityMode, min?: number, max?: number): string | null {
  if (mode === "none" || (min == null && max == null)) return null
  if (mode === "tier") {
    if (min != null && max != null && min !== max) return `Tier ${min}–${max}`
    return `Tier ${min ?? max}`
  }
  // value mode
  if (min != null && max != null && min !== max) return `${min}–${max}`
  return `${min ?? max}`
}
