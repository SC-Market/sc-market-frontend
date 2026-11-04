import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
const navigate = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({ useAlertHook: () => alert }))
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }))
vi.mock("../../../../store/api/v2/market", () => ({
  useAddToCartMutation: vi.fn(),
  useCreatePurchaseMutation: vi.fn(),
  useCheckoutCartMutation: vi.fn(),
  useRemoveCartItemMutation: vi.fn(),
  useUpdateCartItemMutation: vi.fn(),
  useDeleteStockLotMutation: vi.fn(),
  useUpdateStockLotMutation: vi.fn(),
}))

import * as market from "../../../../store/api/v2/market"
import type { marketV2Api, CartItemDetail } from "../../../../store/api/v2/market"
import { mockMutationTrigger, mutationIdle } from "../../../../__tests__/rtkQueryMocks"
import { useAddToCart, useCartActions, useCartItemActions } from "../useCartActions"
import { useStockLotActions } from "../useStockLotActions"

type E = typeof marketV2Api.endpoints
const checkoutCart = mockMutationTrigger<E["checkoutCart"]>({ session_id: "S1", discord_invite: null } as E["checkoutCart"]["Types"]["ResultType"])
const removeCartItem = mockMutationTrigger<E["removeCartItem"]>()
const updateCartItem = mockMutationTrigger<E["updateCartItem"]>()
const updateStockLot = mockMutationTrigger<E["updateStockLot"]>()
const deleteStockLot = mockMutationTrigger<E["deleteStockLot"]>()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(market.useCheckoutCartMutation).mockReturnValue([checkoutCart, mutationIdle<E["checkoutCart"]>()])
  vi.mocked(market.useRemoveCartItemMutation).mockReturnValue([removeCartItem, mutationIdle<E["removeCartItem"]>()])
  vi.mocked(market.useUpdateCartItemMutation).mockReturnValue([updateCartItem, mutationIdle<E["updateCartItem"]>()])
  vi.mocked(market.useUpdateStockLotMutation).mockReturnValue([updateStockLot, mutationIdle<E["updateStockLot"]>()])
  vi.mocked(market.useDeleteStockLotMutation).mockReturnValue([deleteStockLot, mutationIdle<E["deleteStockLot"]>()])
})

describe("useCartActions", () => {
  it("checks out the chosen shop, confirming price changes, then opens the offer", async () => {
    const items = [{ price_changed: false }, { price_changed: true }] as CartItemDetail[]
    const { result } = renderHook(() => useCartActions())
    await result.current.checkout({ items, shopId: "shop-2", note: "" })
    expect(checkoutCart).toHaveBeenCalledWith({
      checkoutCartRequest: { confirm_price_changes: true, note: undefined, shop_id: "shop-2" },
    })
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining("S1"))
  })

  it("removes an item", async () => {
    const { result } = renderHook(() => useCartActions())
    await result.current.removeItem("ci-1")
    expect(removeCartItem).toHaveBeenCalledWith({ id: "ci-1" })
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
  })
})

describe("useCartItemActions", () => {
  it("ignores a quantity below 1", async () => {
    const { result } = renderHook(() => useCartItemActions("ci-1"))
    await result.current.changeQuantity(0)
    expect(updateCartItem).not.toHaveBeenCalled()
    await result.current.changeQuantity(3)
    expect(updateCartItem).toHaveBeenCalledWith({ id: "ci-1", updateCartItemRequest: { quantity: 3 } })
  })
})

describe("useStockLotActions", () => {
  it("returns the saved lot, or null when the update fails", async () => {
    const lot = { lot_id: "lot-1" }
    updateStockLot.mockReturnValueOnce({ unwrap: () => Promise.resolve({ lot }) })
    const { result } = renderHook(() => useStockLotActions())
    await expect(result.current.updateLot("lot-1", { quantity_total: 3 })).resolves.toBe(lot)
    updateStockLot.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error("nope")) })
    await expect(result.current.updateLot("lot-1", { quantity_total: 3 })).resolves.toBeNull()
    expect(alert).toHaveBeenLastCalledWith({ message: "nope", severity: "error" })
  })

  it("deletes a lot", async () => {
    const { result } = renderHook(() => useStockLotActions())
    await result.current.deleteLot("lot-9")
    expect(deleteStockLot).toHaveBeenCalledWith({ id: "lot-9" })
  })
})

describe("useAddToCart", () => {
  it("adds, and alerts success only when given a message", async () => {
    const addToCart = mockMutationTrigger<E["addToCart"]>()
    vi.mocked(market.useAddToCartMutation).mockReturnValue([addToCart, mutationIdle<E["addToCart"]>()])
    const { result } = renderHook(() => useAddToCart())
    const request = { listing_id: "L1", variant_id: "V1", quantity: 1 }
    await expect(result.current.add(request)).resolves.toBe(true)
    expect(addToCart).toHaveBeenCalledWith({ addToCartRequest: request })
    expect(alert).not.toHaveBeenCalled()
    await result.current.add(request, "Added")
    expect(alert).toHaveBeenCalledWith({ message: "Added", severity: "success" })
  })

  it("alerts the error", async () => {
    const addToCart = mockMutationTrigger<E["addToCart"]>()
    addToCart.mockReturnValueOnce({ unwrap: () => Promise.reject({ message: "Out of stock" }) })
    vi.mocked(market.useAddToCartMutation).mockReturnValue([addToCart, mutationIdle<E["addToCart"]>()])
    const { result } = renderHook(() => useAddToCart())
    await expect(result.current.add({ listing_id: "L1", variant_id: "V1", quantity: 1 })).resolves.toBe(false)
    expect(alert).toHaveBeenCalledWith({ message: "Out of stock" })
  })
})
