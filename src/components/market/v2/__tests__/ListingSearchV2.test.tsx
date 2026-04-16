/**
 * Unit tests for ListingSearchV2 component
 *
 * Tests:
 * - Renders sidebar + content layout
 * - Uses generated API hook
 * - Displays listing cards with V1 visual elements
 * - Pagination with ListingPagination
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import "@testing-library/jest-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"

// Mock the generated V2 API
const mockSearchData = {
  total: 2,
  listings: [
    {
      listing_id: "abc-123",
      listing_type: "unique",
      item_type: "ship",
      item_name: "Aurora MR",
      game_item_id: null,
      sale_type: "sale",
      price: 25000,
      expiration: "2026-06-01T00:00:00Z",
      minimum_price: 25000,
      maximum_price: 25000,
      quantity_available: 3,
      timestamp: new Date().toISOString(),
      total_rating: 4.5,
      avg_rating: 4.5,
      details_id: null,
      status: "active" as const,
      user_seller: "testuser",
      contractor_seller: null,
      auction_end_time: null,
      rating_count: 10,
      rating_streak: 5,
      total_orders: 20,
      total_assignments: 0,
      response_rate: 0.95,
      title: "Aurora MR - Great Condition",
      photo: "",
      internal: false,
      badges: null,
    },
  ],
}

vi.mock("../../../../store/api/v2/market", () => ({
  useSearchListingsQuery: vi.fn(() => ({
    data: mockSearchData,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })),
}))

// Mock MarketSidebar (heavy component with many dependencies)
vi.mock("../../../../features/market/components/MarketSidebar", () => ({
  MarketSidebar: () => <div data-testid="market-sidebar">Sidebar</div>,
}))

// Mock MarketNavArea
vi.mock("../../../../features/market/components/MarketNavArea", () => ({
  HideOnScroll: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MarketNavArea: () => <div data-testid="market-nav">Nav</div>,
}))

// Mock market hooks
vi.mock("../../../../features/market", () => ({
  useMarketSidebarExp: () => false,
}))

// Mock theme
vi.mock("../../../../hooks/styles/Theme", () => ({
  ExtendedTheme: {},
  cardFadeGradient: () => "linear-gradient(transparent, black)",
}))

// Mock @mui/material/styles to provide ExtendedTheme values
vi.mock("@mui/material/styles", async () => {
  const actual = await vi.importActual("@mui/material/styles")
  return {
    ...actual,
    useTheme: () => ({
      ...(actual as any).createTheme(),
      layoutSpacing: { layout: 1, component: 1.5, text: 0.5, compact: 0.5 },
      borderRadius: { topLevel: 1 },
      palette: {
        mode: "dark",
        primary: { main: "#90caf9" },
        secondary: { main: "#ce93d8" },
        text: { primary: "#fff", secondary: "#aaa" },
        background: { paper: "#121212", default: "#121212", sidebar: "#1a1a1a" },
        outline: { main: "#333" },
        action: { selected: "rgba(255,255,255,0.08)" },
        error: { main: "#f44336" },
        warning: { main: "#ff9800" },
      },
      spacing: (n: number) => `${n * 8}px`,
      breakpoints: (actual as any).createTheme().breakpoints,
    }),
  }
})

// Mock utilities
vi.mock("../../../../util/constants", () => ({
  FALLBACK_IMAGE_URL: "/fallback.png",
}))

vi.mock("../../../../util/badges", () => ({
  calculateBadgesFromRating: () => [],
  prioritizeBadges: () => [],
}))

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue || opts?.count?.toString() || key,
    i18n: { language: "en" },
  }),
}))

// Mock skeletons and empty states
vi.mock("../../../skeletons", () => ({
  ListingSkeleton: () => <div data-testid="listing-skeleton" />,
}))

vi.mock("../../../empty-states", () => ({
  EmptyListings: () => <div data-testid="empty-listings" />,
}))

// Mock ListingPagination
vi.mock("../../../../features/market/components/listings/ListingPagination", () => ({
  ListingPagination: () => <div data-testid="listing-pagination" />,
}))

// Mock ListingCard exports
vi.mock("../../../../features/market/components/listings/ListingCard", () => ({
  ListingWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LISTING_CARD_WIDTH: 200,
}))

// Mock rating components
vi.mock("../../../rating/ListingRating", () => ({
  MarketListingRating: () => <span data-testid="rating" />,
  BadgeDisplay: () => <span data-testid="badges" />,
}))

vi.mock("../../../typography/UnderlineLink", () => ({
  UnderlineLink: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

const createTestStore = () =>
  configureStore({
    reducer: { placeholder: (state = {}) => state },
  })

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <Provider store={createTestStore()}>
      <MemoryRouter initialEntries={["/market"]}>
        {ui}
      </MemoryRouter>
    </Provider>,
  )
}

describe("ListingSearchV2", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders listing cards with V1 visual elements", async () => {
    const { ListingSearchV2 } = await import("../ListingSearchV2")
    renderWithProviders(<ListingSearchV2 />)

    // Should show listing title
    expect(screen.getByText(/Aurora MR - Great Condition/)).toBeInTheDocument()

    // Should show price
    expect(screen.getByText(/25,000 aUEC/)).toBeInTheDocument()

    // Should show seller name
    expect(screen.getByText("testuser")).toBeInTheDocument()

    // Should show quantity (t mock returns count or key)
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("renders pagination", async () => {
    const { ListingSearchV2 } = await import("../ListingSearchV2")
    renderWithProviders(<ListingSearchV2 />)

    expect(screen.getByTestId("listing-pagination")).toBeInTheDocument()
  })

  it("renders sidebar on desktop", async () => {
    const { ListingSearchV2 } = await import("../ListingSearchV2")
    renderWithProviders(<ListingSearchV2 />)

    // MarketSidebar should be rendered (either mobile or desktop)
    expect(screen.getByTestId("market-sidebar")).toBeInTheDocument()
  })
})
