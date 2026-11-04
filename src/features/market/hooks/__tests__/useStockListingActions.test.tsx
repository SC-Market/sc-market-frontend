import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../../../store/api/v2/market", () => ({
  marketV2Api: { endpoints: { getStockLots: { useLazyQuery: vi.fn() } } },
  useCreateListingMutation: vi.fn(),
  useRefreshListingMutation: vi.fn(),
  useUpdateListingMutation: vi.fn(),
  useUpdateStockLotMutation: vi.fn(),
}))

import * as market from "../../../../store/api/v2/market"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import {
  useBulkListingStatus,
  useRenewListings,
  useSaveStockRow,
} from "../useStockListingActions"

type Endpoints = typeof market.marketV2Api.endpoints
type LazyLots = ReturnType<Endpoints["getStockLots"]["useLazyQuery"]>

const createListing = mockMutationTrigger<Endpoints["createListing"]>()
const updateListing = mockMutationTrigger<Endpoints["updateListing"]>()
const updateStockLot = mockMutationTrigger<Endpoints["updateStockLot"]>()
const refreshListing = mockMutationTrigger<Endpoints["refreshListing"]>()
const fetchLots = vi.fn()

function lotsResult(lots: { lot_id: string; quantity_total: number }[]) {
  return { unwrap: () => Promise.resolve({ lots }) }
}

const existing = {
  listing_id: "L1",
  title: "Laser",
  status: "active",
  created_at: "",
  updated_at: "",
  variant_count: 1,
  quantity_available: 10,
  price_min: 100,
  price_max: 100,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(market.useCreateListingMutation).mockReturnValue([
    createListing,
    mutationIdle<Endpoints["createListing"]>(),
  ])
  vi.mocked(market.useUpdateListingMutation).mockReturnValue([
    updateListing,
    mutationIdle<Endpoints["updateListing"]>(),
  ])
  vi.mocked(market.useUpdateStockLotMutation).mockReturnValue([
    updateStockLot,
    mutationIdle<Endpoints["updateStockLot"]>(),
  ])
  vi.mocked(market.useRefreshListingMutation).mockReturnValue([
    refreshListing,
    mutationIdle<Endpoints["refreshListing"]>(),
  ])
  vi.mocked(
    market.marketV2Api.endpoints.getStockLots.useLazyQuery,
  ).mockReturnValue([fetchLots] as unknown as LazyLots)
})

describe("useSaveStockRow", () => {
  it("won't create a row without a game item", async () => {
    const { result } = renderHook(() => useSaveStockRow("shop-1"))
    await expect(result.current.createRow({ price: 5 })).resolves.toBe(false)
    expect(createListing).not.toHaveBeenCalled()
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error" }),
    )
  })

  it("creates a new row's listing in the shop", async () => {
    const { result } = renderHook(() => useSaveStockRow("shop-1"))
    await expect(
      result.current.createRow({
        game_item_id: "gi",
        price: 5,
        quantity_available: 2,
      }),
    ).resolves.toBe(true)
    expect(createListing).toHaveBeenCalledWith({
      createListingRequest: expect.objectContaining({
        game_item_id: "gi",
        shop_id: "shop-1",
        base_price: 5,
      }),
    })
  })

  it("patches only what changed and puts a quantity change on the shop's lot", async () => {
    fetchLots.mockReturnValue(
      lotsResult([{ lot_id: "lot-1", quantity_total: 4 }]),
    )
    const { result } = renderHook(() => useSaveStockRow("shop-1"))
    await expect(
      result.current.saveRow(existing, { price: 120, quantity_available: 13 }),
    ).resolves.toBe(true)
    expect(updateListing).toHaveBeenCalledWith({
      id: "L1",
      updateListingRequest: { base_price: 120 },
    })
    expect(fetchLots).toHaveBeenCalledWith({
      listingId: "L1",
      listed: true,
      pageSize: 1,
      shopId: "shop-1",
    })
    expect(updateStockLot).toHaveBeenCalledWith({
      id: "lot-1",
      updateStockLotRequest: { quantity_total: 7 },
    })
  })

  it("refuses a quantity drop the lot can't take", async () => {
    fetchLots.mockReturnValue(
      lotsResult([{ lot_id: "lot-1", quantity_total: 2 }]),
    )
    const { result } = renderHook(() => useSaveStockRow("shop-1"))
    await expect(
      result.current.saveRow(existing, { quantity_available: 5 }),
    ).resolves.toBe(false)
    expect(updateStockLot).not.toHaveBeenCalled()
  })

  it("sends nothing when nothing changed", async () => {
    const { result } = renderHook(() => useSaveStockRow("shop-1"))
    await expect(
      result.current.saveRow(existing, { status: "active", price: 100 }),
    ).resolves.toBe(true)
    expect(updateListing).not.toHaveBeenCalled()
    expect(fetchLots).not.toHaveBeenCalled()
  })
})

describe("useBulkListingStatus", () => {
  it("updates every selected listing", async () => {
    const { result } = renderHook(() => useBulkListingStatus())
    await act(async () => {
      await expect(result.current.archive(["a", "b"])).resolves.toBe(true)
    })
    expect(updateListing).toHaveBeenCalledWith({
      id: "a",
      updateListingRequest: { status: "cancelled" },
    })
    expect(updateListing).toHaveBeenCalledWith({
      id: "b",
      updateListingRequest: { status: "cancelled" },
    })
  })

  it("does nothing with no selection", async () => {
    const { result } = renderHook(() => useBulkListingStatus())
    await expect(result.current.setStatus([], "active")).resolves.toBe(false)
    expect(updateListing).not.toHaveBeenCalled()
  })
})

describe("useRenewListings", () => {
  it("reports a partial renewal", async () => {
    refreshListing
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({}) })
      .mockReturnValueOnce({ unwrap: () => Promise.reject(new Error("x")) })
    const { result } = renderHook(() => useRenewListings())
    await result.current(["a", "b"])
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warning" }),
    )
  })
})
