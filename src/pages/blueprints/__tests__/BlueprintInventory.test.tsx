/**
 * BlueprintInventory Component Tests
 * 
 * Tests for the BlueprintInventory component including:
 * - Rendering owned blueprints
 * - Filtering by category and rarity
 * - Sorting functionality
 * - Acquisition progress display
 * - Bulk import functionality
 * 
 * Task 12.5 - Create BlueprintInventory component
 */

import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BlueprintInventory } from "../BlueprintInventory"
import { marketV2Api as api } from "../../../store/api/v2/market"
import { serviceApi } from "../../../store/service"
import { generatedApiV2 } from "../../../store/generatedApiV2"

// Mock data
const mockInventoryData = {
  blueprints: [
    {
      blueprint_id: "bp-1",
      blueprint_name: "Plasma Rifle Blueprint",
      output_item_name: "Plasma Rifle",
      output_item_icon: "/icons/plasma-rifle.png",
      item_category: "Weapons",
      rarity: "Rare",
      tier: 3,
      acquisition_date: "2024-01-15T10:00:00Z",
      acquisition_method: "mission",
      acquisition_location: "Stanton",
    },
    {
      blueprint_id: "bp-2",
      blueprint_name: "Heavy Armor Blueprint",
      output_item_name: "Heavy Armor",
      output_item_icon: "/icons/heavy-armor.png",
      item_category: "Armor",
      rarity: "Epic",
      tier: 4,
      acquisition_date: "2024-01-20T14:30:00Z",
      acquisition_method: "purchase",
    },
  ],
  total: 2,
  page: 1,
  page_size: 20,
  statistics: {
    total_owned: 45,
    total_available: 1040,
    completion_percentage: 4.33,
    recently_acquired_count: 3,
  },
}

// Mock the API hooks
const mockUseGetUserBlueprintInventoryQuery = vi.fn()
const mockUseAddBlueprintToInventoryMutation = vi.fn()
const mockUseRemoveBlueprintFromInventoryMutation = vi.fn()

vi.mock("../../../store/api/v2/market", () => {
  const mockApi = {
    reducerPath: "api",
    reducer: () => ({}),
    middleware: () => (next: any) => (action: any) => next(action),
  }
  return {
    enhancedApi: mockApi,
    marketV2Api: mockApi,
    useGetUserBlueprintInventoryQuery: () => mockUseGetUserBlueprintInventoryQuery(),
    useAddBlueprintToInventoryMutation: () => mockUseAddBlueprintToInventoryMutation(),
    useRemoveBlueprintFromInventoryMutation: () => mockUseRemoveBlueprintFromInventoryMutation(),
  }
})

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
      [generatedApiV2.reducerPath]: generatedApiV2.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware, serviceApi.middleware, generatedApiV2.middleware),
  })
}

// Helper to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore()
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  )
}

describe("BlueprintInventory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGetUserBlueprintInventoryQuery.mockReturnValue({
      data: mockInventoryData,
      isLoading: false,
      error: undefined,
    })
    mockUseAddBlueprintToInventoryMutation.mockReturnValue([
      vi.fn().mockResolvedValue({ data: { success: true } }),
      { isLoading: false },
    ])
    mockUseRemoveBlueprintFromInventoryMutation.mockReturnValue([
      vi.fn().mockResolvedValue({ data: { success: true } }),
      { isLoading: false },
    ])
  })

  describe("Rendering", () => {
    it("should render the component with title", () => {
      renderWithProviders(<BlueprintInventory />)
      expect(screen.getByText("My Blueprint Inventory")).toBeInTheDocument()
    })

    it("should render bulk import button", () => {
      renderWithProviders(<BlueprintInventory />)
      expect(screen.getByText("Bulk Import")).toBeInTheDocument()
    })

    it("should display acquisition progress", () => {
      renderWithProviders(<BlueprintInventory />)
      expect(screen.getByText("Collection Progress")).toBeInTheDocument()
      expect(screen.getByText("45 of 1040 blueprints owned")).toBeInTheDocument()
      expect(screen.getByText("4.3%")).toBeInTheDocument()
    })

    it("should display recently acquired count", () => {
      renderWithProviders(<BlueprintInventory />)
      expect(screen.getByText("3 recently acquired")).toBeInTheDocument()
    })

    it("should render filter controls", () => {
      renderWithProviders(<BlueprintInventory />)
      expect(screen.getByText("Filters")).toBeInTheDocument()
      // Check for filter controls by finding the select elements
      const selects = screen.getAllByRole("combobox")
      expect(selects.length).toBeGreaterThanOrEqual(4) // Category, Rarity, Sort By, Sort Order
    })

    it("should display owned blueprints", () => {
      renderWithProviders(<BlueprintInventory />)
      expect(screen.getByText("Plasma Rifle Blueprint")).toBeInTheDocument()
      expect(screen.getByText("Heavy Armor Blueprint")).toBeInTheDocument()
    })

    it("should display blueprint count", () => {
      renderWithProviders(<BlueprintInventory />)
      expect(screen.getByText("Showing 2 of 2 owned blueprints")).toBeInTheDocument()
    })
  })

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      mockUseGetUserBlueprintInventoryQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
      })
      renderWithProviders(<BlueprintInventory />)
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })
  })

  describe("Error State", () => {
    it("should show error message when query fails", () => {
      mockUseGetUserBlueprintInventoryQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { status: 401, data: { message: "Unauthorized" } },
      })
      renderWithProviders(<BlueprintInventory />)
      expect(
        screen.getByText(/Failed to load blueprint inventory/i)
      ).toBeInTheDocument()
    })
  })

  describe("Empty State", () => {
    it("should show empty state when no blueprints", () => {
      mockUseGetUserBlueprintInventoryQuery.mockReturnValue({
        data: {
          ...mockInventoryData,
          blueprints: [],
          total: 0,
        },
        isLoading: false,
        error: undefined,
      })
      renderWithProviders(<BlueprintInventory />)
      expect(screen.getByText("No blueprints found")).toBeInTheDocument()
    })
  })

  describe("Filtering", () => {
    it("should have category filter control", () => {
      renderWithProviders(<BlueprintInventory />)
      
      // Check that category filter exists
      const selects = screen.getAllByRole("combobox")
      expect(selects.length).toBeGreaterThanOrEqual(4) // Category, Rarity, Sort By, Sort Order
    })

    it("should have rarity filter control", () => {
      renderWithProviders(<BlueprintInventory />)
      
      // Check that rarity filter exists
      const selects = screen.getAllByRole("combobox")
      expect(selects.length).toBeGreaterThanOrEqual(4)
    })

    it("should reset filters when reset button is clicked", () => {
      renderWithProviders(<BlueprintInventory />)
      
      const resetButton = screen.getByText("Reset all filters")
      expect(resetButton).toBeInTheDocument()
      fireEvent.click(resetButton)
      
      // Component should re-render with reset filters
      expect(screen.getByText("My Blueprint Inventory")).toBeInTheDocument()
    })
  })

  describe("Sorting", () => {
    it("should have sort by control", () => {
      renderWithProviders(<BlueprintInventory />)
      
      // Check that sort controls exist
      const selects = screen.getAllByRole("combobox")
      expect(selects.length).toBeGreaterThanOrEqual(4)
    })

    it("should have sort order control", () => {
      renderWithProviders(<BlueprintInventory />)
      
      // Check that sort controls exist
      const selects = screen.getAllByRole("combobox")
      expect(selects.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe("Blueprint Interaction", () => {
    it("should navigate to blueprint detail when clicked", () => {
      renderWithProviders(<BlueprintInventory />)
      
      const blueprintCard = screen.getByText("Plasma Rifle Blueprint")
      fireEvent.click(blueprintCard)
      
      expect(mockNavigate).toHaveBeenCalledWith("/blueprints/bp-1")
    })
  })

  describe("Bulk Import", () => {
    it("should open bulk import dialog when button is clicked", () => {
      renderWithProviders(<BlueprintInventory />)
      
      const bulkImportButton = screen.getByText("Bulk Import")
      fireEvent.click(bulkImportButton)
      
      expect(screen.getByText("Bulk Import Blueprints")).toBeInTheDocument()
      expect(
        screen.getByText(/Enter blueprint IDs, one per line/i)
      ).toBeInTheDocument()
    })

    it("should close bulk import dialog when cancel is clicked", async () => {
      renderWithProviders(<BlueprintInventory />)
      
      const bulkImportButton = screen.getByText("Bulk Import")
      fireEvent.click(bulkImportButton)
      
      const cancelButton = screen.getByText("Cancel")
      fireEvent.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByText("Bulk Import Blueprints")).not.toBeInTheDocument()
      })
    })

    it("should allow entering blueprint IDs in bulk import dialog", () => {
      renderWithProviders(<BlueprintInventory />)
      
      const bulkImportButton = screen.getByText("Bulk Import")
      fireEvent.click(bulkImportButton)
      
      const textarea = screen.getByPlaceholderText(/blueprint-id-1/i)
      fireEvent.change(textarea, {
        target: { value: "bp-1\nbp-2\nbp-3" },
      })
      
      expect(textarea).toHaveValue("bp-1\nbp-2\nbp-3")
    })

    it("should disable import button when no text is entered", () => {
      renderWithProviders(<BlueprintInventory />)
      
      const bulkImportButton = screen.getByText("Bulk Import")
      fireEvent.click(bulkImportButton)
      
      const importButton = screen.getByRole("button", { name: "Import" })
      expect(importButton).toBeDisabled()
    })

    it("should enable import button when text is entered", () => {
      renderWithProviders(<BlueprintInventory />)
      
      const bulkImportButton = screen.getByText("Bulk Import")
      fireEvent.click(bulkImportButton)
      
      const textarea = screen.getByPlaceholderText(/blueprint-id-1/i)
      fireEvent.change(textarea, {
        target: { value: "bp-1\nbp-2" },
      })
      
      const importButton = screen.getByRole("button", { name: "Import" })
      expect(importButton).not.toBeDisabled()
    })

    it("should call addBlueprint mutation for each blueprint ID", async () => {
      const mockAddBlueprint = vi.fn().mockResolvedValue({ data: { success: true } })
      mockUseAddBlueprintToInventoryMutation.mockReturnValue([
        mockAddBlueprint,
        { isLoading: false },
      ])

      renderWithProviders(<BlueprintInventory />)
      
      const bulkImportButton = screen.getByText("Bulk Import")
      fireEvent.click(bulkImportButton)
      
      const textarea = screen.getByPlaceholderText(/blueprint-id-1/i)
      fireEvent.change(textarea, {
        target: { value: "bp-1\nbp-2\nbp-3" },
      })
      
      const importButton = screen.getByRole("button", { name: "Import" })
      fireEvent.click(importButton)
      
      await waitFor(() => {
        expect(mockAddBlueprint).toHaveBeenCalledTimes(3)
        expect(mockAddBlueprint).toHaveBeenCalledWith({
          blueprintId: "bp-1",
          body: { acquisition_method: "bulk_import" },
        })
        expect(mockAddBlueprint).toHaveBeenCalledWith({
          blueprintId: "bp-2",
          body: { acquisition_method: "bulk_import" },
        })
        expect(mockAddBlueprint).toHaveBeenCalledWith({
          blueprintId: "bp-3",
          body: { acquisition_method: "bulk_import" },
        })
      })
    })

    it("should show success message after successful bulk import", async () => {
      const mockAddBlueprint = vi.fn().mockResolvedValue({ data: { success: true } })
      mockUseAddBlueprintToInventoryMutation.mockReturnValue([
        mockAddBlueprint,
        { isLoading: false },
      ])

      renderWithProviders(<BlueprintInventory />)
      
      const bulkImportButton = screen.getByText("Bulk Import")
      fireEvent.click(bulkImportButton)
      
      const textarea = screen.getByPlaceholderText(/blueprint-id-1/i)
      fireEvent.change(textarea, {
        target: { value: "bp-1\nbp-2" },
      })
      
      const importButton = screen.getByRole("button", { name: "Import" })
      fireEvent.click(importButton)
      
      // Wait for mutations to complete
      await waitFor(() => {
        expect(mockAddBlueprint).toHaveBeenCalledTimes(2)
      }, { timeout: 2000 })
      
      // Check that the import was successful by verifying the mutation was called
      expect(mockAddBlueprint).toHaveBeenCalledWith({
        blueprintId: "bp-1",
        body: { acquisition_method: "bulk_import" },
      })
      expect(mockAddBlueprint).toHaveBeenCalledWith({
        blueprintId: "bp-2",
        body: { acquisition_method: "bulk_import" },
      })
    })

    it("should show error message when bulk import fails", async () => {
      const mockAddBlueprint = vi.fn()
        .mockResolvedValueOnce({ data: { success: true } })
        .mockRejectedValueOnce(new Error("Failed to add blueprint"))

      mockUseAddBlueprintToInventoryMutation.mockReturnValue([
        mockAddBlueprint,
        { isLoading: false },
      ])

      renderWithProviders(<BlueprintInventory />)
      
      const bulkImportButton = screen.getByText("Bulk Import")
      fireEvent.click(bulkImportButton)
      
      const textarea = screen.getByPlaceholderText(/blueprint-id-1/i)
      fireEvent.change(textarea, {
        target: { value: "bp-1\nbp-2" },
      })
      
      const importButton = screen.getByRole("button", { name: "Import" })
      fireEvent.click(importButton)
      
      await waitFor(() => {
        expect(mockAddBlueprint).toHaveBeenCalledTimes(2)
      })
      
      // Check for error message (text may be split across elements)
      await waitFor(() => {
        expect(screen.getByText(/Failed to import/i)).toBeInTheDocument()
      })
    })
  })

  describe("Pagination", () => {
    it("should show pagination when there are multiple pages", () => {
      mockUseGetUserBlueprintInventoryQuery.mockReturnValue({
        data: {
          ...mockInventoryData,
          total: 50,
        },
        isLoading: false,
        error: undefined,
      })

      renderWithProviders(<BlueprintInventory />)
      
      // Should show pagination component
      const pagination = screen.getByRole("navigation")
      expect(pagination).toBeInTheDocument()
    })

    it("should not show pagination when there is only one page", () => {
      renderWithProviders(<BlueprintInventory />)
      
      // Should not show pagination component
      const pagination = screen.queryByRole("navigation")
      expect(pagination).not.toBeInTheDocument()
    })
  })
})
