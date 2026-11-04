import { describe, it, expect } from "vitest"
import {
  lotTotalAfterDelta,
  newStockRowRequest,
  stockRowChanges,
} from "../stockRowEdit"

const existing = { status: "active", price_min: 100, quantity_available: 10 }

describe("stockRowChanges", () => {
  it("nothing changed", () => {
    expect(
      stockRowChanges(existing, {
        status: "active",
        price: 100,
        quantity_available: 10,
      }),
    ).toEqual({
      listingPatch: null,
      quantityDelta: 0,
    })
  })

  it("status and price go in the listing patch", () => {
    expect(
      stockRowChanges(existing, { status: "inactive", price: 120 }),
    ).toEqual({
      listingPatch: { status: "inactive", base_price: 120 },
      quantityDelta: 0,
    })
  })

  it("quantity is a delta, up or down", () => {
    expect(
      stockRowChanges(existing, { quantity_available: 15 }).quantityDelta,
    ).toBe(5)
    expect(
      stockRowChanges(existing, { quantity_available: 4 }).quantityDelta,
    ).toBe(-6)
  })
})

describe("lotTotalAfterDelta", () => {
  it.each([
    [8, 2, 10],
    [8, -8, 0],
    [8, -9, null],
    [undefined, 2, null],
  ])("lot %s, delta %s -> %s", (lot, delta, expected) => {
    expect(lotTotalAfterDelta(lot, delta)).toBe(expected)
  })
})

describe("newStockRowRequest", () => {
  it("needs a game item", () => {
    expect(newStockRowRequest({ price: 5 }, "shop-1", "New Listing")).toBeNull()
  })

  it("one unified-price lot for the shop", () => {
    expect(
      newStockRowRequest(
        {
          game_item_id: "gi-1",
          game_item_name: "Laser",
          price: 50,
          quantity_available: 3,
        },
        "shop-1",
        "New Listing",
      ),
    ).toEqual({
      title: "Laser",
      game_item_id: "gi-1",
      pricing_mode: "unified",
      base_price: 50,
      lots: [{ quantity: 3, variant_attributes: {} }],
      shop_id: "shop-1",
    })
  })

  it("falls back to the row defaults", () => {
    expect(
      newStockRowRequest({ game_item_id: "gi-1" }, "shop-1", "New Listing"),
    ).toMatchObject({
      title: "New Listing",
      base_price: 1,
      lots: [{ quantity: 1, variant_attributes: {} }],
    })
  })
})
