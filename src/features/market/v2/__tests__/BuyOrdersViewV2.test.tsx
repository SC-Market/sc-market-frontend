import { describe, it, expect } from "vitest"
import { BuyOrdersViewV2, buyOrderPriceRange } from "../BuyOrdersViewV2"

describe("BuyOrdersViewV2", () => {
  it("exports the component", () => {
    expect(BuyOrdersViewV2).toBeDefined()
  })
})

describe("buyOrderPriceRange", () => {
  it("spans the priced orders", () => {
    expect(
      buyOrderPriceRange([{ price_per_unit: 300 }, { price_per_unit: 100 }]),
    ).toEqual({ min: 100, max: 300 })
  })

  it("ignores orders posted without a price", () => {
    expect(
      buyOrderPriceRange([{ price_per_unit: 0 }, { price_per_unit: 250 }]),
    ).toEqual({ min: 250, max: 250 })
  })

  it("is null when no order names a price (not ∞ – 0)", () => {
    expect(buyOrderPriceRange([{ price_per_unit: 0 }])).toBeNull()
  })
})
