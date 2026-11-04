/** Highest target price the backend stores (int4). */
export const MAX_TARGET_PRICE = 2_147_483_647

/**
 * A typed target price, or null when it isn't a whole number above 1 aUEC
 * (1 aUEC listings are placeholders and never alert).
 */
export function parseTargetPrice(value: string): number | null {
  const trimmed = value.trim().replace(/[,\s]/g, "")
  if (!/^\d+$/.test(trimmed)) return null
  const price = Number(trimmed)
  if (!Number.isSafeInteger(price) || price <= 1 || price > MAX_TARGET_PRICE)
    return null
  return price
}

/** Quality tiers a watch can require (item_variants quality_tier 1-5). */
export const QUALITY_TIERS = [1, 2, 3, 4, 5] as const
