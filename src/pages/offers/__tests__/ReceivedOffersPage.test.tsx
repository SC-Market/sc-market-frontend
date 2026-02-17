import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { ReceivedOffersPage } from "../ReceivedOffersPage"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"

// Mock the ReceivedOffersArea component
vi.mock("../../../views/offers/ReceivedOffersArea", () => ({
  ReceivedOffersArea: () => <div data-testid="received-offers-area">Received Offers Area</div>,
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

describe("ReceivedOffersPage", () => {
  it("renders without crashing", () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <ReceivedOffersPage />
      </MemoryRouter>,
    )

    // Should render the ReceivedOffersArea
    expect(screen.getByTestId("received-offers-area")).toBeInTheDocument()
  })

  it("renders the main content area", () => {
    renderWithProviders(
      <MemoryRouter>
        <ReceivedOffersPage />
      </MemoryRouter>,
    )

    // Check that the content area is rendered
    expect(screen.getByTestId("received-offers-area")).toBeInTheDocument()
  })
})
