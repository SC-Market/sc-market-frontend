import "./setup"
/**
 * Buy-order "Fulfill" used to send listing_id: "" and variant_id: "", so the
 * backend rejected every fulfillment. The dialog must send a listing and
 * variant the seller actually picked from GET /buy-orders/{id}/fulfillment-options,
 * and never one the backend said it would reject.
 */
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Mock } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { mockMutationHook, querySuccess } from "../../../../../__tests__/rtkQueryMocks"
import type { BuyOrderFulfillmentOption } from "../../../../../store/api/v2/market"

type MarketV2Module = typeof import("../../../../../store/api/v2/market")
type MarketV2Endpoints = MarketV2Module["marketV2Api"]["endpoints"]

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string, opts?: Record<string, unknown>) =>
      (fallback ?? key).replace(/\{\{(\w+)\}\}/g, (_m, k) => String(opts?.[k] ?? "")),
    i18n: { language: "en" },
  }),
}))

const issueAlert = vi.fn()
vi.mock("../../../../../hooks/alert/AlertHook", () => ({ useAlertHook: () => issueAlert }))

const navigate = vi.fn()
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual<object>("react-router-dom")),
  useNavigate: () => navigate,
}))

const h = vi.hoisted(() => ({
  options: [] as BuyOrderFulfillmentOption[],
  trigger: null as unknown as Mock,
}))

vi.mock("../../../../../store/api/v2/market", () => ({
  useGetFulfillmentOptionsQuery: () =>
    querySuccess<MarketV2Endpoints["getFulfillmentOptions"]>({ options: h.options }),
  useFulfillBuyOrderMutation: () => {
    const hook = mockMutationHook<MarketV2Endpoints["fulfillBuyOrder"]>()
    return [h.trigger, hook[1]]
  },
}))

import { FulfillBuyOrderDialog } from "../FulfillBuyOrderDialog"

function option(over: Partial<BuyOrderFulfillmentOption>): BuyOrderFulfillmentOption {
  return {
    shop_id: "shop-1",
    shop_name: "Henry's Shop",
    listing_id: "listing-1",
    listing_title: "Quantanium",
    variant_id: "variant-1",
    variant_display_name: "Tier 4",
    variant_attributes: { quality_tier: 4 },
    available: 3,
    price_per_unit: 100,
    problem: null,
    ...over,
  }
}

const onClose = vi.fn()

function renderDialog() {
  render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <FulfillBuyOrderDialog
          buyOrder={{ buy_order_id: "bo-1", game_item_name: "Quantanium", quantity: 10, quantity_fulfilled: 2 }}
          open
          onClose={onClose}
        />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe("FulfillBuyOrderDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.trigger = vi.fn(() => ({ unwrap: () => Promise.resolve({ order_id: "order-9" }) }))
  })

  it("fulfills from the picked listing variant, capped at its stock, and opens the order", async () => {
    h.options = [option({})]
    renderDialog()

    expect(screen.getByText("Order total: 300 aUEC")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Fulfill" }))

    await waitFor(() => expect(h.trigger).toHaveBeenCalledTimes(1))
    expect(h.trigger).toHaveBeenCalledWith({
      id: "bo-1",
      fulfillBuyOrderRequest: { listing_id: "listing-1", variant_id: "variant-1", quantity: 3 },
    })
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/order/order-9"))
  })

  it("can't pick an option the backend would reject, and shows why", () => {
    h.options = [
      option({
        listing_id: "listing-2",
        variant_id: "variant-2",
        price_per_unit: 500,
        problem: "Listing price 500 is above the buyer's maximum of 400",
      }),
    ]
    renderDialog()

    expect(screen.getByText("Listing price 500 is above the buyer's maximum of 400")).toBeInTheDocument()
    expect(screen.getByRole("radio")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Fulfill" })).toBeDisabled()
  })

  it("offers to create a listing when the seller has none of the item", () => {
    h.options = []
    renderDialog()
    expect(screen.getByRole("link", { name: "Create a listing" })).toHaveAttribute("href", "/market/create")
    expect(screen.getByRole("button", { name: "Fulfill" })).toBeDisabled()
  })

  it("shows the server's reason when fulfilling fails", async () => {
    h.options = [option({})]
    h.trigger = vi.fn(() => ({
      unwrap: () =>
        Promise.reject({ status: 400, data: { error: { code: "VALIDATION_ERROR", message: "Insufficient stock" } } }),
    }))
    renderDialog()
    fireEvent.click(screen.getByRole("button", { name: "Fulfill" }))
    await waitFor(() =>
      expect(issueAlert).toHaveBeenCalledWith({
        message: "Could not fulfill the buy order: Insufficient stock",
        severity: "error",
      }),
    )
    expect(navigate).not.toHaveBeenCalled()
  })
})
