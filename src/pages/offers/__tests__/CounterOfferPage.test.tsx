import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { CounterOfferPage } from "../CounterOfferPage"
import * as offerHooks from "../../../features/offers/hooks/usePageCounterOffer"

// Mock the page hook
vi.mock("../../../features/offers/hooks/usePageCounterOffer")

// Mock the view components
vi.mock("../../../views/offers/OfferDetailsEditArea", () => ({
  OfferDetailsEditArea: () => <div data-testid="offer-details-edit">Offer Details Edit</div>,
}))

vi.mock("../../../views/offers/CounterOfferSubmitArea", () => ({
  CounterOfferSubmitArea: () => <div data-testid="counter-offer-submit">Submit Area</div>,
}))

vi.mock("../../../views/offers/OfferServiceEditArea", () => ({
  OfferServiceEditArea: () => <div data-testid="offer-service-edit">Service Edit</div>,
}))

vi.mock("../../../views/offers/OfferMarketListingsEditArea", () => ({
  OfferMarketListingsEditArea: () => <div data-testid="offer-listings-edit">Listings Edit</div>,
}))

const mockStore = configureStore({
  reducer: {
    // Add minimal reducers needed for the test
  },
})

const mockTheme = createTheme({
  layoutSpacing: {
    compact: 1,
    component: 2,
    layout: 3,
  },
} as any)

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={mockTheme}>
        {ui}
      </ThemeProvider>
    </Provider>,
  )
}

describe("CounterOfferPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders with loading state", () => {
    vi.mocked(offerHooks.usePageCounterOffer).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    })

    renderWithProviders(
      <MemoryRouter initialEntries={["/counter-offer/test-id"]}>
        <Routes>
          <Route path="/counter-offer/:id" element={<CounterOfferPage />} />
        </Routes>
      </MemoryRouter>,
    )

    // Should show skeleton during loading
    expect(screen.queryByTestId("offer-details-edit")).not.toBeInTheDocument()
  })

  it("renders with data", async () => {
    const mockSession = {
      id: "test-session-id",
      offers: [
        {
          cost: "1000",
          description: "Test description",
          kind: "Delivery",
          payment_type: "one-time",
          title: "Test Offer",
          market_listings: [],
          service: null,
          timestamp: "2024-01-01T00:00:00Z",
        },
      ],
      customer: { username: "test-customer" },
      contractor: null,
      assigned_to: { username: "test-seller" },
      contract_id: null,
    }

    const mockCounterOffer = {
      cost: "1000",
      description: "Test description",
      kind: "Delivery",
      payment_type: "one-time",
      title: "Test Offer",
      market_listings: [],
      service_id: null,
      session_id: "test-session-id",
      status: "counteroffered" as const,
    }

    vi.mocked(offerHooks.usePageCounterOffer).mockReturnValue({
      data: {
        session: mockSession as any,
        counterOffer: mockCounterOffer,
        setCounterOffer: vi.fn(),
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    })

    renderWithProviders(
      <MemoryRouter initialEntries={["/counter-offer/test-id"]}>
        <Routes>
          <Route path="/counter-offer/:id" element={<CounterOfferPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("offer-details-edit")).toBeInTheDocument()
      expect(screen.getByTestId("offer-service-edit")).toBeInTheDocument()
      expect(screen.getByTestId("offer-listings-edit")).toBeInTheDocument()
      expect(screen.getByTestId("counter-offer-submit")).toBeInTheDocument()
    })
  })

  it("uses FormPageLayout with correct configuration", () => {
    vi.mocked(offerHooks.usePageCounterOffer).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    })

    const { container } = renderWithProviders(
      <MemoryRouter initialEntries={["/counter-offer/test-id"]}>
        <Routes>
          <Route path="/counter-offer/:id" element={<CounterOfferPage />} />
        </Routes>
      </MemoryRouter>,
    )

    // Should have breadcrumbs
    expect(container.querySelector("nav")).toBeInTheDocument()
  })

  it("handles 404 error", () => {
    vi.mocked(offerHooks.usePageCounterOffer).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: { status: 404 },
      refetch: vi.fn(),
    })

    renderWithProviders(
      <MemoryRouter initialEntries={["/counter-offer/test-id"]}>
        <Routes>
          <Route path="/counter-offer/:id" element={<CounterOfferPage />} />
          <Route path="/404" element={<div>404 Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText("404 Page")).toBeInTheDocument()
  })
})
