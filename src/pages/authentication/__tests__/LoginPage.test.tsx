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
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
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
} as any)

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
  const alertState = React.useState<any>(null)
  const mockAlertContext: any = [alertState[0], alertState[1]]
  const currentOrgState = React.useState<string | null>(null)

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
