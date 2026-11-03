import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { CounterOfferPage } from "../CounterOfferPage"
import * as offerHooks from "../../../features/offers/hooks/usePageCounterOffer"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"
import type { GetOfferSessionV2Response } from "../../../store/api/v2/market"

// Mock the page hook
vi.mock("../../../features/offers/hooks/usePageCounterOffer")

// Mock the view components
vi.mock("../../../views/offers/OfferDetailsEditArea", () => ({
  OfferDetailsEditArea: () => (
    <div data-testid="offer-details-edit">Offer Details Edit</div>
  ),
}))

vi.mock("../../../views/offers/CounterOfferSubmitArea", () => ({
  CounterOfferSubmitArea: () => (
    <div data-testid="counter-offer-submit">Submit Area</div>
  ),
}))

vi.mock("../../../views/offers/OfferServiceEditArea", () => ({
  OfferServiceEditArea: () => (
    <div data-testid="offer-service-edit">Service Edit</div>
  ),
}))

vi.mock("../../../features/market/v2/OfferMarketListingsEditAreaV2", () => ({
  OfferMarketListingsEditAreaV2: () => (
    <div data-testid="offer-market-listings-edit">Market Listings Edit</div>
  ),
}))


// Mock the Page component to avoid RTK Query issues
vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock the ReportButton to avoid AlertHookContext issues
vi.mock("../../../components/button/ReportButton", () => ({
  ReportButton: () => <button data-testid="report-button">Report</button>,
}))

// Mock i18next
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(importOriginal),
)

// Mock react-router-dom navigation
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

const mockStore = configureStore({
  reducer: {
    // Add a valid reducer to avoid store errors
    test: (state = {}) => state,
  },
})

const mockTheme = createTheme({
  layoutSpacing: {
    compact: 1,
    component: 2,
    layout: 3,
  },
})

const renderWithProviders = (ui: React.ReactElement) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const drawerState = React.useState(false)

    return (
      <Provider store={mockStore}>
        <ThemeProvider theme={mockTheme}>
          <DrawerOpenContext.Provider value={drawerState}>
            {children}
          </DrawerOpenContext.Provider>
        </ThemeProvider>
      </Provider>
    )
  }

  return render(<Wrapper>{ui}</Wrapper>)
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

    // Should show skeleton during loading - content should not be visible
    expect(screen.queryByTestId("offer-details-edit")).not.toBeInTheDocument()
  })

  it("renders with data", async () => {
    const rating = { avg_rating: 0, rating_count: 0, total_rating: 0, streak: 0 }
    const mockSession = {
      session_id: "test-session-id",
      status: "counteroffered",
      created_at: "2024-01-01T00:00:00Z",
      offers: [
        {
          offer_id: "test-offer-id",
          cost: 1000,
          description: "Test description",
          kind: "Delivery",
          payment_type: "one-time",
          title: "Test Offer",
          status: "counteroffered",
          created_at: "2024-01-01T00:00:00Z",
          actor_username: "test-customer",
          market_listings: [],
          market_listings_v2: [],
          service: null,
        },
      ],
      customer: { username: "test-customer", display_name: "", avatar: "", rating },
      contractor: null,
      assigned_to: { username: "test-seller", display_name: "", avatar: "", rating },
      contract_id: null,
    } satisfies GetOfferSessionV2Response

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
        session: mockSession,
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
    })
  })
})
