import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../../../hooks/login/useSession", () => ({ useIsAuthenticated: vi.fn() }))
vi.mock("../../../../store/api/v2/market", () => ({ useGetMyShopsQuery: vi.fn() }))

import * as session from "../../../../hooks/login/useSession"
import * as market from "../../../../store/api/v2/market"
import { useListingPermissions } from "../useListingPermissions"

const isAuthenticated = vi.mocked(session.useIsAuthenticated)
const myShopsQuery = vi.mocked(market.useGetMyShopsQuery)
type MyShopsResult = ReturnType<typeof market.useGetMyShopsQuery>

describe("useListingPermissions", () => {
  beforeEach(() => vi.clearAllMocks())

  it("anonymous visitors never request their shops and can't manage", () => {
    isAuthenticated.mockReturnValue(false)
    myShopsQuery.mockReturnValue({ data: undefined } as unknown as MyShopsResult)
    const { result } = renderHook(() => useListingPermissions("shop-1"))
    expect(result.current.canManage).toBe(false)
    expect(myShopsQuery).toHaveBeenCalledWith(undefined, { skip: true })
  })

  it("follows can_manage of the listing's shop in /shops/mine", () => {
    isAuthenticated.mockReturnValue(true)
    myShopsQuery.mockReturnValue({
      data: [
        { shop_id: "shop-1", permissions: { can_manage: true, manage_market: true, manage_stock: true, manage_orders: true } },
        { shop_id: "shop-2", permissions: { can_manage: false, manage_market: false, manage_stock: true, manage_orders: false } },
      ],
    } as unknown as MyShopsResult)
    expect(renderHook(() => useListingPermissions("shop-1")).result.current.canManage).toBe(true)
    expect(renderHook(() => useListingPermissions("shop-2")).result.current.canManage).toBe(false)
    expect(renderHook(() => useListingPermissions("shop-3")).result.current.canManage).toBe(false)
    expect(myShopsQuery).toHaveBeenCalledWith(undefined, { skip: false })
  })
})
