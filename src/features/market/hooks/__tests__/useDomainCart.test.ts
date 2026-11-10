import { describe, expect, it } from "vitest"
import type {
  CartItemDetail,
  GetCartResponse,
} from "../../../../store/api/v2/market"
import { orgScopedCart } from "../useDomainCart"

function item(
  owner: string | null,
  subtotal: number,
  quantity: number,
): CartItemDetail {
  return {
    cart_item_id: `ci-${subtotal}`,
    listing: {
      listing_id: `l-${subtotal}`,
      title: "Listing",
      shop_id: `shop-${owner}`,
      shop_name: "Shop",
      shop_slug: "shop",
      shop_owner_spectrum_id: owner,
      shop_rating: 0,
      status: "active",
    },
    variant: {
      variant_id: "v",
      attributes: {},
      display_name: "Standard",
      short_name: "STD",
    },
    quantity,
    price_per_unit: subtotal / quantity,
    subtotal,
    available: true,
    quantity_available: 10,
    price_changed: false,
  }
}

const cart: GetCartResponse = {
  items: [
    item("MEDRUNNER", 100, 1),
    item("BWINCORP", 50, 2),
    item(null, 10, 3),
  ],
  total_price: 160,
  item_count: 6,
}

describe("orgScopedCart", () => {
  it("is the whole cart on the main site", () => {
    expect(orgScopedCart(cart, undefined)).toBe(cart)
  })

  it("keeps only the org's items on its white-label domain, totals recomputed", () => {
    const scoped = orgScopedCart(cart, "medrunner")!
    expect(scoped.items).toHaveLength(1)
    expect(scoped.total_price).toBe(100)
    expect(scoped.item_count).toBe(1)
  })

  it("is empty before the domain's org is known", () => {
    expect(orgScopedCart(cart, "")!.items).toEqual([])
  })
})
