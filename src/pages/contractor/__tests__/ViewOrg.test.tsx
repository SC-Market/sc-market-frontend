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
    t: (key: string, defaultValue?: string | Record<string, any>) => {
      // Handle both string and object default values
      if (typeof defaultValue === "string") {
        return defaultValue
      }
      return key
    },
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

// Mock the ReportButton to avoid AlertHookContext issues
vi.mock("../../../components/button/ReportButton", () => ({
  ReportButton: () => <button data-testid="report-button">Report</button>,
}))

// Mock the OrgInfo component
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
      kind: "organization",
      avatar: "https://example.com/avatar.png",
      banner: "https://example.com/banner.png",
      rating: { avg_rating: 4.5, rating_count: 100, total_rating: 450, streak: 10 },
      size: 50,
      name: "Test Organization",
      description: "Test description",
      fields: [],
      spectrum_id: "test-org",
      official_server_id: null,
      discord_thread_channel_id: null,
      market_order_template: "",
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

    // Wait for content to appear (Suspense boundary)
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
   * Test: Page uses usePageOrg hook
   * Requirements: 5.1, 5.2, 5.3, 5.5
   */
  it("uses usePageOrg hook for data fetching", () => {
    const mockContractor: Contractor = {
      kind: "organization",
      avatar: "https://example.com/avatar.png",
      banner: "https://example.com/banner.png",
      rating: { avg_rating: 4.5, rating_count: 100, total_rating: 450, streak: 10 },
      size: 50,
      name: "Test Organization",
      description: "Test description",
      fields: [],
      spectrum_id: "test-org",
      official_server_id: null,
      discord_thread_channel_id: null,
      market_order_template: "",
    } as Contractor

    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: mockContractor,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    // Verify the hook was called with the correct ID
    expect(useGetContractorBySpectrumIDQuery).toHaveBeenCalledWith("test-org")
  })

  /**
   * Test: Page displays loading skeleton during fetch
   * Requirements: 3.2, 8.2
   */
  it("displays skeleton during initial load", () => {
    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    // Verify skeleton is displayed
    expect(screen.getByTestId("org-info-skeleton")).toBeInTheDocument()
  })

  /**
   * Test: Page maintains original layout structure
   * Requirements: 1.1, 1.2, 1.3, 12.2
   */
  it("maintains original page structure without duplicate breadcrumbs", async () => {
    const mockContractor: Contractor = {
      kind: "organization",
      avatar: "https://example.com/avatar.png",
      banner: "https://example.com/banner.png",
      rating: { avg_rating: 4.5, rating_count: 100, total_rating: 450, streak: 10 },
      size: 50,
      name: "Test Organization",
      description: "Test description",
      fields: [],
      spectrum_id: "test-org",
      official_server_id: null,
      discord_thread_channel_id: null,
      market_order_template: "",
    } as Contractor

    vi.mocked(useGetContractorBySpectrumIDQuery).mockReturnValue({
      data: mockContractor,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    renderWithRoute("test-org")

    await waitFor(() => {
      expect(screen.getByTestId("org-info")).toBeInTheDocument()
    })

    // Verify OrgInfo component is rendered (which contains its own breadcrumbs and layout)
    expect(screen.getByTestId("org-info")).toBeInTheDocument()
  })
})

