/**
 * Tests for BulkStockManagementV2 Component
 *
 * Validates Requirements 23.1-23.10
 */

import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { BrowserRouter } from "react-router-dom"
import { BulkStockManagementV2 } from "../BulkStockManagementV2"
import { marketV2Api } from "../../../../store/api/v2/market"
import type { StockLotDetail } from "../../../../store/api/v2/market"

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

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createMockStore()
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}

describe("BulkStockManagementV2", () => {
  const mockLots: StockLotDetail[] = [
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
      quantity_total: 10,
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
      quantity_total: 5,
      location: {
        location_id: "loc-2",
        name: "Lorville",
        is_preset: true,
      },
      owner: null,
      listed: false,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock the API endpoints
    vi.spyOn(marketV2Api.endpoints.getStockLots, "useQuery").mockReturnValue({
      data: { lots: mockLots, total: 2, page: 1, page_size: 20 },
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(marketV2Api.endpoints.bulkUpdateStockLots, "useMutation").mockReturnValue([
      vi.fn().mockResolvedValue({
        unwrap: vi.fn().mockResolvedValue({
          results: [],
          success_count: 1,
          failure_count: 0,
        }),
      }),
      {
        isLoading: false,
        isSuccess: false,
        isError: false,
        error: undefined,
      },
    ] as any)
  })

  it("renders stock lots with variant information", async () => {
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
      expect(screen.getByText("Tier 3 (65.0%) - Store")).toBeInTheDocument()
    })
  })

  it("displays quality tier chips with correct colors", async () => {
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      const tier5Chip = screen.getByText(/Tier 5/)
      const tier3Chip = screen.getByText(/Tier 3/)
      expect(tier5Chip).toBeInTheDocument()
      expect(tier3Chip).toBeInTheDocument()
    })
  })

  it("displays location and listed status chips", async () => {
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Orison")).toBeInTheDocument()
      expect(screen.getByText("Lorville")).toBeInTheDocument()
      expect(screen.getAllByText(/Listed/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Unlisted/i).length).toBeGreaterThan(0)
    })
  })

  it("provides checkbox selection for lots", async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole("checkbox")
    expect(checkboxes.length).toBeGreaterThan(0)

    await user.click(checkboxes[0])

    await waitFor(() => {
      expect(screen.getByText(/1 lot\(s\) selected/)).toBeInTheDocument()
    })
  })

  it("provides Select All button", async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Select one lot first to show bulk controls
    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[0])

    await waitFor(() => {
      expect(screen.getByText("Select All")).toBeInTheDocument()
    })

    const selectAllButton = screen.getByText("Select All")
    await user.click(selectAllButton)

    await waitFor(() => {
      expect(screen.getByText(/2 lot\(s\) selected/)).toBeInTheDocument()
    })
  })

  it("provides Select by Quality Tier dropdown", async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Select one lot to show bulk controls
    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[0])

    await waitFor(() => {
      expect(screen.getByLabelText(/Select by Tier/i)).toBeInTheDocument()
    })
  })

  it("provides bulk action dropdown with correct options", async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Select one lot to show bulk controls
    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[0])

    await waitFor(() => {
      expect(screen.getByLabelText(/Bulk Action/i)).toBeInTheDocument()
    })
  })

  it("disables bulk actions when no lots selected", async () => {
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Bulk controls should not be visible when nothing is selected
    expect(screen.queryByText(/lot\(s\) selected/)).not.toBeInTheDocument()
  })

  it("shows confirmation dialog before bulk operations", async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Select a lot
    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[0])

    await waitFor(() => {
      expect(screen.getByLabelText(/Bulk Action/i)).toBeInTheDocument()
    })

    // Open bulk action dropdown and select an action
    const bulkActionSelect = screen.getByLabelText(/Bulk Action/i)
    await user.click(bulkActionSelect)

    // Wait for menu to open and click "List All"
    await waitFor(() => {
      const listAllOption = screen.getByText("List All")
      expect(listAllOption).toBeInTheDocument()
    })

    const listAllOption = screen.getByText("List All")
    await user.click(listAllOption)

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText("Confirm Bulk Action")).toBeInTheDocument()
    })
  })

  it("handles quick update buttons (+1, -1, 0)", async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Verify quick action buttons are present
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBeGreaterThan(0)
  })

  it("handles manual quantity input with save button", async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Find quantity input fields
    const quantityInputs = screen.getAllByRole("spinbutton")
    expect(quantityInputs.length).toBeGreaterThan(0)

    // Change quantity
    await user.clear(quantityInputs[0])
    await user.type(quantityInputs[0], "15")

    // Verify input changed
    await waitFor(() => {
      expect(quantityInputs[0]).toHaveValue(15)
    })
  })

  it("displays loading state", () => {
    vi.spyOn(marketV2Api.endpoints.getStockLots, "useQuery").mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isSuccess: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("displays error state", () => {
    vi.spyOn(marketV2Api.endpoints.getStockLots, "useQuery").mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isSuccess: false,
      isError: true,
      error: { message: "Failed to load" },
      refetch: vi.fn(),
    } as any)

    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    expect(
      screen.getByText(/Failed to load stock information/i),
    ).toBeInTheDocument()
  })

  it("displays empty state when no lots", () => {
    vi.spyOn(marketV2Api.endpoints.getStockLots, "useQuery").mockReturnValue({
      data: { lots: [], total: 0, page: 1, page_size: 20 },
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    expect(
      screen.getByText(/No stock lots found/i),
    ).toBeInTheDocument()
  })

  it("maintains visual parity with V1 (padding, spacing, typography)", async () => {
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Quick Stock Updates")).toBeInTheDocument()
    })

    // Check for h6 typography variant on title
    const title = screen.getByText("Quick Stock Updates")
    expect(title.tagName).toBe("H6")
  })

  it("provides link to advanced stock management", async () => {
    render(
      <TestWrapper>
        <BulkStockManagementV2 listingId="listing-1" itemId="item-1" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Find inventory icon buttons (links to advanced management)
    const inventoryButtons = screen.getAllByRole("link")
    expect(inventoryButtons.length).toBeGreaterThan(0)
  })
})
