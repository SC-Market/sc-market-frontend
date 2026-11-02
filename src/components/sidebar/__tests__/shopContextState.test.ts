import { describe, it, expect } from "vitest"
import { shopContextFromState, withShopContext } from "../shopContextState"

describe("shop context router state", () => {
  it("round-trips the shop slug", () => {
    expect(shopContextFromState(withShopContext("test-alloc-manual"))).toBe("test-alloc-manual")
  })

  it("ignores state without a shop", () => {
    expect(shopContextFromState(null)).toBeNull()
    expect(shopContextFromState(undefined)).toBeNull()
    expect(shopContextFromState({ from: "/market" })).toBeNull()
    expect(shopContextFromState({ shopContext: "" })).toBeNull()
    expect(shopContextFromState({ shopContext: 3 })).toBeNull()
  })
})
