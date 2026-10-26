import "../../../v2/components/__tests__/setup"
/**
 * The order page's Stock Allocation tab reads and changes allocations only
 * through the generated V2 client (/api/v2/orders/{orderId}/allocations):
 * lots per order line, auto-allocate, set a lot's allocation (absolute), and
 * release. No V1 /api/orders/:id/allocations call is left.
 */
import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as marketV2 from "../../../../../store/api/v2/market"
import { SplitAllocationView } from "../SplitAllocationView"

const alert = vi.fn()
vi.mock("../../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))

vi.mock("../../../../../store/api/v2/market", () => ({
  useGetOrderAllocationsQuery: vi.fn(),
  useAutoAllocateOrderStockMutation: vi.fn(),
  useManualAllocateOrderStockMutation: vi.fn(),
  useReleaseOrderStockMutation: vi.fn(),
}))

type Response = marketV2.OrderAllocationsResponse
type Lot = marketV2.OrderAllocationLot

const allocationsQuery = vi.mocked(marketV2.useGetOrderAllocationsQuery)
const autoHook = vi.mocked(marketV2.useAutoAllocateOrderStockMutation)
const manualHook = vi.mocked(marketV2.useManualAllocateOrderStockMutation)
const releaseHook = vi.mocked(marketV2.useReleaseOrderStockMutation)

function lot(overrides: Partial<Lot>): Lot {
  return {
    lot_id: "lot-1",
    quantity_available: 6,
    listed: true,
    location: { location_id: "loc-1", name: "Area18", is_preset: true },
    owner: { user_id: "u-1", username: "owner", display_name: "Owner" },
    ...overrides,
  }
}

function response(overrides: Partial<Response> = {}): Response {
  return {
    order_id: "order-1",
    order_status: "not-started",
    allocation_mode: "manual",
    editable: true,
    total_requested: 5,
    total_allocated: 2,
    lines: [
      {
        order_item_id: "line-1",
        listing_id: "listing-1",
        listing_title: "Arclight Pistol",
        listing_photo: null,
        variant: {
          variant_id: "v-1",
          attributes: {},
          display_name: "Tier 3",
          short_name: "T3",
        },
        quantity: 5,
        quantity_allocated: 2,
        allocations: [
          {
            allocation_id: "alloc-1",
            order_item_id: "line-1",
            lot_id: "lot-2",
            quantity: 2,
            allocated_by: null,
            created_at: "2026-10-01T00:00:00Z",
            updated_at: "2026-10-01T00:00:00Z",
            lot: lot({
              lot_id: "lot-2",
              quantity_available: 1,
              location: {
                location_id: "loc-2",
                name: "Lorville",
                is_preset: true,
              },
            }),
          },
        ],
        available_lots: [
          lot({ lot_id: "lot-1", quantity_available: 6 }),
          lot({
            lot_id: "lot-2",
            quantity_available: 1,
            listed: false,
            location: {
              location_id: "loc-2",
              name: "Lorville",
              is_preset: true,
            },
          }),
        ],
      },
    ],
    ...overrides,
  }
}

function mutation() {
  const unwrap = vi.fn(async () => response())
  const trigger = vi.fn(() => ({ unwrap }))
  return { trigger, unwrap }
}

let manual: ReturnType<typeof mutation>
let auto: ReturnType<typeof mutation>
let release: ReturnType<typeof mutation>

function setQuery(data: Response) {
  allocationsQuery.mockReturnValue({
    data,
    isLoading: false,
    error: undefined,
  } as unknown as ReturnType<typeof marketV2.useGetOrderAllocationsQuery>)
}

describe("SplitAllocationView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    manual = mutation()
    auto = mutation()
    release = mutation()
    manualHook.mockReturnValue([
      manual.trigger,
      { isLoading: false },
    ] as unknown as ReturnType<
      typeof marketV2.useManualAllocateOrderStockMutation
    >)
    autoHook.mockReturnValue([
      auto.trigger,
      { isLoading: false },
    ] as unknown as ReturnType<
      typeof marketV2.useAutoAllocateOrderStockMutation
    >)
    releaseHook.mockReturnValue([
      release.trigger,
      { isLoading: false },
    ] as unknown as ReturnType<typeof marketV2.useReleaseOrderStockMutation>)
    setQuery(response())
  })

  it("reads the order's allocations from V2", () => {
    render(<SplitAllocationView orderId="order-1" />)
    expect(allocationsQuery).toHaveBeenCalledWith({ orderId: "order-1" })
    expect(screen.getByText("Arclight Pistol")).toBeInTheDocument()
    expect(screen.getByText("Tier 3")).toBeInTheDocument()
    expect(screen.getAllByText("2 / 5").length).toBeGreaterThan(0)
    expect(screen.getByText("Mode: manual")).toBeInTheDocument()
  })

  it("shows each candidate lot's free units and marks unlisted lots", () => {
    render(<SplitAllocationView orderId="order-1" />)
    expect(screen.getByText("/ 6")).toBeInTheDocument()
    expect(screen.getByText("Unlisted")).toBeInTheDocument()
  })

  it("allocating from a lot sends the lot's new total for the line", async () => {
    render(<SplitAllocationView orderId="order-1" />)
    // lot-2 already holds 2 for the line; add 1 more → 3
    const input = screen.getByLabelText("Quantity to allocate from Lorville")
    fireEvent.change(input, { target: { value: "1" } })
    fireEvent.click(screen.getByLabelText("Allocate from Lorville"))
    await waitFor(() =>
      expect(manual.trigger).toHaveBeenCalledWith({
        orderId: "order-1",
        manualOrderAllocationRequest: {
          allocations: [
            { lot_id: "lot-2", quantity: 3, order_item_id: "line-1" },
          ],
        },
      }),
    )
    expect(alert).toHaveBeenCalledWith({
      severity: "success",
      message: "Stock allocated",
    })
  })

  it("returning units lowers the lot's allocation", async () => {
    render(<SplitAllocationView orderId="order-1" />)
    fireEvent.change(screen.getByLabelText("Quantity to return to Lorville"), {
      target: { value: "2" },
    })
    fireEvent.click(screen.getByLabelText("Return units to Lorville"))
    await waitFor(() =>
      expect(manual.trigger).toHaveBeenCalledWith({
        orderId: "order-1",
        manualOrderAllocationRequest: {
          allocations: [
            { lot_id: "lot-2", quantity: 0, order_item_id: "line-1" },
          ],
        },
      }),
    )
  })

  it("won't allocate more than the line still needs", () => {
    render(<SplitAllocationView orderId="order-1" />)
    fireEvent.change(
      screen.getByLabelText("Quantity to allocate from Area18"),
      { target: { value: "4" } },
    )
    expect(screen.getByText("Line needs 3 more")).toBeInTheDocument()
    expect(screen.getByLabelText("Allocate from Area18")).toBeDisabled()
  })

  it("auto-allocates and releases all through V2", async () => {
    render(<SplitAllocationView orderId="order-1" />)
    fireEvent.click(screen.getByRole("button", { name: "Auto-allocate" }))
    await waitFor(() =>
      expect(auto.trigger).toHaveBeenCalledWith({ orderId: "order-1" }),
    )
    fireEvent.click(screen.getByRole("button", { name: "Release all" }))
    await waitFor(() =>
      expect(release.trigger).toHaveBeenCalledWith({
        orderId: "order-1",
        releaseOrderAllocationsRequest: {},
      }),
    )
  })

  it("shows the server's message when an allocation is refused", async () => {
    manual.unwrap.mockRejectedValueOnce({
      status: 400,
      data: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Cannot allocate 5 more from lot lot-1. Only 1 available.",
        },
      },
    })
    render(<SplitAllocationView orderId="order-1" />)
    fireEvent.change(
      screen.getByLabelText("Quantity to allocate from Area18"),
      { target: { value: "1" } },
    )
    fireEvent.click(screen.getByLabelText("Allocate from Area18"))
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith({
        severity: "error",
        message: "Cannot allocate 5 more from lot lot-1. Only 1 available.",
      }),
    )
  })

  it("a closed order is read-only", () => {
    setQuery(response({ editable: false, order_status: "fulfilled" }))
    render(<SplitAllocationView orderId="order-1" />)
    expect(
      screen.getByText(
        "This order is fulfilled; its allocations can no longer change.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Auto-allocate" }),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText("Allocate from Area18")).toBeDisabled()
    expect(screen.getByLabelText("Return units to Lorville")).toBeDisabled()
  })
})
