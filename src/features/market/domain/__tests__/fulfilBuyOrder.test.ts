import { describe, expect, it } from "vitest"
import {
  fulfilMaxQuantity,
  usableFulfilOptions,
  validateFulfil,
  type FulfilOption,
} from "../fulfilBuyOrder"

const buyOrder = { quantity: 10, quantity_fulfilled: 2 } // 8 still wanted
const opt = (over: Partial<FulfilOption> = {}): FulfilOption => ({
  listing_id: "l1",
  variant_id: "v1",
  available: 5,
  problem: null,
  ...over,
})

describe("usableFulfilOptions", () => {
  it("keeps only options without a problem, in order", () => {
    const a = opt({ listing_id: "a" })
    const b = opt({ listing_id: "b", problem: "Above the buyer's maximum" })
    const c = opt({ listing_id: "c", problem: undefined })
    expect(usableFulfilOptions([a, b, c])).toEqual([a, c])
  })
})

describe("fulfilMaxQuantity", () => {
  it.each([
    ["no option: what is still wanted", undefined, 8],
    ["capped at the listing's stock", { available: 5 }, 5],
    ["capped at what is still wanted", { available: 50 }, 8],
    ["no stock", { available: 0 }, 0],
  ])("%s", (_name, option, expected) => {
    expect(fulfilMaxQuantity(buyOrder, option)).toBe(expected)
  })

  it("is 0 for a filled buy order", () => {
    expect(
      fulfilMaxQuantity(
        { quantity: 3, quantity_fulfilled: 3 },
        { available: 9 },
      ),
    ).toBe(0)
  })
})

describe("validateFulfil", () => {
  it.each([
    ["no listing picked", null, 1, "no_listing"],
    [
      "listing the backend rejects",
      opt({ problem: "Quality too low" }),
      1,
      "listing_unusable",
    ],
    ["zero", opt(), 0, "quantity_range"],
    ["negative", opt(), -1, "quantity_range"],
    ["fraction", opt(), 1.5, "quantity_range"],
    ["NaN", opt(), Number.NaN, "quantity_range"],
    ["more than listed stock", opt({ available: 5 }), 6, "quantity_range"],
    ["more than still wanted", opt({ available: 50 }), 9, "quantity_range"],
    ["one", opt(), 1, null],
    ["all listed stock", opt({ available: 5 }), 5, null],
    ["all still wanted", opt({ available: 50 }), 8, null],
  ] as const)("%s", (_name, option, quantity, expected) => {
    expect(validateFulfil({ buyOrder, option, quantity })).toBe(expected)
  })

  it("rejects any quantity on a filled buy order", () => {
    expect(
      validateFulfil({
        buyOrder: { quantity: 2, quantity_fulfilled: 2 },
        option: opt(),
        quantity: 1,
      }),
    ).toBe("quantity_range")
  })
})
