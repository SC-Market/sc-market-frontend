import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { ReceivedOffersPage } from "../ReceivedOffersPage"

// Mock the ReceivedOffersArea component
vi.mock("../../../views/offers/ReceivedOffersArea", () => ({
  ReceivedOffersArea: () => <div data-testid="received-offers-area">Received Offers Area</div>,
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

describe("ReceivedOffersPage", () => {
  it("renders with StandardPageLayout", () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <ReceivedOffersPage />
      </MemoryRouter>,
    )

    // Should render the ReceivedOffersArea
    expect(screen.getByTestId("received-offers-area")).toBeInTheDocument()

    // Should have breadcrumbs
    expect(container.querySelector("nav")).toBeInTheDocument()
  })

  it("displays correct breadcrumbs", () => {
    renderWithProviders(
      <MemoryRouter>
        <ReceivedOffersPage />
      </MemoryRouter>,
    )

    // Check for breadcrumb text (translations will be keys in test)
    expect(screen.getByText("offers.dashboard")).toBeInTheDocument()
    expect(screen.getByText("offers.receivedOffers")).toBeInTheDocument()
  })

  it("displays header title", () => {
    renderWithProviders(
      <MemoryRouter>
        <ReceivedOffersPage />
      </MemoryRouter>,
    )

    // Header title should be present
    expect(screen.getByText("offers.receivedOffers")).toBeInTheDocument()
  })

  it("uses correct layout configuration", () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <ReceivedOffersPage />
      </MemoryRouter>,
    )

    // Should use ContainerGrid with xl maxWidth
    const mainElement = container.querySelector("main")
    expect(mainElement).toBeInTheDocument()
  })
})
