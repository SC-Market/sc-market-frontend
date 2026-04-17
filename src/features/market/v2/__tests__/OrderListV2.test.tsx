/**
 * OrderListV2 Component Tests
 *
 * Tests for the OrderListV2 component including:
 * - Rendering orders with quality tier information
 * - Filtering by quality tier
 * - Filtering by status and role
 * - Visual parity with V1 OrderList
 * - Loading and error states
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { OrderListV2 } from "../OrderListV2"
import { marketV2Api } from "../../../../store/api/v2/market"

// Mock the RTK Query hook
vi.mock("../../../../store/api/v2/market", async () => {
  const actual = await vi.importActual("../../../../store/api/v2/market")
  return {
    ...actual,
    useGetOrdersQuery: vi.fn(),
  }
})

const { useGetOrdersQuery } = await import("../../../../store/api/v2/market")

// Helper to create a test store
function createTestStore() {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
  })
}

// Helper to render component with providers
function renderWithProviders(ui: React.ReactElement) {
  const store = createTestStore()
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>,
  )
}

describe("OrderListV2", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state", () => {
    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 />)

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("renders error state", () => {
    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: { message: "Server error" } },
    } as any)

    renderWithProviders(<OrderListV2 />)

    expect(screen.getByText(/Failed to load orders/i)).toBeInTheDocument()
  })

  it("renders empty state when no orders", () => {
    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: [], total: 0, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 />)

    expect(screen.getByText(/No orders found/i)).toBeInTheDocument()
  })

  it("renders orders list with quality tier information", async () => {
    const mockOrders = [
      {
        order_id: "order-1",
        title: "Test Order 1",
        buyer_username: "buyer1",
        seller_username: "seller1",
        buyer_avatar: null,
        seller_avatar: null,
        quality_tier_min: 3,
        quality_tier_max: 5,
        status: "pending",
        created_at: "2024-01-01T00:00:00Z",
        total_price: 10000,
        item_count: 2,
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        order_id: "order-2",
        title: "Test Order 2",
        buyer_username: "buyer2",
        seller_username: "seller2",
        buyer_avatar: null,
        seller_avatar: null,
        quality_tier_min: 5,
        quality_tier_max: 5,
        status: "completed",
        created_at: "2024-01-02T00:00:00Z",
        total_price: 20000,
        item_count: 1,
        updated_at: "2024-01-02T00:00:00Z",
      },
    ]

    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: mockOrders, total: 2, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 />)

    await waitFor(() => {
      // Requirement 45.4: Show quality tier in order preview
      expect(screen.getByText("Test Order 1")).toBeInTheDocument()
      expect(screen.getByText("Tier 3-5")).toBeInTheDocument()
      expect(screen.getByText("Test Order 2")).toBeInTheDocument()
      expect(screen.getByText("Tier 5")).toBeInTheDocument()
    })
  })

  it("renders orders without quality tier when not specified", async () => {
    const mockOrders = [
      {
        order_id: "order-1",
        title: "Test Order Without Quality",
        buyer_username: "buyer1",
        seller_username: "seller1",
        buyer_avatar: null,
        seller_avatar: null,
        quality_tier_min: undefined,
        quality_tier_max: undefined,
        status: "pending",
        created_at: "2024-01-01T00:00:00Z",
        total_price: 10000,
        item_count: 1,
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]

    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: mockOrders, total: 1, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 />)

    await waitFor(() => {
      expect(screen.getByText("Test Order Without Quality")).toBeInTheDocument()
      expect(screen.queryByText(/Tier/)).not.toBeInTheDocument()
    })
  })

  it("passes quality tier filters to API", () => {
    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: [], total: 0, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    // Requirement 45.5: Filter orders by quality tier
    renderWithProviders(
      <OrderListV2 qualityTierMin={3} qualityTierMax={5} />,
    )

    expect(useGetOrdersQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        quality_tier_min: 3,
        quality_tier_max: 5,
      }),
    )
  })

  it("passes status filter to API", () => {
    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: [], total: 0, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 status="completed" />)

    expect(useGetOrdersQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
      }),
    )
  })

  it("passes role filter to API", () => {
    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: [], total: 0, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 role="buyer" />)

    expect(useGetOrdersQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "buyer",
      }),
    )
  })

  it("passes pagination parameters to API", () => {
    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: [], total: 0, page: 2, page_size: 50 },
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 page={2} pageSize={50} />)

    expect(useGetOrdersQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        page_size: 50,
      }),
    )
  })

  it("renders with optional title", async () => {
    const mockOrders = [
      {
        order_id: "order-1",
        title: "Test Order",
        buyer_username: "buyer1",
        seller_username: "seller1",
        buyer_avatar: null,
        seller_avatar: null,
        quality_tier_min: 3,
        quality_tier_max: 3,
        status: "pending",
        created_at: "2024-01-01T00:00:00Z",
        total_price: 10000,
        item_count: 1,
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]

    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: mockOrders, total: 1, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 title="My Orders" />)

    await waitFor(() => {
      expect(screen.getByText("My Orders")).toBeInTheDocument()
    })
  })

  it("displays seller info when role is buyer", async () => {
    const mockOrders = [
      {
        order_id: "order-1",
        title: "Test Order",
        buyer_username: "buyer1",
        seller_username: "seller1",
        buyer_avatar: null,
        seller_avatar: "https://example.com/seller.jpg",
        quality_tier_min: 3,
        quality_tier_max: 3,
        status: "pending",
        created_at: "2024-01-01T00:00:00Z",
        total_price: 10000,
        item_count: 1,
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]

    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: mockOrders, total: 1, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 role="buyer" />)

    await waitFor(() => {
      expect(screen.getByText(/Seller: seller1/i)).toBeInTheDocument()
    })
  })

  it("displays buyer info when role is seller", async () => {
    const mockOrders = [
      {
        order_id: "order-1",
        title: "Test Order",
        buyer_username: "buyer1",
        seller_username: "seller1",
        buyer_avatar: "https://example.com/buyer.jpg",
        seller_avatar: null,
        quality_tier_min: 3,
        quality_tier_max: 3,
        status: "pending",
        created_at: "2024-01-01T00:00:00Z",
        total_price: 10000,
        item_count: 1,
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]

    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: mockOrders, total: 1, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    renderWithProviders(<OrderListV2 role="seller" />)

    await waitFor(() => {
      expect(screen.getByText(/Buyer: buyer1/i)).toBeInTheDocument()
    })
  })

  it("maintains visual parity with V1 OrderList component", async () => {
    const mockOrders = [
      {
        order_id: "order-1",
        title: "Test Order",
        buyer_username: "buyer1",
        seller_username: "seller1",
        buyer_avatar: null,
        seller_avatar: null,
        quality_tier_min: 3,
        quality_tier_max: 3,
        status: "pending",
        created_at: "2024-01-01T00:00:00Z",
        total_price: 10000,
        item_count: 1,
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]

    vi.mocked(useGetOrdersQuery).mockReturnValue({
      data: { orders: mockOrders, total: 1, page: 1, page_size: 20 },
      isLoading: false,
      error: undefined,
    } as any)

    const { container } = renderWithProviders(<OrderListV2 />)

    await waitFor(() => {
      // Requirement 45.2: Maintain visual parity with V1 OrderList component
      // Check for List component (MuiList-root class)
      const list = container.querySelector('.MuiList-root')
      expect(list).toBeInTheDocument()

      // Check for ListItemButton with Link
      const listItem = screen.getByRole("link")
      expect(listItem).toHaveAttribute("href", "/contract/order-1")

      // Check for Avatar with rounded variant
      const avatar = container.querySelector('.MuiAvatar-rounded')
      expect(avatar).toBeInTheDocument()

      // Check for ListItemText
      expect(screen.getByText("Test Order")).toBeInTheDocument()
    })
  })

  describe("Quality Tier Filtering (Requirement 45.12)", () => {
    it("filters orders by minimum quality tier", () => {
      vi.mocked(useGetOrdersQuery).mockReturnValue({
        data: { orders: [], total: 0, page: 1, page_size: 20 },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<OrderListV2 qualityTierMin={4} />)

      expect(useGetOrdersQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          quality_tier_min: 4,
        }),
      )
    })

    it("filters orders by maximum quality tier", () => {
      vi.mocked(useGetOrdersQuery).mockReturnValue({
        data: { orders: [], total: 0, page: 1, page_size: 20 },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<OrderListV2 qualityTierMax={3} />)

      expect(useGetOrdersQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          quality_tier_max: 3,
        }),
      )
    })

    it("filters orders by quality tier range", () => {
      vi.mocked(useGetOrdersQuery).mockReturnValue({
        data: { orders: [], total: 0, page: 1, page_size: 20 },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(
        <OrderListV2 qualityTierMin={2} qualityTierMax={4} />,
      )

      expect(useGetOrdersQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          quality_tier_min: 2,
          quality_tier_max: 4,
        }),
      )
    })

    it("displays only orders matching quality tier filter", async () => {
      const mockOrders = [
        {
          order_id: "order-1",
          title: "High Quality Order",
          buyer_username: "buyer1",
          seller_username: "seller1",
          buyer_avatar: null,
          seller_avatar: null,
          quality_tier_min: 4,
          quality_tier_max: 5,
          status: "pending",
          created_at: "2024-01-01T00:00:00Z",
          total_price: 50000,
          item_count: 1,
          updated_at: "2024-01-01T00:00:00Z",
        },
      ]

      vi.mocked(useGetOrdersQuery).mockReturnValue({
        data: { orders: mockOrders, total: 1, page: 1, page_size: 20 },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<OrderListV2 qualityTierMin={4} />)

      await waitFor(() => {
        expect(screen.getByText("High Quality Order")).toBeInTheDocument()
        expect(screen.getByText("Tier 4-5")).toBeInTheDocument()
      })
    })

    it("shows empty state when no orders match quality filter", async () => {
      vi.mocked(useGetOrdersQuery).mockReturnValue({
        data: { orders: [], total: 0, page: 1, page_size: 20 },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<OrderListV2 qualityTierMin={5} />)

      await waitFor(() => {
        expect(screen.getByText(/No orders found/i)).toBeInTheDocument()
      })
    })
  })
})
