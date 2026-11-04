import { describe, it, expect } from "vitest"
import { canManageListing } from "../listingPermissions"

const perms = (
  p: Partial<{
    can_manage: boolean
    manage_market: boolean
    manage_stock: boolean
    manage_orders: boolean
  }>,
) => ({
  can_manage: false,
  manage_market: false,
  manage_stock: false,
  manage_orders: false,
  ...p,
})

describe("canManageListing", () => {
  const myShops = [
    {
      shop_id: "own",
      permissions: perms({
        can_manage: true,
        manage_market: true,
        manage_stock: true,
        manage_orders: true,
      }),
    },
    {
      shop_id: "org-market",
      permissions: perms({ can_manage: true, manage_market: true }),
    },
    { shop_id: "org-stock", permissions: perms({ manage_stock: true }) },
    { shop_id: "org-orders", permissions: perms({ manage_orders: true }) },
    { shop_id: "org-member", permissions: perms({}) },
  ]

  it.each([
    ["my own shop", "own", true],
    ["org shop, Manage Market", "org-market", true],
    ["org shop, Manage Stock only", "org-stock", false],
    ["org shop, Manage Orders only", "org-orders", false],
    ["org shop, plain member", "org-member", false],
    ["someone else's shop", "elsewhere", false],
  ])("%s", (_name, shopId, expected) => {
    expect(canManageListing(shopId, myShops)).toBe(expected)
  })

  it("is false while the shops or the listing are unknown (anonymous, loading)", () => {
    expect(canManageListing("own", undefined)).toBe(false)
    expect(canManageListing(undefined, myShops)).toBe(false)
    expect(canManageListing(null, [])).toBe(false)
  })
})
