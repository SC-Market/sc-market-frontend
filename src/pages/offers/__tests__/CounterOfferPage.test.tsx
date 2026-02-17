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

// Mock the Page component to avoid RTK Query issues
vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock the ReportButton to avoid AlertHookContext issues
vi.mock("../../../components/button/ReportButton", () => ({
  ReportButton: () => <button data-testid="report-button">Report</button>,
}))

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key as a string
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
} as any)

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
    })
  })
})
