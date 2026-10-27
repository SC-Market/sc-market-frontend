import { describe, expect, it } from "vitest"
import { canManageOrderStock } from "../canManageOrderStock"

const base = {
  hasV2Items: true,
  orgOrderManager: false,
  assigned: false,
  shopId: "shop-1",
  myShops: [],
}

describe("canManageOrderStock", () => {
  it("shows the tab to the owner of a user-owned shop, not only org orders", () => {
    expect(
      canManageOrderStock({
        ...base,
        myShops: [{ shop_id: "shop-1", permissions: { can_manage: true } }],
      }),
    ).toBe(true)
  })

  it("shows it to org order managers and the assigned seller", () => {
    expect(canManageOrderStock({ ...base, orgOrderManager: true })).toBe(true)
    expect(canManageOrderStock({ ...base, assigned: true })).toBe(true)
  })

  it("hides it from the buyer and from members who can't manage the shop", () => {
    expect(canManageOrderStock(base)).toBe(false)
    expect(
      canManageOrderStock({
        ...base,
        myShops: [{ shop_id: "shop-1", permissions: { can_manage: false } }],
      }),
    ).toBe(false)
    expect(
      canManageOrderStock({
        ...base,
        myShops: [{ shop_id: "other", permissions: { can_manage: true } }],
      }),
    ).toBe(false)
  })

  it("hides it for orders without V2 items", () => {
    expect(
      canManageOrderStock({
        ...base,
        hasV2Items: false,
        orgOrderManager: true,
      }),
    ).toBe(false)
  })
})
