import { render, screen } from "@testing-library/react"
import { Availability } from "../Availability"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "../../../store/store"
import { describe, it, expect, vi } from "vitest"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import React from "react"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"

// Create a mock theme with layoutSpacing
const mockTheme = createTheme({
  layoutSpacing: {
    component: 2,
    layout: 3,
  },
} as any)

// Mock the hooks
vi.mock("../../../hooks/login/CurrentOrg", () => ({
  useCurrentOrg: () => [{ spectrum_id: "test-org" }],
}))

vi.mock("../../../features/availability/hooks/usePageAvailability", () => ({
  usePageAvailability: () => ({
    data: {
      selections: [],
    },
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock("../../../store/profile", () => ({
  useProfileUpdateAvailabilityMutation: () => [vi.fn(), {}],
}))

vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
    },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}))

// Mock Page component
vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock Footer
vi.mock("../../../components/footer/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const drawerState = React.useState(false)

  return (
    <Provider store={store}>
      <ThemeProvider theme={mockTheme}>
        <BrowserRouter>
          <DrawerOpenContext.Provider value={drawerState}>
            {children}
          </DrawerOpenContext.Provider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

describe("Availability Page", () => {
  it("renders with StandardPageLayout", () => {
    render(
      <TestWrapper>
        <Availability />
      </TestWrapper>,
    )

    // Check that the page title is rendered (there may be multiple instances)
    const availabilityElements = screen.getAllByText(/availability/i)
    expect(availabilityElements.length).toBeGreaterThan(0)
  })

  it("renders AvailabilitySelector when data is loaded", () => {
    render(
      <TestWrapper>
        <Availability />
      </TestWrapper>,
    )

    // The AvailabilitySelector should be rendered
    // It contains a table with days of the week
    const tables = document.querySelectorAll("table")
    expect(tables.length).toBeGreaterThan(0)
  })
})
