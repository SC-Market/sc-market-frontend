import type { CartItemDetail } from "../../../store/api/v2/market"

/** A cart seller group: one shop's items, their total and its next availability. */
export interface CartSellerGroup {
  sellerName: string
  sellerId: string
  items: CartItemDetail[]
  total: number
  nextAvailable?: string | null
}

/** Cart items grouped by shop, in the order each shop first appears. */
export function groupCartBySeller(items: CartItemDetail[]): CartSellerGroup[] {
  const groups = new Map<string, CartSellerGroup>()
  for (const item of items) {
    const key = item.listing.shop_id
    if (!groups.has(key))
      groups.set(key, {
        sellerName: item.listing.shop_name,
        sellerId: key,
        items: [],
        total: 0,
        nextAvailable: item.listing.shop_next_available,
      })
    const g = groups.get(key)!
    g.items.push(item)
    g.total += item.subtotal
  }
  return [...groups.values()]
}
