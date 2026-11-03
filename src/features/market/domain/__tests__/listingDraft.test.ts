import { describe, it, expect } from "vitest"
import { testT } from "../../../../test/mocks/reactI18next"
import {
  buildCreateListingRequest,
  emptyListingDraft,
  listingDraftIssueError,
  quantityUnitFor,
  validateListingDraft,
  type ListingDraft,
} from "../listingDraft"

const draft = (patch: Partial<ListingDraft> = {}): ListingDraft => ({
  ...emptyListingDraft(),
  gameItemId: "item-1",
  title: "Arrowhead Sniper Rifle",
  basePrice: 14000,
  ...patch,
})

describe("validateListingDraft", () => {
  it("accepts a draft with an item, a title, a price and a quantity", () => {
    expect(validateListingDraft(draft())).toBeNull()
  })

  it("names the first problem, in form order", () => {
    expect(validateListingDraft(draft({ gameItemId: null, basePrice: 0 }))).toEqual({ code: "gameItemRequired" })
    expect(validateListingDraft(draft({ title: "  " }))).toEqual({ code: "titleRequired" })
    expect(validateListingDraft(draft({ title: "x".repeat(501) }))).toEqual({ code: "titleTooLong" })
    expect(validateListingDraft(draft({ basePrice: 0 }))).toEqual({ code: "basePriceRequired" })
    expect(validateListingDraft(draft({ lots: [] }))).toEqual({ code: "stockLotRequired" })
    expect(validateListingDraft(draft({ lots: [{ quantity: 2 }, { quantity: 0 }] }))).toEqual({
      code: "quantityRequired",
      index: 1,
    })
    expect(validateListingDraft(draft({ lots: [{ quantity: 1, quality_tier: 6 }] }))).toEqual({
      code: "qualityTierRange",
      index: 0,
    })
    expect(validateListingDraft(draft({ lots: [{ quantity: 1, quality_value: 1001 }] }))).toEqual({
      code: "qualityValueRange",
      index: 0,
    })
    expect(validateListingDraft(draft({ saleType: "auction" }))).toEqual({ code: "auctionEndTimeRequired" })
  })

  it("needs a price on every lot, not a base price, with per-variant pricing", () => {
    const perVariant = draft({ pricingMode: "per_variant", basePrice: 0, lots: [{ quantity: 1, price: 10 }, { quantity: 1 }] })
    expect(validateListingDraft(perVariant)).toEqual({ code: "variantPriceRequired", index: 1 })
    expect(validateListingDraft({ ...perVariant, lots: [{ quantity: 1, price: 10 }] })).toBeNull()
  })
})

describe("listingDraftIssueError", () => {
  it("points the error at its field, the first lot's quantity at Quantity", () => {
    expect(listingDraftIssueError({ code: "basePriceRequired" }, testT)).toEqual({
      field: "base_price",
      message: "Base price must be greater than 0",
    })
    expect(listingDraftIssueError({ code: "quantityRequired", index: 0 }, testT).field).toBe("quantity")
    expect(listingDraftIssueError({ code: "quantityRequired", index: 2 }, testT)).toEqual({
      field: "form",
      message: "Quantity must be greater than 0 for lot 3",
    })
  })
})

describe("buildCreateListingRequest", () => {
  const shop = { shop_id: "shop-1", is_org_owned: false }

  it("sends only what is set", () => {
    const request = buildCreateListingRequest({ ...draft({ title: " Rifle " }), gameItemId: "item-1" }, shop)
    expect(request).toEqual({
      title: "Rifle",
      description: undefined,
      game_item_id: "item-1",
      pricing_mode: "unified",
      base_price: 14000,
      lots: [{ quantity: 1, variant_attributes: {}, location_id: undefined, price: undefined }],
      pickup_method: undefined,
      quantity_unit: "unit",
      min_order_quantity: undefined,
      max_order_quantity: undefined,
      min_order_value: undefined,
      max_order_value: undefined,
      bulk_discount_tiers: undefined,
      shop_id: "shop-1",
      visibility: undefined,
      sale_type: "fixed",
      status: "active",
      auction_details: undefined,
      photo_resource_ids: undefined,
      external_photo_urls: undefined,
    })
  })

  it("sends lot prices only with per-variant pricing, and visibility only for org shops", () => {
    const request = buildCreateListingRequest(
      {
        ...draft({
          pricingMode: "per_variant",
          visibility: "private",
          lots: [{ quantity: 2, price: 50, quality_tier: 3, location_id: "loc" }],
        }),
        gameItemId: "item-1",
      },
      { shop_id: "org-shop", is_org_owned: true },
    )
    expect(request.base_price).toBeUndefined()
    expect(request.lots).toEqual([{ quantity: 2, variant_attributes: { quality_tier: 3 }, location_id: "loc", price: 50 }])
    expect(request.visibility).toBe("private")
  })

  it("sends the auction's end time as ISO 8601", () => {
    const request = buildCreateListingRequest(
      { ...draft({ saleType: "auction", auctionEndTime: "2026-12-01T18:00" }), gameItemId: "item-1" },
      shop,
    )
    expect(request.auction_details?.end_time).toBe(new Date("2026-12-01T18:00").toISOString())
    expect(request.auction_details?.min_bid_increment).toBe(1000)
  })
})

describe("quantityUnitFor", () => {
  it("counts commodities in SCU and everything else in units", () => {
    expect(quantityUnitFor("Commodity")).toBe("scu")
    expect(quantityUnitFor("Ranged Weapon")).toBe("unit")
    expect(quantityUnitFor(null)).toBe("unit")
  })
})
