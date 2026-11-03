import { describe, it, expect } from "vitest"
import type { PriceOracleItem, ShopResponse } from "../../../../store/api/v2/market"
import {
  emptyQuickListForm,
  marketPriceHint,
  nextQuickListForm,
  parseLastShops,
  quickListDraft,
  quickListShops,
  quickListTotal,
  resolveSellingAsShop,
  shopSlugFromPath,
  suggestedQuickListPrice,
} from "../quickList"
import { validateListingDraft } from "../listingDraft"

const ITEM = { id: "item-1", name: "Arrowhead Sniper Rifle", type: "Ranged Weapon" }

function stats(current: Partial<PriceOracleItem["current"]>, median30d: number | null = null): PriceOracleItem {
  return {
    current: {
      ask_count: 0,
      seller_count: 0,
      quantity_available: 0,
      lowest_ask: null,
      median_ask: null,
      highest_ask: null,
      outliers_excluded: 0,
      confidence: "none",
      sample_note: "",
      ...current,
    },
    trend_30d: { days_with_data: 0, median_30d: median30d, change_pct: null, daily: [] },
  } as unknown as PriceOracleItem
}

describe("suggestedQuickListPrice", () => {
  it("starts from the current median, then the 30-day median, then the lowest ask", () => {
    expect(suggestedQuickListPrice(stats({ median_ask: 14000.4, lowest_ask: 12500 }, 13000))).toBe(14000)
    expect(suggestedQuickListPrice(stats({ lowest_ask: 12500 }, 13000))).toBe(13000)
    expect(suggestedQuickListPrice(stats({ lowest_ask: 12500 }))).toBe(12500)
  })

  it("suggests nothing without a market", () => {
    expect(suggestedQuickListPrice(stats({}))).toBeNull()
    expect(suggestedQuickListPrice(undefined)).toBeNull()
  })
})

describe("marketPriceHint", () => {
  it("gives low, median and the listing count", () => {
    expect(marketPriceHint(stats({ lowest_ask: 12500, median_ask: 14000, ask_count: 6 }))).toEqual({
      low: 12500,
      median: 14000,
      listings: 6,
    })
    expect(marketPriceHint(stats({}))).toBeNull()
  })
})

describe("quickListDraft", () => {
  it("is a valid listing titled after the item, with one lot", () => {
    const form = { ...emptyQuickListForm(ITEM), price: 14000, quantity: 5, qualityTier: 3 }
    const draft = quickListDraft(form)
    expect(validateListingDraft(draft)).toBeNull()
    expect(draft).toMatchObject({
      gameItemId: "item-1",
      title: "Arrowhead Sniper Rifle",
      pricingMode: "unified",
      basePrice: 14000,
      lots: [{ quantity: 5, quality_tier: 3 }],
      quantityUnit: "unit",
      status: "active",
    })
  })

  it("turns batches into lots, with their own prices when asked", () => {
    const form = {
      ...emptyQuickListForm({ ...ITEM, type: "Commodity" }),
      price: 100,
      stockMode: "batches" as const,
      pricePerBatch: true,
      batches: [
        { key: "a", quantity: 3, location_id: "port-tressler", quality_value: 700, price: 120 },
        { key: "b", quantity: 2, location_id: "area18", price: 90 },
      ],
    }
    const draft = quickListDraft(form)
    expect(draft.pricingMode).toBe("per_variant")
    expect(draft.quantityUnit).toBe("scu")
    expect(draft.lots).toEqual([
      { quantity: 3, location_id: "port-tressler", quality_tier: undefined, quality_value: 700, price: 120 },
      { quantity: 2, location_id: "area18", quality_tier: undefined, quality_value: undefined, price: 90 },
    ])
    expect(quickListTotal(form)).toBe(5)
  })

  it("has no item to validate when none is picked", () => {
    expect(validateListingDraft(quickListDraft(emptyQuickListForm()))).toEqual({ code: "gameItemRequired" })
  })
})

describe("nextQuickListForm", () => {
  it("clears the item, price and quantity but keeps the stock mode and batch locations", () => {
    const form = {
      ...emptyQuickListForm(ITEM),
      price: 14000,
      quantity: 5,
      description: "Mint",
      stockMode: "batches" as const,
      pickupMethod: "pickup" as const,
      batches: [{ key: "a", quantity: 3, location_id: "area18", price: 5 }],
    }
    const next = nextQuickListForm(form)
    expect(next.item).toBeNull()
    expect(next.price).toBe(0)
    expect(next.quantity).toBe(1)
    expect(next.description).toBe("")
    expect(next.stockMode).toBe("batches")
    expect(next.pickupMethod).toBe("pickup")
    expect(next.batches).toEqual([{ key: "a", quantity: 1, location_id: "area18", price: undefined }])
  })
})

const shop = (slug: string, canManage = true, status = "active") =>
  ({ shop_id: `id-${slug}`, slug, status, permissions: { can_manage: canManage } }) as ShopResponse

describe("quickListShops", () => {
  it("offers only the shops the user can list in", () => {
    expect(quickListShops([shop("mine"), shop("org-view-only", false), shop("old", true, "archived")]).map((s) => s.slug)).toEqual([
      "mine",
    ])
    expect(quickListShops(undefined)).toEqual([])
  })
})

describe("resolveSellingAsShop", () => {
  const shops = [shop("mine"), shop("ardent")]
  const base = { shops, pageShopSlug: null, sidebarShopSlug: null, lastShopId: null }

  it("follows the page's shop, then the sidebar's, then the last one used, then the first", () => {
    expect(resolveSellingAsShop({ ...base, pageShopSlug: "ardent", sidebarShopSlug: "mine", lastShopId: "id-mine" })).toBe(
      "id-ardent",
    )
    expect(resolveSellingAsShop({ ...base, sidebarShopSlug: "ardent", lastShopId: "id-mine" })).toBe("id-ardent")
    expect(resolveSellingAsShop({ ...base, lastShopId: "id-ardent" })).toBe("id-ardent")
    expect(resolveSellingAsShop(base)).toBe("id-mine")
  })

  it("skips a context shop the user can't list in", () => {
    expect(resolveSellingAsShop({ ...base, pageShopSlug: "someone-else", lastShopId: "id-ardent" })).toBe("id-ardent")
    expect(resolveSellingAsShop({ ...base, shops: [] })).toBeNull()
  })
})

describe("shopSlugFromPath / parseLastShops", () => {
  it("reads the shop of a /shop/:slug path", () => {
    expect(shopSlugFromPath("/shop/ardent/listings")).toBe("ardent")
    expect(shopSlugFromPath("/shops/ardent")).toBeNull()
    expect(shopSlugFromPath("/market/aggregate/x")).toBeNull()
  })

  it("ignores a broken stored value", () => {
    expect(parseLastShops('{"mira":"id-mine","x":3}')).toEqual({ mira: "id-mine" })
    expect(parseLastShops("not json")).toEqual({})
    expect(parseLastShops("[1]")).toEqual({})
    expect(parseLastShops(null)).toEqual({})
  })
})
