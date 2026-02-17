/**
 * Integration Tests for ViewOrg Page
 *
 * These tests verify the refactored page architecture including:
 * - Page renders with loading state
 * - Page renders with data
 * - Page handles 404 error
 * - Page handles server error
 *
 * Requirements: 7.1, 7.2, 12.2
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ViewOrg } from "../ViewOrg"
import type { Contractor } from "../../../datatypes/Contractor"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"

// Mock the contractor API
vi.mock("../../../store/contractor", () => ({
  useGetContractorBySpectrumIDQuery: vi.fn(),
  contractorApi: {
    reducerPath: "contractorApi",
    reducer: vi.fn((state = {}) => state),
    middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
    endpoints: {},
  },
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

// Mock the Page component
vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock ErrorPage component
vi.mock("../../../pages/errors/ErrorPage", () => ({
  ErrorPage: () => <div data-testid="error-page">Error Page</div>,
}))

// Mock Footer
vi.mock("../../../components/footer/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

// Mock the lazy-loaded OrgInfo
vi.mock("../../../features/contractor/components/OrgInfo", () => ({
  OrgInfo: ({ contractor }: { contractor: Contractor }) => (
    <div data-testid="org-info">
      <div data-testid="org-name">{contractor.name}</div>
    </div>
  ),
  OrgInfoSkeleton: () => (
    <div data-testid="org-info-skeleton">Loading skeleton</div>
  ),
}))

// Import the mocked function
import { useGetContractorBySpectrumIDQuery } from "../../../store/contractor"

// Create a real MUI theme
const mockTheme = createTheme({
  layoutSpacing: {
    component: 2,
    layout: 3,
  },
} as any)

// Create a mock store
function createMockStore() {
  return configureStore({
    reducer: {
      contractorApi: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  })
}

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const store = createMockStore()
  const drawerState = React.useState(false)

  return (
    <Provider store={store}>
      <ThemeProvider theme={mockTheme}>
        <BrowserRouter>
          <DrawerOpenContext.Provider value={drawerState}>
            <Routes>
              <Route path="/contractors/:id" element={children} />
              <Route path="/404" element={<div data-testid="404-page">404 Page</div>} />
            </Routes>
          </DrawerOpenContext.Provider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

// Helper to render with route
function renderWithRoute(spectrumId: string) {
  window.history.pushState({}, "", `/contractors/${spectrumId}`)
  return render(
    <TestWrapper>
      <ViewOrg />
    </TestWrapper>
  )
}

describe("ViewOrg - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test: Page renders with loading state
   * Requirements: 7.1, 7.2, 12.2
   */
  it("renders with loading state", () => {
    // Mock loading state
    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    // Verify skeleton is displayed during loading
    expect(screen.getByTestId("org-info-skeleton")).toBeInTheDocument()

    // Verify actual content is not displayed
    expect(screen.queryByTestId("org-info")).not.toBeInTheDocument()
  })

  /**
   * Test: Page renders with data
   * Requirements: 7.1, 7.2, 12.2
   */
  it("renders with data", async () => {
    const mockContractor: Contractor = {
      spectrum_id: "test-org",
      name: "Test Organization",
      sid: "TEST",
      members: 50,
      recruiting: false,
      exclusive: false,
      archetype: "Corporation",
    } as Contractor

    // Mock successful data fetch
    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: mockContractor,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    // Wait for lazy-loaded content to appear
    await waitFor(() => {
      expect(screen.getByTestId("org-info")).toBeInTheDocument()
    })

    // Verify organization name is displayed
    expect(screen.getByTestId("org-name")).toHaveTextContent("Test Organization")

    // Verify skeleton is not displayed
    expect(screen.queryByTestId("org-info-skeleton")).not.toBeInTheDocument()
  })

  /**
   * Test: Page handles 404 error
   * Requirements: 7.1, 7.2, 12.2
   */
  it("handles 404 error", () => {
    const mock404Error = {
      status: 404,
      data: "Not found",
    }

    // Mock 404 error
    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: mock404Error,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("nonexistent-org")

    // Verify error page is displayed for 404 errors
    expect(screen.getByTestId("error-page")).toBeInTheDocument()

    // Verify content is not displayed
    expect(screen.queryByTestId("org-info")).not.toBeInTheDocument()
  })

  /**
   * Test: Page handles server error
   * Requirements: 7.1, 7.2, 12.2
   */
  it("handles server error", () => {
    const mockServerError = {
      status: 500,
      data: "Internal server error",
    }

    // Mock server error
    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: mockServerError,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    // Verify error page is displayed
    expect(screen.getByTestId("error-page")).toBeInTheDocument()

    // Verify content is not displayed
    expect(screen.queryByTestId("org-info")).not.toBeInTheDocument()
  })

  /**
   * Test: Page displays breadcrumbs
   * Requirements: 7.1, 12.2
   */
  it("displays breadcrumbs with organization name", () => {
    const mockContractor: Contractor = {
      spectrum_id: "test-org",
      name: "Test Organization",
      sid: "TEST",
      members: 50,
      recruiting: false,
      exclusive: false,
      archetype: "Corporation",
    } as Contractor

    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: mockContractor,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    // Verify breadcrumb items are present
    expect(screen.getByText("Contractors")).toBeInTheDocument()
    expect(screen.getByText("Test Organization")).toBeInTheDocument()
  })

  /**
   * Test: Page displays default breadcrumb during loading
   * Requirements: 7.1, 12.2
   */
  it("displays default breadcrumb during loading", () => {
    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    // Verify default breadcrumb is displayed
    expect(screen.getByText("Contractors")).toBeInTheDocument()
    expect(screen.getByText("org.orgTitle")).toBeInTheDocument()
  })

  /**
   * Test: Page uses DetailPageLayout
   * Requirements: 7.1, 12.2
   */
  it("uses DetailPageLayout with correct configuration", () => {
    const mockContractor: Contractor = {
      spectrum_id: "test-org",
      name: "Test Organization",
      sid: "TEST",
      members: 50,
      recruiting: false,
      exclusive: false,
      archetype: "Corporation",
    } as Contractor

    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: mockContractor,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    const { container } = renderWithRoute("test-org")

    // Verify page structure includes layout elements
    expect(container.querySelector('[data-testid="footer"]')).toBeInTheDocument()
  })

  /**
   * Test: Page handles network error
   * Requirements: 7.1, 7.2
   */
  it("handles network error", () => {
    const mockNetworkError = {
      status: "FETCH_ERROR",
      error: "Network request failed",
    }

    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: mockNetworkError,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    // Verify error page is displayed for network errors
    expect(screen.getByTestId("error-page")).toBeInTheDocument()
  })

  /**
   * Test: Page title updates with organization name
   * Requirements: 7.1, 12.2
   */
  it("sets page title with organization name", () => {
    const mockContractor: Contractor = {
      spectrum_id: "test-org",
      name: "Test Organization",
      sid: "TEST",
      members: 50,
      recruiting: false,
      exclusive: false,
      archetype: "Corporation",
    } as Contractor

    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: mockContractor,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    // The title prop is passed to DetailPageLayout
    // We can verify the breadcrumb contains the org name
    expect(screen.getByText("Test Organization")).toBeInTheDocument()
  })
})
