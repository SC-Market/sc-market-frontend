import { describe, expect, it } from "vitest"
import { remainingQuantity, totalRemainingQuantity } from "../buyOrders"

describe("remainingQuantity", () => {
  it.each([
    [{ quantity: 10, quantity_fulfilled: 0 }, 10],
    [{ quantity: 10, quantity_fulfilled: 4 }, 6],
    [{ quantity: 10, quantity_fulfilled: 10 }, 0],
    [{ quantity: 10 }, 10],
    [{ quantity: 10, quantity_fulfilled: null }, 10],
    [{ quantity: null, quantity_fulfilled: null }, 0],
    [{}, 0],
  ])("%j -> %i", (order, expected) => {
    expect(remainingQuantity(order)).toBe(expected)
  })

  it("never goes negative when overfilled", () => {
    expect(remainingQuantity({ quantity: 5, quantity_fulfilled: 7 })).toBe(0)
  })
})

describe("totalRemainingQuantity", () => {
  it("is 0 for no orders", () => {
    expect(totalRemainingQuantity([])).toBe(0)
  })

  it("sums what is still wanted", () => {
    expect(
      totalRemainingQuantity([
        { quantity: 10, quantity_fulfilled: 3 },
        { quantity: 5 },
        { quantity: 2, quantity_fulfilled: 2 },
      ]),
    ).toBe(12)
  })
})
