/**
 * CraftingCalculator Component Tests
 *
 * Tests for the Crafting Calculator component including:
 * - Blueprint selection autocomplete
 * - Material input via search
 * - Calculate button functionality
 * - Display calculation results
 */

import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { CraftingCalculator } from "../CraftingCalculator"
import { marketV2Api } from "../../../store/api/v2/market"
import { serviceApi } from "../../../store/service"

import { DrawerOpenContext } from "../../../hooks/layout/Drawer"
import { CurrentOrgContext } from "../../../hooks/login/CurrentOrg"

// Create a real MUI theme with custom properties
const mockTheme = createTheme({
  layoutSpacing: {
    component: 2,
    layout: 3,
  },
} as any)

// Mock the Page component
vi.mock("../../../components/metadata/Page", async () => {
  return {
    Page: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }
})

// Mock Footer to avoid AlertHookContext dependency
vi.mock("../../../components/footer/Footer", async () => {
  return {
    Footer: () => <div data-testid="footer">Footer</div>,
  }
})

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the profile API hook
vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: null, isLoading: false }),
}))

// Mock the market v2 hooks used by the component
vi.mock("../../../store/api/v2/market", async () => {
  const actual = await vi.importActual("../../../store/api/v2/market")
  return {
    ...actual,
    useSearchBlueprintsQuery: vi.fn(() => ({
      data: { blueprints: [] },
      isLoading: false,
    })),
    useSearchItemsQuery: vi.fn(() => ({
      data: { items: [] },
      isLoading: false,
    })),
    useSearchResourcesQuery: vi.fn(() => ({
      data: { resources: [] },
      isLoading: false,
    })),
    useCalculateQualityMutation: vi.fn(() => [
      vi.fn(),
      { data: null, isLoading: false, error: null },
    ]),
    useGetInventorySummaryQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
    })),
    useFindCraftableBlueprintsMutation: vi.fn(() => [
      vi.fn(),
      { data: null, isLoading: false },
    ]),
  }
})

// Mock useDebounce to return value immediately
vi.mock("../../../hooks/useDebounce", () => ({
  useDebounce: <T,>(value: T) => value,
}))

// Helper to create a test store
function createTestStore() {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware, serviceApi.middleware),
  })
}

// Helper to render with providers
function renderWithProviders(component: React.ReactElement) {
  const store = createTestStore()

  function TestWrapper({ children }: { children: React.ReactNode }) {
    const drawerState = React.useState(false)
    const currentOrgState = React.useState(null) as any

    return (
      <Provider store={store}>
        <ThemeProvider theme={mockTheme}>
          <BrowserRouter>
            <DrawerOpenContext.Provider value={drawerState}>
              <CurrentOrgContext.Provider value={currentOrgState}>
                {children}
              </CurrentOrgContext.Provider>
            </DrawerOpenContext.Provider>
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    )
  }

  return {
    ...render(<TestWrapper>{component}</TestWrapper>),
    store,
  }
}

describe("CraftingCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Blueprint Selection", () => {
    it("should render the crafting calculator page with blueprint search", () => {
      renderWithProviders(<CraftingCalculator />)

      expect(screen.getByText("Crafting Calculator")).toBeInTheDocument()
      expect(screen.getByLabelText("Search by item name")).toBeInTheDocument()
    })

    it("should allow typing in blueprint search field", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      const autocomplete = screen.getByLabelText("Search by item name")
      await user.type(autocomplete, "weapon")

      expect(autocomplete).toHaveValue("weapon")
    })
  })

  describe("Material Input", () => {
    it("should render the materials section with add material autocomplete", () => {
      renderWithProviders(<CraftingCalculator />)

      expect(screen.getByText("Materials")).toBeInTheDocument()
      expect(screen.getByLabelText("Add material")).toBeInTheDocument()
    })

    it("should show empty state message when no materials added", () => {
      renderWithProviders(<CraftingCalculator />)

      expect(screen.getByText("Search and add materials above")).toBeInTheDocument()
    })

    it("should allow typing in the material search autocomplete", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      const matInput = screen.getByLabelText("Add material")
      await user.type(matInput, "steel")

      expect(matInput).toHaveValue("steel")
    })
  })

  describe("Calculate Button", () => {
    it("should disable calculate button when no blueprint selected and no materials", () => {
      renderWithProviders(<CraftingCalculator />)

      const calculateButton = screen.getByRole("button", { name: /Calculate Output Quality/i })
      expect(calculateButton).toBeDisabled()
    })

    it("should show calculate button with correct text", () => {
      renderWithProviders(<CraftingCalculator />)

      expect(screen.getByRole("button", { name: /Calculate Output Quality/i })).toBeInTheDocument()
    })
  })

  describe("Mode Switching", () => {
    it("should show Craft Calculator and What Can I Craft buttons", () => {
      renderWithProviders(<CraftingCalculator />)

      expect(screen.getByRole("button", { name: /Craft Calculator/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /What Can I Craft/i })).toBeInTheDocument()
    })

    it("should switch to discover mode and show Find Craftable Items button", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      await user.click(screen.getByRole("button", { name: /What Can I Craft/i }))

      expect(screen.getByRole("button", { name: /Find Craftable Items/i })).toBeInTheDocument()
    })
  })

  describe("Calculation Breakdown Display", () => {
    it("should not show result section initially", () => {
      renderWithProviders(<CraftingCalculator />)

      expect(screen.queryByText("Estimated Output")).not.toBeInTheDocument()
    })
  })

  describe("Inventory Import", () => {
    it("should show import from inventory button (disabled when no inventory)", () => {
      renderWithProviders(<CraftingCalculator />)

      const importButton = screen.getByRole("button", { name: /Import from Inventory/i })
      expect(importButton).toBeDisabled()
    })
  })
})
