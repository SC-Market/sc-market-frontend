import type { GameItemListingResult } from "../../../../store/api/v2/market"

/**
 * The one rule for "who sells this item" in a grouped listing: one seller per
 * distinct shop_id, in the order the rows arrive. The collapsed GroupCard's
 * "N sellers" and the expanded GroupSellers list both go through it, so the
 * expansion shows exactly one card per seller it counts (never only the
 * superlative winners).
 */
export function sellerShops<T extends { shop_id: string }>(
  rows: readonly T[],
): T[][] {
  const byShop = new Map<string, T[]>()
  for (const row of rows) {
    const rowsOfShop = byShop.get(row.shop_id)
    if (rowsOfShop) rowsOfShop.push(row)
    else byShop.set(row.shop_id, [row])
  }
  return [...byShop.values()]
}

/** "N sellers": distinct shops (sellerShops). */
export function sellerCount(rows: readonly { shop_id: string }[]): number {
  return sellerShops(rows).length
}

/** Quality score for a variant (higher = better). Value preferred over tier. */
export function variantQualityScore(v: GameItemListingResult): number {
  if (v.quality_value != null) return v.quality_value
  if (v.quality_tier != null) return v.quality_tier
  return -1 // unspecified quality sorts last
}

export type SellerTag = "lowestPrice" | "highestQuality" | "topRated"

export interface SellerCard {
  shop_id: string
  /** The variant the card shows: the one that won a tag for this shop, else its cheapest. */
  variant: GameItemListingResult
  /** This shop's in-stock variants of the item. */
  variant_count: number
  /** Superlatives this seller wins (several are possible, none is fine). */
  tags: SellerTag[]
}

/** Neutral prior for an unrated shop, and its weight (about 5 reviews of pull). */
const PRIOR_MEAN = 3.5
const PRIOR_WEIGHT = 5

/**
 * Bayesian rating, so a 5-star shop with 1 review doesn't outrank a 4.9-star
 * shop with 300.
 */
function ratingScore(v: GameItemListingResult): number {
  const n = v.shop_rating_count ?? 0
  const r = v.shop_rating ?? 0
  return (PRIOR_WEIGHT * PRIOR_MEAN + n * r) / (PRIOR_WEIGHT + n)
}

/**
 * The expanded group: one card per seller (sellerShops), superlative winners
 * first (lowest price, highest quality, top rated), then the other sellers in
 * the order they arrive (the fetch is price ascending).
 */
export function sellerCards(
  variants: readonly GameItemListingResult[],
): SellerCard[] {
  if (variants.length === 0) return []
  const lowestPrice = variants.reduce((a, b) => (b.price < a.price ? b : a))
  const highestQuality = variants.reduce((a, b) =>
    variantQualityScore(b) > variantQualityScore(a) ? b : a,
  )
  const topRated = variants.reduce((a, b) =>
    ratingScore(b) > ratingScore(a) ? b : a,
  )
  const winners: [SellerTag, GameItemListingResult | null][] = [
    ["lowestPrice", lowestPrice],
    [
      "highestQuality",
      variantQualityScore(highestQuality) >= 0 ? highestQuality : null,
    ],
    ["topRated", (topRated.shop_rating ?? 0) > 0 ? topRated : null],
  ]

  const cards = sellerShops(variants).map((rows): SellerCard => {
    const won = winners.filter(([, v]) => v?.shop_id === rows[0].shop_id)
    const cheapest = rows.reduce((a, b) => (b.price < a.price ? b : a))
    // Show the variant that earned the shop its first tag (a shop's highest
    // quality variant may not be its cheapest), else its cheapest.
    const shown = won.find(([tag]) => tag !== "topRated")?.[1] ?? cheapest
    return {
      shop_id: rows[0].shop_id,
      variant: shown,
      variant_count: rows.length,
      tags: won.map(([tag]) => tag),
    }
  })
  const rank = (c: SellerCard) => {
    const firstTag = winners.findIndex(([tag]) => c.tags.includes(tag))
    return firstTag < 0 ? winners.length : firstTag
  }
  // Array.prototype.sort is stable: same-rank sellers keep the fetch order.
  return cards.sort((a, b) => rank(a) - rank(b))
}
