import "../../../v2/components/__tests__/setup"
/**
 * The order page's Stock Allocation tab reads a listing's lots from V2
 * GET /stock-lots (scoped to the selling org), not the removed V1
 * /api/market/listings/:id/lots, and keeps reading/changing allocations
 * through the seller-only /api/orders/:id/allocations routes.
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as marketV2 from "../../../../../store/api/v2/market"
import * as stockLotsApi from "../../../../../store/api/stockLotsApi"
import { SplitAllocationView } from "../SplitAllocationView"

vi.mock("../../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

vi.mock("../../../../../store/api/v2/market", () => ({
  useGetStockLotsQuery: vi.fn(),
}))

vi.mock("../../../../../store/api/stockLotsApi", () => ({
  useGetOrderAllocationsQuery: vi.fn(),
  useManualAllocateOrderMutation: vi.fn(),
}))

const stockLotsQuery = vi.mocked(marketV2.useGetStockLotsQuery)
const allocationsQuery = vi.mocked(stockLotsApi.useGetOrderAllocationsQuery)
const manualAllocate = vi.mocked(stockLotsApi.useManualAllocateOrderMutation)

type Lot = marketV2.StockLotDetail

function lot(overrides: Partial<Lot>): Lot {
  return {
    lot_id: "lot-1",
    item_id: "item-1",
    listing_id: "listing-1",
    listing_title: "Arclight Pistol",
    game_item_name: "Arclight",
    listing_photo: "https://cdn.example/arclight.png",
    variant: { variant_id: "v-1", attributes: {}, display_name: "Standard" },
    quantity_total: 10,
    quantity_allocated: 0,
    location: { location_id: "loc-1", name: "Area18", is_preset: true },
    owner: { user_id: "u-1", username: "owner", display_name: "Owner" },
    listed: true,
    notes: null,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    ...overrides,
  } as Lot
}

describe("SplitAllocationView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    allocationsQuery.mockReturnValue({
      data: { grouped_allocations: [], total_allocated: 0 },
    } as unknown as ReturnType<typeof stockLotsApi.useGetOrderAllocationsQuery>)
    manualAllocate.mockReturnValue([
      vi.fn(),
    ] as unknown as ReturnType<typeof stockLotsApi.useManualAllocateOrderMutation>)
    stockLotsQuery.mockReturnValue({
      data: {
        lots: [
          lot({ lot_id: "lot-1", quantity_total: 10, quantity_allocated: 4 }),
          // Fully allocated elsewhere: nothing left to allocate
          lot({ lot_id: "lot-2", quantity_total: 3, quantity_allocated: 3 }),
        ],
        total: 2,
        page: 1,
        page_size: 100,
      },
    } as unknown as ReturnType<typeof marketV2.useGetStockLotsQuery>)
  })

  function renderView() {
    return render(
      <SplitAllocationView
        orderId="order-1"
        spectrumId="ACME"
        listings={[{ listing_id: "listing-1", quantity: 2 }]}
      />,
    )
  }

  it("reads the listing's lots from V2 stock-lots, scoped to the selling org", () => {
    renderView()

    expect(stockLotsQuery).toHaveBeenCalledWith({
      listingId: "listing-1",
      spectrumId: "ACME",
      listed: true,
      pageSize: 100,
    })
    expect(allocationsQuery).toHaveBeenCalledWith({ order_id: "order-1" })
  })

  it("shows each lot's remaining quantity and the V2 listing title", () => {
    renderView()

    // lot-1: 10 total - 4 allocated = 6 left; lot-2 has none left and is hidden
    expect(screen.getByText("/ 6")).toBeInTheDocument()
    expect(screen.queryByText("/ 0")).not.toBeInTheDocument()
    expect(screen.getByText("Area18")).toBeInTheDocument()
    expect(screen.getAllByText("Arclight Pistol").length).toBeGreaterThan(0)
  })
})
