/**
 * Integration Tests for ViewMarketListing Page
 *
 * These tests verify the refactored page architecture including:
 * - Page renders with loading state
 * - Page renders with data
 * - Page handles 404 error
 * - Page handles server error
 *
 * Requirements: 7.1, 7.2, 12.2
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ViewMarketListing } from "../ViewMarketListing"
import { marketApi } from "../../../features/market/api/marketApi"
import type { BaseListingType } from "../../../features/market/domain/types"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"

// Mock the market API
vi.mock("../../../features/market/api/marketApi", () => ({
  marketApi: {
    reducerPath: "marketApi",
    reducer: vi.fn((state = {}) => state),
    middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
    endpoints: {},
  },
  useGetMarketListingQuery: vi.fn(),
}))

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}))

// Mock the Page component
vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock ErrorPage component
vi.mock("../../../pages/errors/ErrorPage", () => ({
  ErrorPage: () => <div data-testid="error-page">Error Page</div>,
}))

// Mock Footer
vi.mock("../../../components/footer/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

// Mock the lazy-loaded MarketListingView
vi.mock("../../../features/market/views/MarketListingView", () => ({
  MarketListingView: () => <div data-testid="market-listing-view">Market Listing View</div>,
  default: () => <div data-testid="market-listing-view">Market Listing View</div>,
  MarketListingViewSkeleton: () => (
    <div data-testid="market-listing-skeleton">Loading skeleton</div>
  ),
}))

// Mock CurrentMarketListingContext
vi.mock("../../../features/market/hooks/CurrentMarketItem", () => ({
  CurrentMarketListingContext: {
    Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}))

// Mock formatCompleteListingUrl
vi.mock("../../../util/urls", () => ({
  formatCompleteListingUrl: (listing: any) =>
    `/market/listing/${listing.listing_id}`,
}))

// Import the mocked function
import { useGetMarketListingQuery } from "../../../features/market/api/marketApi"

// Create a real MUI theme
const mockTheme = createTheme({
  layoutSpacing: {
    component: 2,
    layout: 3,
  },
} as any)

// Create a mock store
function createMockStore() {
  return configureStore({
    reducer: {
      [marketApi.reducerPath]: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketApi.middleware),
  })
}

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const store = createMockStore()
  const drawerState = React.useState(false)

  return (
    <Provider store={store}>
      <ThemeProvider theme={mockTheme}>
        <BrowserRouter>
          <DrawerOpenContext.Provider value={drawerState}>
            <Routes>
              <Route path="/market/listing/:id" element={children} />
              <Route path="/404" element={<div data-testid="404-page">404 Page</div>} />
            </Routes>
          </DrawerOpenContext.Provider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

// Helper to render with route
function renderWithRoute(listingId: string) {
  window.history.pushState({}, "", `/market/listing/${listingId}`)
  return render(
    <TestWrapper>
      <ViewMarketListing />
    </TestWrapper>
  )
}

describe("ViewMarketListing - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test: Page renders with loading state
   * Requirements: 7.1, 7.2, 12.2
   */
  it("renders with loading state", () => {
    // Mock loading state
    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-123")

    // Verify skeleton is displayed during loading
    expect(screen.getByTestId("market-listing-skeleton")).toBeInTheDocument()

    // Verify actual content is not displayed
    expect(screen.queryByTestId("market-listing-view")).not.toBeInTheDocument()
  })

  /**
   * Test: Page renders with data
   * Requirements: 7.1, 7.2, 12.2
   */
  it("renders with data", async () => {
    const mockListing: BaseListingType = {
      listing_id: "test-123",
      details: {
        title: "Test Listing Title",
        description: "Test description",
      },
      price: 1000,
      quantity_available: 10,
    } as unknown as BaseListingType

    // Mock successful data fetch
    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: mockListing,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-123")

    // Wait for lazy-loaded content to appear
    await waitFor(() => {
      expect(screen.getByTestId("market-listing-view")).toBeInTheDocument()
    })

    // Verify title is displayed (check for multiple instances)
    const titles = screen.getAllByText("Test Listing Title")
    expect(titles.length).toBeGreaterThan(0)

    // Verify skeleton is not displayed
    expect(screen.queryByTestId("market-listing-skeleton")).not.toBeInTheDocument()

    // Verify cart button is displayed
    expect(screen.getByText("marketActions.myCart")).toBeInTheDocument()
  })

  /**
   * Test: Page handles 404 error
   * Requirements: 7.1, 7.2, 12.2
   */
  it("handles 404 error", () => {
    const mock404Error = {
      status: 404,
      data: "Not found",
    }

    // Mock 404 error
    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: mock404Error,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("nonexistent-123")

    // Verify error page is displayed for 404 errors
    // Note: The error handling utility treats 404 as a server error, not a redirect
    expect(screen.getByTestId("error-page")).toBeInTheDocument()

    // Verify content is not displayed
    expect(screen.queryByTestId("market-listing-view")).not.toBeInTheDocument()
  })

  /**
   * Test: Page handles server error
   * Requirements: 7.1, 7.2, 12.2
   */
  it("handles server error", () => {
    const mockServerError = {
      status: 500,
      data: "Internal server error",
    }

    // Mock server error
    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: mockServerError,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-123")

    // Verify error page is displayed
    expect(screen.getByTestId("error-page")).toBeInTheDocument()

    // Verify content is not displayed
    expect(screen.queryByTestId("market-listing-view")).not.toBeInTheDocument()
  })

  /**
   * Test: Page displays breadcrumbs
   * Requirements: 7.1, 12.2
   */
  it("displays breadcrumbs with listing title", () => {
    const mockListing: BaseListingType = {
      listing_id: "test-123",
      details: {
        title: "Test Listing Title",
        description: "Test description",
      },
    } as unknown as BaseListingType

    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: mockListing,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-123")

    // Verify breadcrumb items are present (check for multiple instances)
    expect(screen.getByText("Market")).toBeInTheDocument()
    const titles = screen.getAllByText("Test Listing Title")
    expect(titles.length).toBeGreaterThan(0)
  })

  /**
   * Test: Page displays default breadcrumb during loading
   * Requirements: 7.1, 12.2
   */
  it("displays default breadcrumb during loading", () => {
    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-123")

    // Verify default breadcrumb is displayed
    expect(screen.getByText("Market")).toBeInTheDocument()
    expect(screen.getByText("Listing")).toBeInTheDocument()
  })

  /**
   * Test: Page uses DetailPageLayout
   * Requirements: 7.1, 12.2
   */
  it("uses DetailPageLayout with correct configuration", () => {
    const mockListing: BaseListingType = {
      listing_id: "test-123",
      details: {
        title: "Test Listing Title",
        description: "Test description",
      },
    } as unknown as BaseListingType

    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: mockListing,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    const { container } = renderWithRoute("test-123")

    // Verify page structure includes layout elements
    expect(container.querySelector('[data-testid="footer"]')).toBeInTheDocument()

    // Verify entity title is displayed (check for multiple instances)
    const titles = screen.getAllByText("Test Listing Title")
    expect(titles.length).toBeGreaterThan(0)
  })

  /**
   * Test: Page handles network error
   * Requirements: 7.1, 7.2
   */
  it("handles network error", () => {
    const mockNetworkError = {
      status: "FETCH_ERROR",
      error: "Network request failed",
    }

    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: mockNetworkError,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-123")

    // Verify error page is displayed for network errors
    expect(screen.getByTestId("error-page")).toBeInTheDocument()
  })
})
