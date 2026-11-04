import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { LoginPage } from "../LoginPage"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"
import { AlertHookContext } from "../../../hooks/alert/AlertHook"
import { CurrentOrgContext } from "../../../hooks/login/CurrentOrg"
import type { Contractor } from "../../../features/contractor/domain/types"
import type { AlertInterface } from "../../../datatypes/Alert"

// Mock the hooks
vi.mock("../../../features/authentication/hooks/usePageLogin", () => ({
  usePageLogin: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    errorMessage: null,
    clearError: vi.fn(),
  })),
}))

vi.mock("../../../store/profile", () => ({
  useGetUserProfileQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: undefined,
  })),
}))

// Mock the Page component to avoid RTK Query middleware issues
vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock i18next
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

// Mock Footer to avoid rendering issues
vi.mock("../../../components/footer/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

// Create a real MUI theme with layoutSpacing
const mockTheme = createTheme({
  layoutSpacing: {
    component: 2,
    layout: 3,
  },
})

// Create a minimal store
const createMockStore = () =>
  configureStore({
    reducer: {
      // Add minimal reducers as needed
    },
  })

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const store = createMockStore()
  const drawerState = React.useState(false)
  const mockAlertContext = React.useState<AlertInterface | null>(null)
  const currentOrgState = React.useState<Contractor | null>(null)

  return (
    <Provider store={store}>
      <ThemeProvider theme={mockTheme}>
        <BrowserRouter>
          <DrawerOpenContext.Provider value={drawerState}>
            <AlertHookContext.Provider value={mockAlertContext}>
              <CurrentOrgContext.Provider value={currentOrgState}>
                {children}
              </CurrentOrgContext.Provider>
            </AlertHookContext.Provider>
          </DrawerOpenContext.Provider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

describe("LoginPage", () => {
  it("renders the login page", () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    )

    // Check that the sign in title is present
    expect(screen.getByText(/sign in to sc market/i)).toBeInTheDocument()
  })

  it("renders with proper layout structure", () => {
    const { container } = render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    )

    // Verify the page structure exists
    expect(container.querySelector("main")).toBeInTheDocument()
  })
})
