import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({ useAlertHook: () => alert }))
vi.mock("../../../../store/api/v2/market", () => ({
  useCancelBuyOrderMutation: vi.fn(),
  useCreateStandingBuyOrderMutation: vi.fn(),
  useFulfillBuyOrderMutation: vi.fn(),
  usePlaceBidMutation: vi.fn(),
  useImportFromUexMutation: vi.fn(),
}))

import * as market from "../../../../store/api/v2/market"
import type { marketV2Api } from "../../../../store/api/v2/market"
import { mockMutationTrigger, mutationIdle } from "../../../../__tests__/rtkQueryMocks"
import { useCancelBuyOrder, useCreateBuyOrder, useFulfillBuyOrder } from "../useBuyOrderActions"
import { usePlaceBid } from "../usePlaceBid"
import { useImportFromUex } from "../useImportFromUex"

type E = typeof marketV2Api.endpoints
const reject = (data: unknown) => ({ unwrap: () => Promise.reject({ data }) })

const create = mockMutationTrigger<E["createStandingBuyOrder"]>()
const cancel = mockMutationTrigger<E["cancelBuyOrder"]>()
const fulfill = mockMutationTrigger<E["fulfillBuyOrder"]>()
const placeBid = mockMutationTrigger<E["placeBid"]>()
const importUex = mockMutationTrigger<E["importFromUex"]>()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(market.useCreateStandingBuyOrderMutation).mockReturnValue([create, mutationIdle<E["createStandingBuyOrder"]>()])
  vi.mocked(market.useCancelBuyOrderMutation).mockReturnValue([cancel, mutationIdle<E["cancelBuyOrder"]>()])
  vi.mocked(market.useFulfillBuyOrderMutation).mockReturnValue([fulfill, mutationIdle<E["fulfillBuyOrder"]>()])
  vi.mocked(market.usePlaceBidMutation).mockReturnValue([placeBid, mutationIdle<E["placeBid"]>()])
  vi.mocked(market.useImportFromUexMutation).mockReturnValue([importUex, mutationIdle<E["importFromUex"]>()])
})

const order = { game_item_id: "gi", quantity: 2, price_per_unit: 10 }

describe("useCreateBuyOrder", () => {
  it("posts and alerts the success message", async () => {
    const { result } = renderHook(() => useCreateBuyOrder("Posted", "Failed"))
    await expect(result.current.create(order)).resolves.toBe(true)
    expect(create).toHaveBeenCalledWith({ createTargetedBuyOrderRequest: order })
    expect(alert).toHaveBeenCalledWith({ message: "Posted", severity: "success" })
  })

  it("with a fallback, alerts the API's message or the fallback", async () => {
    create.mockReturnValueOnce(reject({ message: "Price too low" })).mockReturnValueOnce(reject({}))
    const { result } = renderHook(() => useCreateBuyOrder("Posted", "Failed"))
    await result.current.create(order)
    expect(alert).toHaveBeenLastCalledWith({ message: "Price too low", severity: "error" })
    await result.current.create(order)
    expect(alert).toHaveBeenLastCalledWith({ message: "Failed", severity: "error" })
  })
})

describe("useCancelBuyOrder", () => {
  it("cancels, falling back to the given message on an unexplained failure", async () => {
    const { result } = renderHook(() => useCancelBuyOrder("Cancel failed"))
    await result.current.cancel("bo-1")
    expect(cancel).toHaveBeenCalledWith({ id: "bo-1" })
    cancel.mockReturnValueOnce(reject({}))
    await result.current.cancel("bo-1")
    expect(alert).toHaveBeenLastCalledWith({ message: "Cancel failed", severity: "error" })
  })
})

describe("useFulfillBuyOrder", () => {
  it("returns the new order's id, or null", async () => {
    fulfill.mockReturnValueOnce({ unwrap: () => Promise.resolve({ order_id: "O1" }) })
    const { result } = renderHook(() => useFulfillBuyOrder())
    const request = { listing_id: "L1", variant_id: "V1", quantity: 1 }
    await expect(result.current.fulfill("bo-1", request)).resolves.toBe("O1")
    expect(fulfill).toHaveBeenCalledWith({ id: "bo-1", fulfillBuyOrderRequest: request })
    fulfill.mockReturnValueOnce(reject({}))
    await expect(result.current.fulfill("bo-1", request)).resolves.toBeNull()
  })
})

describe("usePlaceBid", () => {
  it("bids on that listing", async () => {
    const { result } = renderHook(() => usePlaceBid("L1"))
    await expect(result.current.bid(150)).resolves.toBe(true)
    expect(placeBid).toHaveBeenCalledWith({ listingId: "L1", placeBidRequest: { amount: 150 } })
    placeBid.mockReturnValueOnce(reject({ message: "Bid too low" }))
    await expect(result.current.bid(1)).resolves.toBe(false)
    expect(alert).toHaveBeenLastCalledWith({ message: "Bid too low", severity: "error" })
  })
})

describe("useImportFromUex", () => {
  it("previews, then imports the chosen listings into the shop", async () => {
    const { result } = renderHook(() => useImportFromUex("shop-1"))
    await result.current.preview("  trader ")
    expect(importUex).toHaveBeenCalledWith({ body: { uex_username: "trader", shop_id: "shop-1" } })
    const listings = [{ title: "Laser", description: "", price: 5, quantity: 1 }]
    await result.current.confirm("trader", listings)
    expect(importUex).toHaveBeenLastCalledWith({
      body: { uex_username: "trader", shop_id: "shop-1", listings, confirm: true },
    })
  })

  it("returns the error text", async () => {
    importUex.mockReturnValueOnce(reject({ error: { message: "No such user" } }))
    const { result } = renderHook(() => useImportFromUex("shop-1"))
    const outcome = await result.current.preview("nobody")
    expect(outcome.ok).toBe(false)
  })
})
