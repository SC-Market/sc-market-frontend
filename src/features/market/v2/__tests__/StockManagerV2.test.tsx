/**
 * StockManagerV2 Component Tests
 *
 * **Validates: Requirements 21.1-21.12**
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { StockManagerV2 } from "../StockManagerV2"
import { marketV2Api } from "../../../../store/api/v2/market"

// Mock the alert hook
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

// Mock translation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}))

// Create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
    preloadedState: initialState,
  })
}

// Mock data
const mockStockLots = {
  lots: [
    {
      lot_id: "lot-1",
      item_id: "item-1",
      variant: {
        variant_id: "variant-1",
        attributes: {
          quality_tier: 5,
          quality_value: 95.5,
          crafted_source: "crafted",
        },
        display_name: "Tier 5 (95.5%) - Crafted",
        short_name: "T5 Crafted",
      },
      quantity_total: 100,
      location: {
        location_id: "loc-1",
        name: "Orison",
        is_preset: true,
      },
      owner: null,
      listed: true,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      lot_id: "lot-2",
      item_id: "item-1",
      variant: {
        variant_id: "variant-2",
        attributes: {
          quality_tier: 3,
          quality_value: 65.0,
          crafted_source: "store",
        },
        display_name: "Tier 3 (65.0%) - Store",
        short_name: "T3 Store",
      },
      quantity_total: 50,
      location: {
        location_id: "loc-1",
        name: "Orison",
        is_preset: true,
      },
      owner: null,
      listed: true,
      notes: "Test notes",
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    },
  ],
  total: 2,
  page: 1,
  page_size: 20,
}

describe("StockManagerV2", () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
  })

  it("renders loading state initially", () => {
    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("renders stock manager with title and create button", async () => {
    // Mock the API response
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        mockStockLots,
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Stock Management")).toBeInTheDocument()
    })

    expect(screen.getByText("Create Lot")).toBeInTheDocument()
  })

  it("displays stock breakdown with aggregates", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        mockStockLots,
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Total Stock")).toBeInTheDocument()
    })

    expect(screen.getByText("Available")).toBeInTheDocument()
    expect(screen.getByText("150")).toBeInTheDocument() // Total quantity
  })

  it("groups lots by location", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        mockStockLots,
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Orison")).toBeInTheDocument()
    })

    expect(screen.getByText("(2 lots)")).toBeInTheDocument()
  })

  it("displays variant information for each lot", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        mockStockLots,
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    expect(screen.getByText("Tier 3 (65.0%) - Store")).toBeInTheDocument()
  })

  it("displays quality tier filters", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        mockStockLots,
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText("Min Quality")).toBeInTheDocument()
    })

    expect(screen.getByLabelText("Max Quality")).toBeInTheDocument()
  })

  it("displays sort options", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        mockStockLots,
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText("Sort By")).toBeInTheDocument()
    })
  })

  it("displays empty state when no lots exist", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        { lots: [], total: 0, page: 1, page_size: 20 },
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          "No stock lots found. Create your first lot to get started.",
        ),
      ).toBeInTheDocument()
    })

    expect(screen.getByText("Create First Lot")).toBeInTheDocument()
  })

  it("displays preset badge for preset locations", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        mockStockLots,
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Preset")).toBeInTheDocument()
    })
  })

  it("displays quality tier chips with appropriate colors", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        mockStockLots,
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5")).toBeInTheDocument()
    })

    expect(screen.getByText("Tier 3")).toBeInTheDocument()
  })

  it("displays crafted source chips", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { listingId: "listing-1" },
        mockStockLots,
      ),
    )

    render(
      <Provider store={store}>
        <StockManagerV2 listingId="listing-1" itemId="item-1" />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText("crafted")).toBeInTheDocument()
    })

    expect(screen.getByText("store")).toBeInTheDocument()
  })
})
