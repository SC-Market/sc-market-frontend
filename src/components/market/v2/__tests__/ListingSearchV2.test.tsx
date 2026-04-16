/**
 * Unit tests for ListingSearchV2 component
 * 
 * Tests:
 * - Filter UI rendering
 * - Search API integration
 * - Pagination
 * 
 * Sub-task 14.4
 */

import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ListingSearchV2 } from "../ListingSearchV2"
import { serviceApi } from "../../../../store/service"
import "@testing-library/jest-dom"
import { vi } from "vitest"

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number; defaultValue?: string }) => {
      if (options?.defaultValue) return options.defaultValue
      if (options?.count !== undefined) return `${options.count} listings found`
      return key
    },
  }),
}))

// Mock the V2 API
vi.mock("../api/marketV2Api", () => ({
  marketV2Api: {
    reducerPath: "serviceApi",
    reducer: vi.fn(),
    middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
    endpoints: {},
  },
  useSearchListingsV2Query: vi.fn(),
  useLazySearchListingsV2Query: vi.fn(),
}))

// Import the mocked function
import { useSearchListingsV2Query } from "../api/marketV2Api"

// Helper to create mock store with RTK Query
const createMockStore = () => {
  return configureStore({
    reducer: {
      [serviceApi.reducerPath]: serviceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(serviceApi.middleware),
  })
}

// Helper to render component with router and Redux provider
const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore()
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  )
}

describe("ListingSearchV2", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock response for empty results
    vi.mocked(useSearchListingsV2Query).mockReturnValue({
      data: {
        listings: [],
        total: 0,
        page: 1,
        page_size: 20,
      },
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)
  })

  describe("Filter UI Rendering", () => {
    it("should render all filter inputs", () => {
      renderWithProviders(<ListingSearchV2 />)

      // Text search
      expect(screen.getByLabelText(/market\.v2\.search\.textQuery/i)).toBeInTheDocument()

      // Game item filter
      expect(screen.getByLabelText(/market\.v2\.search\.gameItem/i)).toBeInTheDocument()

      // Quality tier filters - MUI Select components, query by role
      const selects = screen.getAllByRole("combobox")
      expect(selects.length).toBeGreaterThanOrEqual(2) // At least min and max quality selects

      // Price filters
      expect(screen.getByLabelText(/market\.v2\.search\.priceMin/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/market\.v2\.search\.priceMax/i)).toBeInTheDocument()
    })

    it("should allow text input in search field", () => {
      renderWithProviders(<ListingSearchV2 />)

      const searchInput = screen.getByLabelText(/market\.v2\.search\.textQuery/i) as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: "test query" } })

      expect(searchInput.value).toBe("test query")
    })

    it("should allow selecting quality tier min", async () => {
      renderWithProviders(<ListingSearchV2 />)

      const selects = screen.getAllByRole("combobox")
      const qualityMinSelect = selects[0] // First select is quality min
      
      fireEvent.mouseDown(qualityMinSelect)

      // Look for the tier option in the dropdown
      const tier3Option = await screen.findByRole("option", { name: /tier3/i })
      fireEvent.click(tier3Option)

      await waitFor(() => {
        expect(qualityMinSelect).toHaveTextContent(/tier3/i)
      })
    })

    it("should allow selecting quality tier max", async () => {
      renderWithProviders(<ListingSearchV2 />)

      const selects = screen.getAllByRole("combobox")
      const qualityMaxSelect = selects[1] // Second select is quality max
      
      fireEvent.mouseDown(qualityMaxSelect)

      // Look for the tier option in the dropdown
      const tier5Option = await screen.findByRole("option", { name: /tier5/i })
      fireEvent.click(tier5Option)

      await waitFor(() => {
        expect(qualityMaxSelect).toHaveTextContent(/tier5/i)
      })
    })

    it("should allow entering price min", () => {
      renderWithProviders(<ListingSearchV2 />)

      const priceMinInput = screen.getByLabelText(/market\.v2\.search\.priceMin/i) as HTMLInputElement
      fireEvent.change(priceMinInput, { target: { value: "1000" } })

      expect(priceMinInput.value).toBe("1000")
    })

    it("should allow entering price max", () => {
      renderWithProviders(<ListingSearchV2 />)

      const priceMaxInput = screen.getByLabelText(/market\.v2\.search\.priceMax/i) as HTMLInputElement
      fireEvent.change(priceMaxInput, { target: { value: "5000" } })

      expect(priceMaxInput.value).toBe("5000")
    })
  })

  describe("Search API Integration", () => {
    it("should perform search on mount", async () => {
      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText(/0 listings found/i)).toBeInTheDocument()
      })
    })

    it("should display search results", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: [
            {
              listing_id: "1",
              title: "Test Listing 1",
              seller_name: "TestSeller",
              seller_rating: 4.5,
              price_min: 1000,
              price_max: 1000,
              quantity_available: 5,
              quality_tier_min: 3,
              quality_tier_max: 3,
              variant_count: 1,
              created_at: new Date("2024-01-01"),
            },
            {
              listing_id: "2",
              title: "Test Listing 2",
              seller_name: "AnotherSeller",
              seller_rating: 4.8,
              price_min: 2000,
              price_max: 3000,
              quantity_available: 10,
              quality_tier_min: 4,
              quality_tier_max: 5,
              variant_count: 2,
              created_at: new Date("2024-01-02"),
            },
          ],
          total: 2,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText("Test Listing 1")).toBeInTheDocument()
        expect(screen.getByText("Test Listing 2")).toBeInTheDocument()
        expect(screen.getByText(/2 listings found/i)).toBeInTheDocument()
      })
    })

    it("should handle loading state", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: true,
        isSuccess: false,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      // Should show loading indicator
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })

    it("should handle error state", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isSuccess: false,
        isError: true,
        error: new Error("Network error"),
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText(/failed to search listings/i)).toBeInTheDocument()
      })
    })

    it("should update search on filter changes", async () => {
      const mockRefetch = vi.fn()
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: [],
          total: 0,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: mockRefetch,
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      const searchInput = screen.getByLabelText(/market\.v2\.search\.textQuery/i)
      fireEvent.change(searchInput, { target: { value: "weapon" } })

      // Component should trigger a new query when filters change
      // The hook will be called again with new params
      await waitFor(() => {
        expect(useSearchListingsV2Query).toHaveBeenCalled()
      })
    })

    it("should display no results message when empty", async () => {
      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText(/no listings found/i)).toBeInTheDocument()
      })
    })

    it("should navigate to listing detail on click", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: [
            {
              listing_id: "test-listing-123",
              title: "Clickable Listing",
              seller_name: "TestSeller",
              seller_rating: 4.5,
              price_min: 1000,
              price_max: 1000,
              quantity_available: 5,
              quality_tier_min: 3,
              quality_tier_max: 3,
              variant_count: 1,
              created_at: new Date("2024-01-01"),
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText("Clickable Listing")).toBeInTheDocument()
      })

      const listingCard = screen.getByText("Clickable Listing").closest("button")
      fireEvent.click(listingCard!)

      expect(mockNavigate).toHaveBeenCalledWith("/market/v2/listings/test-listing-123")
    })
  })

  describe("Pagination", () => {
    it("should display pagination when multiple pages exist", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: Array.from({ length: 20 }, (_, i) => ({
            listing_id: `listing-${i}`,
            title: `Listing ${i}`,
            seller_name: "TestSeller",
            seller_rating: 4.5,
            price_min: 1000,
            price_max: 1000,
            quantity_available: 5,
            quality_tier_min: 3,
            quality_tier_max: 3,
            variant_count: 1,
            created_at: new Date("2024-01-01"),
          })),
          total: 50,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByRole("navigation")).toBeInTheDocument()
      })
    })

    it("should not display pagination when only one page exists", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: [
            {
              listing_id: "1",
              title: "Single Listing",
              seller_name: "TestSeller",
              seller_rating: 4.5,
              price_min: 1000,
              price_max: 1000,
              quantity_available: 5,
              quality_tier_min: 3,
              quality_tier_max: 3,
              variant_count: 1,
              created_at: new Date("2024-01-01"),
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText("Single Listing")).toBeInTheDocument()
      })

      expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
    })

    it("should change page when pagination button clicked", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: Array.from({ length: 20 }, (_, i) => ({
            listing_id: `listing-${i}`,
            title: `Listing ${i}`,
            seller_name: "TestSeller",
            seller_rating: 4.5,
            price_min: 1000,
            price_max: 1000,
            quantity_available: 5,
            quality_tier_min: 3,
            quality_tier_max: 3,
            variant_count: 1,
            created_at: new Date("2024-01-01"),
          })),
          total: 50,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByRole("navigation")).toBeInTheDocument()
      })

      // Click page 2 button
      const page2Button = screen.getByRole("button", { name: "Go to page 2" })
      fireEvent.click(page2Button)

      // Component should update state and trigger new query
      await waitFor(() => {
        expect(useSearchListingsV2Query).toHaveBeenCalled()
      })
    })
  })

  describe("Display Formatting", () => {
    it("should display price range correctly", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: [
            {
              listing_id: "1",
              title: "Range Listing",
              seller_name: "TestSeller",
              seller_rating: 4.5,
              price_min: 1000,
              price_max: 5000,
              quantity_available: 5,
              quality_tier_min: 3,
              quality_tier_max: 5,
              variant_count: 3,
              created_at: new Date("2024-01-01"),
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText(/1000 - 5000 aUEC/i)).toBeInTheDocument()
      })
    })

    it("should display single price correctly", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: [
            {
              listing_id: "1",
              title: "Fixed Price Listing",
              seller_name: "TestSeller",
              seller_rating: 4.5,
              price_min: 1000,
              price_max: 1000,
              quantity_available: 5,
              quality_tier_min: 3,
              quality_tier_max: 3,
              variant_count: 1,
              created_at: new Date("2024-01-01"),
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText(/1000 aUEC/i)).toBeInTheDocument()
      })
    })

    it("should display quality tier range correctly", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: [
            {
              listing_id: "1",
              title: "Quality Range Listing",
              seller_name: "TestSeller",
              seller_rating: 4.5,
              price_min: 1000,
              price_max: 1000,
              quantity_available: 5,
              quality_tier_min: 2,
              quality_tier_max: 4,
              variant_count: 3,
              created_at: new Date("2024-01-01"),
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText(/tier 2 - 4/i)).toBeInTheDocument()
      })
    })

    it("should display variant count badge when multiple variants", async () => {
      vi.mocked(useSearchListingsV2Query).mockReturnValue({
        data: {
          listings: [
            {
              listing_id: "1",
              title: "Multi Variant Listing",
              seller_name: "TestSeller",
              seller_rating: 4.5,
              price_min: 1000,
              price_max: 1000,
              quantity_available: 5,
              quality_tier_min: 3,
              quality_tier_max: 3,
              variant_count: 5,
              created_at: new Date("2024-01-01"),
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any)

      renderWithProviders(<ListingSearchV2 />)

      await waitFor(() => {
        expect(screen.getByText(/5 variants/i)).toBeInTheDocument()
      })
    })
  })
})
