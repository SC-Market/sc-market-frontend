import "./setup";
/**
 * OrderDetailsAreaV2 Component Tests
 *
 * Tests for OrderDetailsAreaV2 component ensuring:
 * - Visual parity with V1 OrderDetailsArea
 * - Proper display of variant attributes
 * - Quality tier visual indicators
 * - Per-variant pricing display
 * - Preservation of variant information
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { OrderDetailsAreaV2 } from "../OrderDetailsAreaV2"
import { marketV2Api } from "../../../../store/api/v2/market"

// Mock OfferMarketListingsV2 to avoid complex nested component issues
vi.mock("../OfferMarketListingsV2", () => ({
  OfferMarketListingsV2: ({ items }: any) => (
    <div data-testid="offer-market-listings-v2">
      {items.map((item: any) => (
        <div key={item.order_item_id}>
          <span>{item.variant.display_name}</span>
          <span>{item.price_per_unit.toLocaleString()} aUEC</span>
          <span>{item.subtotal.toLocaleString()} aUEC</span>
        </div>
      ))}
    </div>
  ),
}))

// Mock the RTK Query hook
vi.mock("../../../../store/api/v2/market", async () => {
  const actual = await vi.importActual("../../../../store/api/v2/market")
  return {
    ...actual,
    useGetOrderDetailQuery: vi.fn(),
  }
})

const { useGetOrderDetailQuery } = await import("../../../../store/api/v2/market")

// Mock the time format utility
vi.mock("../../../../util/time", () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    return "January 1st 2024, 12:00:00 pm"
  }),
}))

// Mock translation hook
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}))

// Mock theme hook
vi.mock("@mui/material/styles", async () => {
  const actual = await vi.importActual("@mui/material/styles")
  return {
    ...actual,
    useTheme: () => ({
      layoutSpacing: {
        compact: 1,
      },
      breakpoints: {
        down: () => false,
      },
      borderRadius: {
        topLevel: 2,
      },
      spacing: (value: number) => value * 8,
      palette: {
        outline: {
          main: "#e0e0e0",
        },
      },
    }),
  }
})

/**
 * Create mock store with API slice
 */
function createMockStore() {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
  })
}

/**
 * Helper to render component with providers
 */
function renderWithProviders(ui: React.ReactElement) {
  const store = createMockStore()
  return render(<Provider store={store}>{ui}</Provider>)
}

/**
 * Mock order detail response with variant information
 */
const mockOrderDetail = {
  order_id: "test-order-id",
  buyer: {
    user_id: "buyer-123",
    username: "buyer_user",
    display_name: "Buyer User",
    avatar: null,
  },
  seller: {
    user_id: "seller-456",
    username: "seller_user",
    display_name: "Seller User",
    name: "Seller User",
    slug: "seller-user",
    avatar: null,
  },
  total_price: 150000,
  status: "completed",
  created_at: "2024-01-01T12:00:00Z",
  updated_at: "2024-01-01T12:00:00Z",
  items: [
    {
      order_item_id: "item-1",
      listing_id: "listing-1",
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
      quantity: 10,
      price_per_unit: 10000,
      subtotal: 100000,
    },
    {
      order_item_id: "item-2",
      listing_id: "listing-2",
      item_id: "item-2",
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
      quantity: 5,
      price_per_unit: 10000,
      subtotal: 50000,
    },
  ],
}

describe("OrderDetailsAreaV2", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test: Component renders with order details
   * Requirement 45.6: Provide OrderDetailsAreaV2 React component
   */
  it("renders order details successfully", async () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

    await waitFor(() => {
      expect(screen.getByText("Buyer User")).toBeInTheDocument()
      expect(screen.getByText("Seller User")).toBeInTheDocument()
      // Text is split across elements, so check for both parts
      expect(screen.getByText("150,000")).toBeInTheDocument()
      expect(screen.getByText("aUEC")).toBeInTheDocument()
    })
  })

  /**
   * Test: Visual parity with V1 OrderDetailsArea
   * Requirement 45.7: Maintain visual parity with V1 OrderDetailsArea
   */
  it("maintains visual parity with V1 component structure", async () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      error: undefined,
    } as any)

    const { container } = renderWithProviders(
      <OrderDetailsAreaV2 orderId="test-order-id" />,
    )

    await waitFor(() => {
      // Check Grid structure
      const gridItem = container.querySelector('[class*="MuiGrid-root"]')
      expect(gridItem).toBeInTheDocument()

      // Check TableContainer with Paper
      const tableContainer = container.querySelector('[class*="MuiTableContainer-root"]')
      expect(tableContainer).toBeInTheDocument()

      // Check Table with proper aria-label
      const table = screen.getByRole("table")
      expect(table).toBeInTheDocument()
    })
  })

  /**
   * Test: Display variant attributes for each item
   * Requirement 45.8: Display variant attributes for each item
   */
  it("displays variant attributes for order items", async () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

    await waitFor(() => {
      // Variant display names should be visible in OfferMarketListingsV2
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
      expect(screen.getByText("Tier 3 (65.0%) - Store")).toBeInTheDocument()
    })
  })

  /**
   * Test: Show quality tier with visual indicators
   * Requirement 45.9: Show quality tier with visual indicators
   */
  it("shows quality tier with visual indicators", async () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      error: undefined,
    } as any)

    const { container } = renderWithProviders(
      <OrderDetailsAreaV2 orderId="test-order-id" />,
    )

    await waitFor(() => {
      // Quality tier range should be displayed (3-5 in this case)
      expect(screen.getByText("Tier 3-5")).toBeInTheDocument()

      // QualityBadge chips should be present for individual items
      const chips = container.querySelectorAll('[class*="MuiChip-root"]')
      expect(chips.length).toBeGreaterThan(0)
    })
  })

  /**
   * Test: Display per-variant pricing
   * Requirement 45.10: Display per-variant pricing
   */
  it("displays per-variant pricing correctly", async () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

    await waitFor(() => {
      // Unit prices should be visible
      expect(screen.getAllByText("10,000 aUEC").length).toBeGreaterThan(0)

      // Subtotals should be visible
      expect(screen.getByText("100,000 aUEC")).toBeInTheDocument()
      expect(screen.getByText("50,000 aUEC")).toBeInTheDocument()
    })
  })

  /**
   * Test: Preserve variant information even if listing deleted
   * Requirement 45.12: Preserve variant information even if listing deleted
   */
  it("preserves variant information from order snapshot", async () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

    await waitFor(() => {
      // Variant details are from order snapshot, not live listing data
      // This ensures information is preserved even if listing is deleted
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
      expect(screen.getByText("Tier 3 (65.0%) - Store")).toBeInTheDocument()

      // Price per unit is snapshot from purchase time
      expect(screen.getAllByText("10,000 aUEC").length).toBeGreaterThan(0)
    })
  })

  /**
   * Test: Display order status with correct color
   */
  it("displays order status with correct chip color", async () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      error: undefined,
    } as any)

    const { container } = renderWithProviders(
      <OrderDetailsAreaV2 orderId="test-order-id" />,
    )

    await waitFor(() => {
      const statusChip = screen.getByText("completed")
      expect(statusChip).toBeInTheDocument()

      // Check that chip has success color (completed status)
      const chip = statusChip.closest('[class*="MuiChip-root"]')
      expect(chip).toHaveClass("MuiChip-colorSuccess")
    })
  })

  /**
   * Test: Display formatted date
   */
  it("displays formatted order date", async () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

    await waitFor(() => {
      expect(screen.getByText("January 1st 2024, 12:00:00 pm")).toBeInTheDocument()
    })
  })

  /**
   * Test: Loading state
   */
  it("shows loading state while fetching order details", () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any)

    renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  /**
   * Test: Error state
   */
  it("shows error message when order fetch fails", async () => {
    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: { message: "Failed to fetch" } },
    } as any)

    renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load order details. Please try again."),
      ).toBeInTheDocument()
    })
  })

  /**
   * Test: Single quality tier display
   */
  it("displays single quality tier badge when all items have same tier", async () => {
    const singleTierOrder = {
      ...mockOrderDetail,
      items: [
        {
          ...mockOrderDetail.items[0],
          variant: {
            ...mockOrderDetail.items[0].variant,
            attributes: {
              quality_tier: 5,
              quality_value: 95.5,
              crafted_source: "crafted",
            },
          },
        },
      ],
    }

    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: singleTierOrder,
      isLoading: false,
      error: undefined,
    } as any)

    const { container } = renderWithProviders(
      <OrderDetailsAreaV2 orderId="test-order-id" />,
    )

    await waitFor(() => {
      // Should show QualityBadge for single tier
      const qualityBadges = container.querySelectorAll('[class*="MuiChip-root"]')
      expect(qualityBadges.length).toBeGreaterThan(0)
    })
  })

  /**
   * Test: No quality tier display when items have no quality
   */
  it("does not display quality tier row when items have no quality tier", async () => {
    const noQualityOrder = {
      ...mockOrderDetail,
      items: [
        {
          ...mockOrderDetail.items[0],
          variant: {
            ...mockOrderDetail.items[0].variant,
            attributes: {
              crafted_source: "store",
            },
          },
        },
      ],
    }

    vi.mocked(useGetOrderDetailQuery).mockReturnValue({
      data: noQualityOrder,
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

    await waitFor(() => {
      expect(screen.queryByText("Quality Tier")).not.toBeInTheDocument()
    })
  })

  /**
   * Test: Display variant attributes (Requirement 59.6)
   */
  describe("Variant Attributes Display (Requirement 59.6)", () => {
    it("displays crafted source attribute", async () => {
      vi.mocked(useGetOrderDetailQuery).mockReturnValue({
        data: mockOrderDetail,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

      await waitFor(() => {
        // Crafted source should be visible in variant display names
        expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
        expect(screen.getByText("Tier 3 (65.0%) - Store")).toBeInTheDocument()
      })
    })

    it("displays quality value attribute", async () => {
      vi.mocked(useGetOrderDetailQuery).mockReturnValue({
        data: mockOrderDetail,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

      await waitFor(() => {
        // Quality values should be visible in display names
        expect(screen.getByText(/95\.5%/)).toBeInTheDocument()
        expect(screen.getByText(/65\.0%/)).toBeInTheDocument()
      })
    })

    it("displays multiple variant attributes together", async () => {
      const detailedOrder = {
        ...mockOrderDetail,
        items: [
          {
            ...mockOrderDetail.items[0],
            variant: {
              variant_id: "variant-detailed",
              attributes: {
                quality_tier: 5,
                quality_value: 98.2,
                crafted_source: "crafted",
                blueprint_tier: 5,
              },
              display_name: "Tier 5 (98.2%) - Crafted - BP T5",
              short_name: "T5 C BP5",
            },
            quantity: 1,
            price_per_unit: 100000,
            subtotal: 100000,
          },
        ],
      }

      vi.mocked(useGetOrderDetailQuery).mockReturnValue({
        data: detailedOrder,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

      await waitFor(() => {
        // All attributes should be visible (Tier 5 appears in both the
        // display name and the QualityBadge chip)
        expect(screen.getAllByText(/Tier 5/).length).toBeGreaterThan(0)
        expect(screen.getByText(/98\.2%/)).toBeInTheDocument()
        expect(screen.getByText(/Crafted/)).toBeInTheDocument()
        expect(screen.getByText(/BP T5/)).toBeInTheDocument()
      })
    })

    it("handles missing optional attributes gracefully", async () => {
      const minimalOrder = {
        ...mockOrderDetail,
        items: [
          {
            ...mockOrderDetail.items[0],
            variant: {
              variant_id: "variant-minimal",
              attributes: {
                quality_tier: 3,
              },
              display_name: "Tier 3",
              short_name: "T3",
            },
            quantity: 5,
            price_per_unit: 5000,
            subtotal: 25000,
          },
        ],
      }

      vi.mocked(useGetOrderDetailQuery).mockReturnValue({
        data: minimalOrder,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<OrderDetailsAreaV2 orderId="test-order-id" />)

      await waitFor(() => {
        // Should display minimal attributes without errors ("Tier 3" appears
        // in both the display name and the QualityBadge chip)
        expect(screen.getAllByText("Tier 3").length).toBeGreaterThan(0)
        expect(screen.getByText("25,000 aUEC")).toBeInTheDocument()
      })
    })

    it("displays variant attributes in table format", async () => {
      vi.mocked(useGetOrderDetailQuery).mockReturnValue({
        data: mockOrderDetail,
        isLoading: false,
        error: undefined,
      } as any)

      const { container } = renderWithProviders(
        <OrderDetailsAreaV2 orderId="test-order-id" />,
      )

      await waitFor(() => {
        // Check that variant info is in table structure
        const table = screen.getByRole("table")
        expect(table).toBeInTheDocument()

        // Check for table rows with variant data
        const rows = container.querySelectorAll("tbody tr")
        expect(rows.length).toBeGreaterThan(0)
      })
    })
  })
})
