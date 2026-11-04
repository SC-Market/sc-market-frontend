import { describe, expect, it } from "vitest"
import {
  canEditShopListings,
  canEditShopStockLots,
  canOpenShopSettings,
} from "../shopPermissions"

const perms = (
  p: Partial<{
    can_manage: boolean
    manage_market: boolean
    manage_stock: boolean
    manage_orders: boolean
  }>,
) => ({
  permissions: {
    can_manage: false,
    manage_market: false,
    manage_stock: false,
    manage_orders: false,
    ...p,
  },
})

describe("shop permission helpers", () => {
  it("lets shop managers (owner or Manage Market) edit listings and lots", () => {
    const shop = perms({ can_manage: true, manage_market: true })
    expect(canEditShopListings(shop)).toBe(true)
    expect(canEditShopStockLots(shop)).toBe(true)
  })

  it("lets Manage Stock edit lots but not listings", () => {
    const shop = perms({ manage_stock: true })
    expect(canEditShopListings(shop)).toBe(false)
    expect(canEditShopStockLots(shop)).toBe(true)
  })

  it("gives Manage Orders neither", () => {
    const shop = perms({ manage_orders: true })
    expect(canEditShopListings(shop)).toBe(false)
    expect(canEditShopStockLots(shop)).toBe(false)
  })

  it("allows nothing without permissions (someone else's shop)", () => {
    expect(canEditShopListings({})).toBe(false)
    expect(canEditShopStockLots({})).toBe(false)
  })

  describe("canOpenShopSettings", () => {
    it("allows shop managers (owner or Manage Market: can_manage)", () => {
      expect(
        canOpenShopSettings(perms({ can_manage: true, manage_market: true })),
      ).toBe(true)
    })

    it("follows can_manage, the flag the backend's canManageShop sets", () => {
      expect(canOpenShopSettings(perms({ can_manage: true }))).toBe(true)
      expect(canOpenShopSettings(perms({ manage_market: true }))).toBe(false)
    })

    it("denies Manage Stock and Manage Orders on their own", () => {
      expect(canOpenShopSettings(perms({ manage_stock: true }))).toBe(false)
      expect(canOpenShopSettings(perms({ manage_orders: true }))).toBe(false)
      expect(
        canOpenShopSettings(perms({ manage_stock: true, manage_orders: true })),
      ).toBe(false)
    })

    it("denies without permissions (someone else's shop)", () => {
      expect(canOpenShopSettings({})).toBe(false)
    })
  })
})
