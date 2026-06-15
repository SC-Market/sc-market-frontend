/**
 * ShoppingList Component Tests
 * 
 * Tests for the ShoppingList component including display, sorting, and CSV export.
 * 
 * Task 14.4 - Create ShoppingList component tests
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ShoppingList } from "../ShoppingList"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { marketV2Api } from "../../../store/api/v2/market"
import { BrowserRouter } from "react-router-dom"
import * as marketV2ApiHooks from "../../../store/api/v2/market"
import { CurrentOrgContext } from "../../../hooks/login/CurrentOrg"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"
import { ThemeProvider, createTheme } from "@mui/material/styles"

// Create a theme with custom properties
const mockTheme = createTheme({
  layoutSpacing: {
    component: 2,
    layout: 3,
  },
} as any)

// Mock the Page component to avoid serviceApi dependency
vi.mock("../../../components/metadata/Page", async () => {
  return {
    Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

// Mock Footer to avoid AlertHookContext dependency
vi.mock("../../../components/footer/Footer", async () => {
  return {
    Footer: () => <div data-testid="footer">Footer</div>,
  }
})

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ wishlist_id: "wishlist-1" }),
  }
})

// Helper to create test store
function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
    preloadedState,
  })
}

// Helper to render with providers
function renderWithProviders(ui: React.ReactElement, { store = createTestStore() } = {}) {
  const currentOrgState: [any, any] = [null, vi.fn()]
  const drawerState: [boolean, any] = [false, vi.fn()]

  return render(
    <Provider store={store}>
      <ThemeProvider theme={mockTheme}>
        <BrowserRouter>
          <DrawerOpenContext.Provider value={drawerState}>
            <CurrentOrgContext.Provider value={currentOrgState}>
              {ui}
            </CurrentOrgContext.Provider>
          </DrawerOpenContext.Provider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

describe("ShoppingList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockShoppingListData = {
    wishlist_id: "wishlist-1",
    wishlist_name: "Test Wishlist",
    materials_needed: [
      {
        game_item_id: "material-1",
        game_item_name: "Aluminum",
        game_item_icon: "https://example.com/aluminum.png",
        total_quantity_needed: 100,
        desired_quality_tier: 3,
        user_inventory_quantity: 50,
        quantity_to_acquire: 50,
        estimated_unit_price: 10,
        estimated_total_cost: 500,
        acquisition_methods: ["purchase", "mining"],
        used_by_items: [
          {
            wishlist_item_id: "item-1",
            item_name: "Ship Component",
            quantity_for_this_item: 100,
          },
        ],
      },
      {
        game_item_id: "material-2",
        game_item_name: "Titanium",
        game_item_icon: "https://example.com/titanium.png",
        total_quantity_needed: 200,
        desired_quality_tier: 5,
        user_inventory_quantity: 0,
        quantity_to_acquire: 200,
        estimated_unit_price: 50,
        estimated_total_cost: 10000,
        acquisition_methods: ["purchase", "salvage"],
        used_by_items: [
          {
            wishlist_item_id: "item-2",
            item_name: "Weapon",
            quantity_for_this_item: 200,
          },
        ],
      },
      {
        game_item_id: "material-3",
        game_item_name: "Copper",
        game_item_icon: "https://example.com/copper.png",
        total_quantity_needed: 50,
        desired_quality_tier: undefined,
        user_inventory_quantity: 60,
        quantity_to_acquire: 0,
        estimated_unit_price: 5,
        estimated_total_cost: 0,
        acquisition_methods: ["mining"],
        used_by_items: [
          {
            wishlist_item_id: "item-3",
            item_name: "Electronics",
            quantity_for_this_item: 50,
          },
        ],
      },
    ],
    total_estimated_cost: 10500,
    materials_fully_stocked: 1,
    materials_partially_stocked: 1,
    materials_not_stocked: 1,
  }

  describe("Display Requirements", () => {
    it("should display materials with quantities (Requirement 9.1, 9.2)", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Check material names are displayed
      expect(screen.getByText("Aluminum")).toBeInTheDocument()
      expect(screen.getByText("Titanium")).toBeInTheDocument()
      expect(screen.getByText("Copper")).toBeInTheDocument()

      // Check quantities are displayed
      expect(screen.getByText("100")).toBeInTheDocument() // Aluminum total needed
      expect(screen.getByText("200")).toBeInTheDocument() // Titanium total needed
      expect(screen.getByText("50")).toBeInTheDocument() // Copper total needed and in stock
    })

    it("should display in-stock vs to-acquire quantities (Requirement 9.2)", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Aluminum: 50 in stock, 50 to acquire
      const aluminumRow = screen.getByText("Aluminum").closest("tr")!
      expect(within(aluminumRow).getByText("50")).toBeInTheDocument()

      // Titanium: 0 in stock, 200 to acquire
      const titaniumRow = screen.getByText("Titanium").closest("tr")!
      expect(within(titaniumRow).getByText("200")).toBeInTheDocument()

      // Copper: 60 in stock, 0 to acquire
      const copperRow = screen.getByText("Copper").closest("tr")!
      expect(within(copperRow).getByText("60")).toBeInTheDocument()
    })

    it("should display estimated costs (Requirement 9.3)", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Check total estimated cost
      expect(screen.getByText("10,500 aUEC")).toBeInTheDocument()

      // Check individual material costs
      expect(screen.getByText("500 aUEC")).toBeInTheDocument() // Aluminum
      expect(screen.getByText("10,000 aUEC")).toBeInTheDocument() // Titanium
    })

    it("should display acquisition methods (Requirement 9.4)", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Check acquisition method chips
      expect(screen.getByText("purchase")).toBeInTheDocument()
      expect(screen.getByText("mining")).toBeInTheDocument()
      expect(screen.getByText("salvage")).toBeInTheDocument()
    })

    it("should display summary statistics", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Check summary cards
      expect(screen.getByText("Total Materials")).toBeInTheDocument()
      expect(screen.getByText("Fully Stocked")).toBeInTheDocument()
      expect(screen.getByText("Partially Stocked")).toBeInTheDocument()
      expect(screen.getByText("Not Stocked")).toBeInTheDocument()

      // Check counts
      expect(screen.getByText("3")).toBeInTheDocument() // Total materials
      expect(screen.getByText("1")).toBeInTheDocument() // Fully stocked, partially stocked, not stocked
    })

    it("should display quality tiers when specified", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Check quality tier chips
      expect(screen.getByText("T3")).toBeInTheDocument() // Aluminum
      expect(screen.getByText("T5")).toBeInTheDocument() // Titanium
      expect(screen.getByText("Any")).toBeInTheDocument() // Copper (no quality specified)
    })

    it("should display stock status indicators", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Check status chips
      expect(screen.getByText("Fully Stocked")).toBeInTheDocument() // Copper
      expect(screen.getByText("Partially Stocked")).toBeInTheDocument() // Aluminum
      expect(screen.getByText("Not Stocked")).toBeInTheDocument() // Titanium
    })
  })

  describe("Sorting Functionality", () => {
    it("should sort by material name", async () => {
      const user = userEvent.setup()

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Click on Material column header to sort
      const materialHeader = screen.getByText("Material")
      await user.click(materialHeader)

      // Materials should be sorted alphabetically
      const rows = screen.getAllByRole("row")
      const materialNames = rows
        .slice(1) // Skip header row
        .map((row) => within(row).queryByText(/Aluminum|Titanium|Copper/))
        .filter(Boolean)
        .map((el) => el!.textContent)

      expect(materialNames).toEqual(["Aluminum", "Copper", "Titanium"])
    })

    it("should sort by quantity", async () => {
      const user = userEvent.setup()

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Click on Total Needed column header to sort
      const quantityHeader = screen.getByText("Total Needed")
      await user.click(quantityHeader)

      // Should be sorted by quantity ascending (50, 100, 200)
      const rows = screen.getAllByRole("row")
      const materialNames = rows
        .slice(1)
        .map((row) => within(row).queryByText(/Aluminum|Titanium|Copper/))
        .filter(Boolean)
        .map((el) => el!.textContent)

      expect(materialNames).toEqual(["Copper", "Aluminum", "Titanium"])
    })

    it("should toggle sort order on second click", async () => {
      const user = userEvent.setup()

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      const materialHeader = screen.getByText("Material")

      // First click: ascending
      await user.click(materialHeader)
      let rows = screen.getAllByRole("row")
      let materialNames = rows
        .slice(1)
        .map((row) => within(row).queryByText(/Aluminum|Titanium|Copper/))
        .filter(Boolean)
        .map((el) => el!.textContent)
      expect(materialNames).toEqual(["Aluminum", "Copper", "Titanium"])

      // Second click: descending
      await user.click(materialHeader)
      rows = screen.getAllByRole("row")
      materialNames = rows
        .slice(1)
        .map((row) => within(row).queryByText(/Aluminum|Titanium|Copper/))
        .filter(Boolean)
        .map((el) => el!.textContent)
      expect(materialNames).toEqual(["Titanium", "Copper", "Aluminum"])
    })
  })

  describe("CSV Export (Requirement 9.5)", () => {
    it("should export shopping list to CSV", async () => {
      const user = userEvent.setup()

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      // Mock URL.createObjectURL
      const mockCreateObjectURL = vi.fn(() => "blob:mock-url")
      globalThis.URL.createObjectURL = mockCreateObjectURL

      // Mock link element
      const mockClick = vi.fn()
      const mockSetAttribute = vi.fn()
      const mockLink = {
        setAttribute: mockSetAttribute,
        click: mockClick,
        style: {},
      }

      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        if (tagName === "a") {
          return mockLink as any
        }
        return originalCreateElement(tagName)
      })

      const mockAppendChild = vi.fn()
      const mockRemoveChild = vi.fn()
      vi.spyOn(document.body, "appendChild").mockImplementation(mockAppendChild)
      vi.spyOn(document.body, "removeChild").mockImplementation(mockRemoveChild)

      renderWithProviders(<ShoppingList />)

      // Click export button
      const exportButton = screen.getByRole("button", { name: /Export to CSV/i })
      await user.click(exportButton)

      // Verify CSV was created and downloaded
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
    })

    it("should disable export button when no materials", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: {
          ...mockShoppingListData,
          materials_needed: [],
        },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      const exportButton = screen.getByRole("button", { name: /Export to CSV/i })
      expect(exportButton).toBeDisabled()
    })
  })

  describe("Navigation (Requirement 9.6)", () => {
    it("should navigate back to wishlist detail", async () => {
      const user = userEvent.setup()

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      const backButton = screen.getByRole("button", { name: /Back to Wishlist/i })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith("/wishlists/wishlist-1")
    })

    it("should display link back to wishlist in error state", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { status: 404, data: { message: "Not found" } },
      } as any)

      renderWithProviders(<ShoppingList />)

      expect(screen.getByRole("button", { name: /Back to Wishlist/i })).toBeInTheDocument()
    })
  })

  describe("Loading and Error States", () => {
    it("should display loading spinner", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })

    it("should display error message on failure", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { status: 500, data: { message: "Server error" } },
      } as any)

      renderWithProviders(<ShoppingList />)

      expect(screen.getByText(/Failed to load shopping list/i)).toBeInTheDocument()
    })

    it("should display empty state when no materials needed", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: {
          ...mockShoppingListData,
          materials_needed: [],
        },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      expect(screen.getByText("No materials needed")).toBeInTheDocument()
      expect(screen.getByText(/Add craftable items to your wishlist/i)).toBeInTheDocument()
    })
  })

  describe("Material Details", () => {
    it("should display material icons", () => {
      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      const aluminumIcon = screen.getByAltText("Aluminum")
      expect(aluminumIcon).toBeInTheDocument()
      expect(aluminumIcon).toHaveAttribute("src", "https://example.com/aluminum.png")
    })

    it("should show tooltip with used-by items on info button hover", async () => {
      const user = userEvent.setup()

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Find info button for Aluminum
      const aluminumRow = screen.getByText("Aluminum").closest("tr")!
      const infoButton = within(aluminumRow).getByRole("button")

      // Hover over info button
      await user.hover(infoButton)

      // Wait for tooltip to appear
      await waitFor(() => {
        expect(screen.getByText("Used by:")).toBeInTheDocument()
        expect(screen.getByText(/Ship Component \(100\)/)).toBeInTheDocument()
      })
    })
  })

  describe("Responsive Design", () => {
    it("should display mobile warning on small screens", () => {
      // Mock mobile viewport
      vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
        matches: query === "(max-width: 899.95px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: mockShoppingListData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      expect(screen.getByText(/Rotate your device or view on desktop/i)).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle materials with no estimated cost", () => {
      const dataWithNoCost = {
        ...mockShoppingListData,
        materials_needed: [
          {
            ...mockShoppingListData.materials_needed[0],
            estimated_unit_price: undefined,
            estimated_total_cost: undefined,
          },
        ],
      }

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: dataWithNoCost,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      expect(screen.getByText("N/A")).toBeInTheDocument()
    })

    it("should handle materials with multiple used-by items", () => {
      const dataWithMultipleItems = {
        ...mockShoppingListData,
        materials_needed: [
          {
            ...mockShoppingListData.materials_needed[0],
            used_by_items: [
              {
                wishlist_item_id: "item-1",
                item_name: "Ship Component",
                quantity_for_this_item: 50,
              },
              {
                wishlist_item_id: "item-2",
                item_name: "Weapon",
                quantity_for_this_item: 50,
              },
            ],
          },
        ],
      }

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: dataWithMultipleItems,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Component should render without errors
      expect(screen.getByText("Aluminum")).toBeInTheDocument()
    })

    it("should handle zero total estimated cost", () => {
      const dataWithZeroCost = {
        ...mockShoppingListData,
        total_estimated_cost: 0,
      }

      vi.spyOn(marketV2ApiHooks, "useGenerateShoppingListQuery").mockReturnValue({
        data: dataWithZeroCost,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<ShoppingList />)

      // Total cost card should not be displayed
      expect(screen.queryByText("Estimated Total Cost")).not.toBeInTheDocument()
    })
  })
})
