import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { describe, it, expect, beforeEach, vi } from "vitest"
import "@testing-library/jest-dom"

// Mock the generated API
const mockUseGetMyListingsQuery = vi.fn()
vi.mock("../../../../store/api/v2/market", () => ({
  useGetMyListingsQuery: (...args: any[]) => mockUseGetMyListingsQuery(...args),
}))

vi.mock("../../../../features/market", () => ({
  useMarketSidebarExp: () => false,
}))

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: any) => (typeof fallback === "string" ? fallback : key),
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}))

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock("../../../skeletons", () => ({
  ListingSkeleton: ({ index }: { index: number }) => <div data-testid={`skeleton-${index}`} />,
}))

vi.mock("../../../empty-states", () => ({
  EmptyListings: (props: any) => <div data-testid="empty-listings" />,
}))

vi.mock("../../../../features/market/components/listings/ListingPagination", () => ({
  ListingPagination: () => <div data-testid="listing-pagination" />,
}))

const mockListing = {
  listing_id: "listing-1",
  title: "Test Listing 1",
  status: "active" as const,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
  variant_count: 2,
  total_quantity: 10,
  price_min: 100,
  price_max: 200,
  quality_tier_min: 1,
  quality_tier_max: 3,
}

import { MyListingsV2 } from "../MyListingsV2"

function renderComponent() {
  const store = configureStore({ reducer: { placeholder: (s = {}) => s } })
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <MyListingsV2 />
      </MemoryRouter>
    </Provider>,
  )
}

describe("MyListingsV2", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGetMyListingsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: vi.fn(),
    })
  })

  it("renders loading skeletons when loading", () => {
    renderComponent()
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0)
  })

  it("renders filter controls", () => {
    renderComponent()
    expect(screen.getAllByText("Status").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Sort By").length).toBeGreaterThan(0)
  })

  it("displays listings when data is loaded", () => {
    mockUseGetMyListingsQuery.mockReturnValue({
      data: { listings: [mockListing], total: 1 },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    })

    renderComponent()
    expect(screen.getByText("Test Listing 1")).toBeInTheDocument()
  })

  it("navigates to listing detail on click", () => {
    mockUseGetMyListingsQuery.mockReturnValue({
      data: { listings: [mockListing], total: 1 },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    })

    renderComponent()
    fireEvent.click(screen.getByText("Test Listing 1"))
    expect(mockNavigate).toHaveBeenCalledWith("/market/listing-1")
  })

  it("displays empty state when no listings", () => {
    mockUseGetMyListingsQuery.mockReturnValue({
      data: { listings: [], total: 0 },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    })

    renderComponent()
    expect(screen.getByTestId("empty-listings")).toBeInTheDocument()
  })

  it("renders pagination", () => {
    mockUseGetMyListingsQuery.mockReturnValue({
      data: { listings: [mockListing], total: 1 },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    })

    renderComponent()
    expect(screen.getByTestId("listing-pagination")).toBeInTheDocument()
  })
})
