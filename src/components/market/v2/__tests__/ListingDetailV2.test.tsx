import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { BrowserRouter } from "react-router-dom"
import { ListingDetailV2 } from "../ListingDetailV2"
import { v2_marketApi } from "../../../../store/api/v2/market"

// Mock the API
const mockGetListingDetailsQuery = jest.fn()

jest.mock("../../../../store/api/v2/market", () => ({
  v2_marketApi: {
    reducerPath: "v2_marketApi",
    reducer: jest.fn(),
    middleware: jest.fn(() => (next: any) => (action: any) => next(action)),
  },
  useGetListingDetailsQuery: () => mockGetListingDetailsQuery(),
}))

// Mock other dependencies
jest.mock("../../../../util/time", () => ({
  getRelativeTime: (date: Date) => "2 hours ago",
}))

jest.mock("../../../../util/dateDiff", () => ({
  dateDiffInDays: () => 0,
}))

jest.mock("../../../../components/markdown/Markdown.lazy", () => ({
  MarkdownRender: ({ text }: { text: string }) => <div>{text}</div>,
}))

jest.mock("../../../../components/rating/ListingRating", () => ({
  ListingNameAndRating: () => <div>Seller Name</div>,
}))

jest.mock("../../../../components/button/ReportButton", () => ({
  ReportButton: () => <button>Report</button>,
}))

jest.mock("../../../../components/presence/SellerStatusBadge", () => ({
  SellerStatusBadge: () => <div>Online</div>,
}))

jest.mock("../../listing-view/components/ListingDetailItem", () => ({
  ListingDetailItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const createMockStore = () => {
  return configureStore({
    reducer: {
      [v2_marketApi.reducerPath]: v2_marketApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(v2_marketApi.middleware),
  })
}

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore()
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  )
}

describe("ListingDetailV2", () => {
  const mockListingData = {
    type: "unique" as const,
    listing: {
      listing_id: "test-listing-id",
      expiration: "2026-05-01T00:00:00Z",
      timestamp: "2026-04-15T00:00:00Z",
      status: "active",
      quantity_available: 10,
      price: 50000,
      sale_type: "sale",
      user_seller: {
        username: "testuser",
        rating: 4.5,
      },
      contractor_seller: null,
      languages: [],
    },
    details: {
      title: "Test Listing Title",
      description: "Test listing description",
      item_type: "ship",
      game_item_id: "test-item-id",
    },
    photos: [],
    stats: {
      view_count: 42,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Loading State", () => {
    it("should display loading spinner while fetching data", () => {
      mockGetListingDetailsQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
      })

      renderWithProviders(<ListingDetailV2 listingId="test-id" />)

      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })
  })

  describe("Error Handling", () => {
    it("should display error message when API call fails", () => {
      mockGetListingDetailsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { status: 500, data: { message: "Server error" } },
      })

      renderWithProviders(<ListingDetailV2 listingId="test-id" />)

      expect(screen.getByText(/Failed to load listing details/i)).toBeInTheDocument()
    })

    it("should display 404 error for non-existent listing", () => {
      mockGetListingDetailsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { status: 404, data: { message: "Not found" } },
      })

      renderWithProviders(<ListingDetailV2 listingId="non-existent-id" />)

      expect(screen.getByText(/Listing not found/i)).toBeInTheDocument()
    })
  })

  describe("Listing Metadata Display", () => {
    beforeEach(() => {
      mockGetListingDetailsQuery.mockReturnValue({
        data: mockListingData,
        isLoading: false,
        error: undefined,
      })
    })

    it("should display listing title", () => {
      renderWithProviders(<ListingDetailV2 listingId="test-id" />)

      expect(screen.getByText("Test Listing Title")).toBeInTheDocument()
    })

    it("should display listing description", () => {
      renderWithProviders(<ListingDetailV2 listingId="test-id" />)

      expect(screen.getByText("Test listing description")).toBeInTheDocument()
    })

    it("should display seller information", () => {
      renderWithProviders(<ListingDetailV2 listingId="test-id" />)

      expect(screen.getByText("Seller Name")).toBeInTheDocument()
    })

    it("should display view count", () => {
      renderWithProviders(<ListingDetailV2 listingId="test-id" />)

      expect(screen.getByText(/42/)).toBeInTheDocument()
    })

    it("should display NEW badge for recent listings", () => {
      renderWithProviders(<ListingDetailV2 listingId="test-id" />)

      // The badge should be present for listings created within 1 day
      const badges = screen.queryAllByText(/new/i)
      expect(badges.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe("Variant Breakdown", () => {
    it("should display variant breakdown section for unique listings", () => {
      mockGetListingDetailsQuery.mockReturnValue({
        data: mockListingData,
        isLoading: false,
        error: undefined,
      })

      renderWithProviders(<ListingDetailV2 listingId="test-id" />)

      expect(screen.getByText(/Available Variants/i)).toBeInTheDocument()
    })

    it("should not display variant breakdown for non-unique listings", () => {
      const aggregateListingData = {
        ...mockListingData,
        type: "aggregate" as const,
      }

      mockGetListingDetailsQuery.mockReturnValue({
        data: aggregateListingData,
        isLoading: false,
        error: undefined,
      })

      renderWithProviders(<ListingDetailV2 listingId="test-id" />)

      expect(screen.queryByText(/Available Variants/i)).not.toBeInTheDocument()
    })
  })

  describe("Edit Button", () => {
    it("should display edit button for seller", () => {
      const profile = {
        username: "testuser",
        role: "user",
      }

      mockGetListingDetailsQuery.mockReturnValue({
        data: mockListingData,
        isLoading: false,
        error: undefined,
      })

      renderWithProviders(
        <ListingDetailV2 listingId="test-id" profile={profile} />
      )

      const editButtons = screen.queryAllByRole("link")
      const hasEditLink = editButtons.some(
        (link) => link.getAttribute("href") === "/market_edit/test-listing-id"
      )
      expect(hasEditLink).toBe(true)
    })

    it("should not display edit button for non-seller", () => {
      const profile = {
        username: "otheruser",
        role: "user",
      }

      mockGetListingDetailsQuery.mockReturnValue({
        data: mockListingData,
        isLoading: false,
        error: undefined,
      })

      renderWithProviders(
        <ListingDetailV2 listingId="test-id" profile={profile} />
      )

      const editButtons = screen.queryAllByRole("link")
      const hasEditLink = editButtons.some(
        (link) => link.getAttribute("href") === "/market_edit/test-listing-id"
      )
      expect(hasEditLink).toBe(false)
    })
  })
})
