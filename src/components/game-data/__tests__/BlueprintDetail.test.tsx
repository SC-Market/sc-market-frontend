/**
 * BlueprintDetail Component Tests
 * 
 * Tests for the BlueprintDetail component covering:
 * - Blueprint information display
 * - Ingredient list rendering
 * - Quality requirements display
 * - Market pricing calculations
 * - Mission rewards display
 * - User inventory status
 * - Alternative ingredients
 * - Grouped ingredients by category
 * 
 * Task 12.3 - Create BlueprintDetail component tests
 * Requirements: 50.1-50.10
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { BlueprintDetail } from "../BlueprintDetail"
import { marketV2Api } from "../../../store/api/v2/market"

// Mock data
const mockBlueprintDetail = {
  blueprint: {
    blueprint_id: "test-blueprint-id",
    version_id: "version-1",
    blueprint_code: "BP_TEST_001",
    blueprint_name: "Test Blueprint",
    blueprint_description: "A test blueprint for crafting",
    output_game_item_id: "item-1",
    output_quantity: 1,
    item_category: "Weapons",
    item_subcategory: "Rifles",
    rarity: "Rare",
    tier: 3,
    crafting_station_type: "Workbench",
    crafting_time_seconds: 300,
    required_skill_level: 5,
    icon_url: "https://example.com/blueprint.png",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  output_item: {
    game_item_id: "item-1",
    name: "Test Rifle",
    type: "Weapon",
    icon_url: "https://example.com/rifle.png",
  },
  ingredients: [
    {
      ingredient_id: "ing-1",
      game_item: {
        game_item_id: "mat-1",
        name: "Steel Ingot",
        type: "Metal",
        icon_url: "https://example.com/steel.png",
      },
      quantity_required: 10,
      min_quality_tier: 2,
      recommended_quality_tier: 3,
      is_alternative: false,
      alternative_group: undefined,
      market_price_min: 100,
      market_price_max: 150,
      user_inventory_quantity: 5,
    },
    {
      ingredient_id: "ing-2",
      game_item: {
        game_item_id: "mat-2",
        name: "Polymer",
        type: "Component",
        icon_url: "https://example.com/polymer.png",
      },
      quantity_required: 5,
      min_quality_tier: undefined,
      recommended_quality_tier: undefined,
      is_alternative: false,
      alternative_group: undefined,
      market_price_min: 200,
      market_price_max: 250,
      user_inventory_quantity: 10,
    },
    {
      ingredient_id: "ing-3",
      game_item: {
        game_item_id: "mat-3",
        name: "Copper Wire",
        type: "Metal",
        icon_url: "https://example.com/copper.png",
      },
      quantity_required: 20,
      min_quality_tier: 1,
      recommended_quality_tier: 2,
      is_alternative: true,
      alternative_group: 1,
      market_price_min: 50,
      market_price_max: 75,
      user_inventory_quantity: 0,
    },
  ],
  missions_rewarding: [
    {
      mission_id: "mission-1",
      mission_name: "Test Mission Alpha",
      drop_probability: 25.5,
      star_system: "Stanton",
    },
    {
      mission_id: "mission-2",
      mission_name: "Test Mission Beta",
      drop_probability: 15.0,
      star_system: "Pyro",
    },
  ],
  crafting_recipe: {
    quality_calculation_type: "weighted_average",
    min_output_quality_tier: 1,
    max_output_quality_tier: 5,
  },
  user_owns: true,
  user_acquisition: {
    acquisition_date: "2024-01-10T00:00:00Z",
    acquisition_method: "Mission Reward",
    acquisition_location: "Stanton System",
    acquisition_notes: "Acquired from Test Mission Alpha",
  },
}

// Create mock store with query state
const createMockStore = (mockData: any, isLoading = false, error: any = null) => {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: () => ({
        queries: {
          'getBlueprintDetail({"blueprintId":"test-blueprint-id"})': {
            status: isLoading ? "pending" : error ? "rejected" : "fulfilled",
            data: mockData,
            error,
          },
        },
      }),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
  })
}

// Helper to render component with providers
function renderWithProviders(mockData: any, isLoading = false, error: any = null) {
  const store = createMockStore(mockData, isLoading, error)
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/blueprints/test-blueprint-id"]}>
        <Routes>
          <Route path="/blueprints/:blueprintId" element={<BlueprintDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe("BlueprintDetail", () => {
  describe("Loading and Error States", () => {
    it("should display loading spinner while fetching data", () => {
      renderWithProviders(null, true)

      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })

    it("should display error message when fetch fails", () => {
      renderWithProviders(null, false, { message: "Server error" })

      expect(screen.getByText(/failed to load blueprint details/i)).toBeInTheDocument()
    })
  })

  describe("Blueprint Information Display", () => {

    it("should display blueprint name and description", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Test Blueprint")).toBeInTheDocument()
      expect(screen.getByText("A test blueprint for crafting")).toBeInTheDocument()
    })

    it("should display blueprint badges (rarity, tier, category)", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Rare")).toBeInTheDocument()
      expect(screen.getByText("Tier 3")).toBeInTheDocument()
      expect(screen.getByText("Weapons")).toBeInTheDocument()
      expect(screen.getByText("Rifles")).toBeInTheDocument()
    })

    it("should display owned badge when user owns blueprint", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("✓ Owned")).toBeInTheDocument()
    })

    it("should display output item information", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Test Rifle")).toBeInTheDocument()
      expect(screen.getByText("Crafts")).toBeInTheDocument()
    })

    it("should display crafting station type", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Crafting Station")).toBeInTheDocument()
      expect(screen.getByText("Workbench")).toBeInTheDocument()
    })

    it("should display formatted crafting time", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Crafting Time")).toBeInTheDocument()
      expect(screen.getByText("5m")).toBeInTheDocument()
    })

    it("should display required skill level", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Required Skill Level")).toBeInTheDocument()
      expect(screen.getByText("5")).toBeInTheDocument()
    })
  })

  describe("User Acquisition Information", () => {
    it("should display acquisition information when user owns blueprint", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Acquisition Information")).toBeInTheDocument()
      expect(screen.getByText("Mission Reward")).toBeInTheDocument()
      expect(screen.getByText("Stanton System")).toBeInTheDocument()
      expect(screen.getByText("Acquired from Test Mission Alpha")).toBeInTheDocument()
    })

    it("should not display acquisition section when user doesn't own blueprint", () => {
      const dataWithoutOwnership = {
        ...mockBlueprintDetail,
        user_owns: false,
        user_acquisition: undefined,
      }

      renderWithProviders(dataWithoutOwnership)

      expect(screen.queryByText("Acquisition Information")).not.toBeInTheDocument()
    })
  })

  describe("Ingredients Display (Requirements 50.1-50.10)", () => {

    it("should display total ingredient count (Requirement 50.7)", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText(/Ingredients \(3\)/i)).toBeInTheDocument()
    })

    it("should display ingredient names (Requirement 50.1)", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Steel Ingot")).toBeInTheDocument()
      expect(screen.getByText("Polymer")).toBeInTheDocument()
      expect(screen.getByText("Copper Wire")).toBeInTheDocument()
    })

    it("should display required quantities (Requirement 50.2)", () => {
      renderWithProviders(mockBlueprintDetail)

      const quantityCells = screen.getAllByRole("cell").filter(cell => 
        cell.textContent === "10" || cell.textContent === "5" || cell.textContent === "20"
      )
      expect(quantityCells.length).toBeGreaterThan(0)
    })

    it("should display quality requirements (Requirement 50.3)", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Min: T2")).toBeInTheDocument()
      expect(screen.getByText("Rec: T3")).toBeInTheDocument()
    })

    it("should display 'Any' for ingredients without quality requirements", () => {
      renderWithProviders(mockBlueprintDetail)

      const anyCells = screen.getAllByText("Any")
      expect(anyCells.length).toBeGreaterThan(0)
    })

    it("should display ingredient icons (Requirement 50.5)", () => {
      renderWithProviders(mockBlueprintDetail)

      const images = screen.getAllByRole("img")
      const steelIcon = images.find(img => img.getAttribute("alt") === "Steel Ingot")
      const polymerIcon = images.find(img => img.getAttribute("alt") === "Polymer")
      const copperIcon = images.find(img => img.getAttribute("alt") === "Copper Wire")

      expect(steelIcon).toBeInTheDocument()
      expect(polymerIcon).toBeInTheDocument()
      expect(copperIcon).toBeInTheDocument()
    })

    it("should highlight ingredients player doesn't have (Requirement 50.4)", () => {
      renderWithProviders(mockBlueprintDetail)

      // Copper Wire has 0 inventory, should be highlighted
      const rows = screen.getAllByRole("row")
      const copperRow = rows.find(row => row.textContent?.includes("Copper Wire"))
      
      expect(copperRow).toBeDefined()
      // Check for error styling (bgcolor: error.dark)
      expect(copperRow).toHaveStyle({ opacity: "0.9" })
    })

    it("should group ingredients by category (Requirement 50.8)", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Metal")).toBeInTheDocument()
      expect(screen.getByText("Component")).toBeInTheDocument()
    })

    it("should display alternative ingredient indicators (Requirement 50.9)", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Alt 1")).toBeInTheDocument()
    })

    it("should display alternative ingredients info message (Requirement 50.9)", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText(/alternative ingredients/i)).toBeInTheDocument()
      expect(screen.getByText(/can be substituted/i)).toBeInTheDocument()
    })

    it("should calculate and display total material cost (Requirement 50.10)", () => {
      renderWithProviders(mockBlueprintDetail)

      // Steel: (100+150)/2 * 10 = 1250
      // Polymer: (200+250)/2 * 5 = 1125
      // Copper: (50+75)/2 * 20 = 1250
      // Total: 3625
      expect(screen.getByText("Est. Total Cost")).toBeInTheDocument()
      expect(screen.getByText("3,625 aUEC")).toBeInTheDocument()
    })

    it("should display market prices for ingredients", () => {
      renderWithProviders(mockBlueprintDetail)

      // Check for price columns
      expect(screen.getByText("Unit Price")).toBeInTheDocument()
      expect(screen.getByText("Total Cost")).toBeInTheDocument()
    })

    it("should display inventory status for each ingredient", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("5/10")).toBeInTheDocument() // Steel: 5 out of 10
      expect(screen.getByText("10/5")).toBeInTheDocument() // Polymer: 10 out of 5 (has enough)
      expect(screen.getByText("0")).toBeInTheDocument() // Copper: 0
    })
  })

  describe("Crafting Recipe Display", () => {
    it("should display crafting recipe information", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Crafting Recipe")).toBeInTheDocument()
      expect(screen.getByText("weighted_average")).toBeInTheDocument()
      expect(screen.getByText("Tier 1")).toBeInTheDocument()
      expect(screen.getByText("Tier 5")).toBeInTheDocument()
    })

    it("should not display crafting recipe section when not available", () => {
      const dataWithoutRecipe = {
        ...mockBlueprintDetail,
        crafting_recipe: undefined,
      }

      renderWithProviders(dataWithoutRecipe)

      expect(screen.queryByText("Crafting Recipe")).not.toBeInTheDocument()
    })
  })

  describe("Missions Rewarding Blueprint", () => {
    it("should display missions that reward this blueprint", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText(/Missions Rewarding This Blueprint \(2\)/i)).toBeInTheDocument()
      expect(screen.getByText("Test Mission Alpha")).toBeInTheDocument()
      expect(screen.getByText("Test Mission Beta")).toBeInTheDocument()
    })

    it("should display mission locations", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Stanton")).toBeInTheDocument()
      expect(screen.getByText("Pyro")).toBeInTheDocument()
    })

    it("should display drop probabilities", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("25.5% chance")).toBeInTheDocument()
      expect(screen.getByText("15.0% chance")).toBeInTheDocument()
    })

    it("should not display missions section when no missions reward blueprint", () => {
      const dataWithoutMissions = {
        ...mockBlueprintDetail,
        missions_rewarding: [],
      }

      renderWithProviders(dataWithoutMissions)

      expect(screen.queryByText(/Missions Rewarding This Blueprint/i)).not.toBeInTheDocument()
    })
  })

  describe("Blueprint Metadata", () => {
    it("should display blueprint code", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Blueprint Code")).toBeInTheDocument()
      expect(screen.getByText("BP_TEST_001")).toBeInTheDocument()
    })

    it("should display blueprint status", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Status")).toBeInTheDocument()
      expect(screen.getByText("Active")).toBeInTheDocument()
    })

    it("should display last updated date", () => {
      renderWithProviders(mockBlueprintDetail)

      expect(screen.getByText("Last Updated")).toBeInTheDocument()
    })
  })

  describe("Crafting Time Formatting", () => {
    it("should format seconds correctly", () => {
      const data = {
        ...mockBlueprintDetail,
        blueprint: {
          ...mockBlueprintDetail.blueprint,
          crafting_time_seconds: 45,
        },
      }

      renderWithProviders(data)

      expect(screen.getByText("45s")).toBeInTheDocument()
    })

    it("should format minutes and seconds correctly", () => {
      const data = {
        ...mockBlueprintDetail,
        blueprint: {
          ...mockBlueprintDetail.blueprint,
          crafting_time_seconds: 125,
        },
      }

      renderWithProviders(data)

      expect(screen.getByText("2m 5s")).toBeInTheDocument()
    })

    it("should format hours and minutes correctly", () => {
      const data = {
        ...mockBlueprintDetail,
        blueprint: {
          ...mockBlueprintDetail.blueprint,
          crafting_time_seconds: 3720, // 1 hour 2 minutes
        },
      }

      renderWithProviders(data)

      expect(screen.getByText("1h 2m")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle blueprint with no ingredients", () => {
      const dataWithoutIngredients = {
        ...mockBlueprintDetail,
        ingredients: [],
      }

      renderWithProviders(dataWithoutIngredients)

      expect(screen.getByText(/Ingredients \(0\)/i)).toBeInTheDocument()
    })

    it("should handle ingredients without market prices", () => {
      const dataWithoutPrices = {
        ...mockBlueprintDetail,
        ingredients: [
          {
            ...mockBlueprintDetail.ingredients[0],
            market_price_min: undefined,
            market_price_max: undefined,
          },
        ],
      }

      renderWithProviders(dataWithoutPrices)

      const naCells = screen.getAllByText("N/A")
      expect(naCells.length).toBeGreaterThan(0)
    })

    it("should handle blueprint with multiple output quantity", () => {
      const dataWithMultipleOutput = {
        ...mockBlueprintDetail,
        blueprint: {
          ...mockBlueprintDetail.blueprint,
          output_quantity: 5,
        },
      }

      renderWithProviders(dataWithMultipleOutput)

      expect(screen.getByText("5x Test Rifle")).toBeInTheDocument()
    })

    it("should handle blueprint without description", () => {
      const dataWithoutDescription = {
        ...mockBlueprintDetail,
        blueprint: {
          ...mockBlueprintDetail.blueprint,
          blueprint_description: undefined,
        },
      }

      renderWithProviders(dataWithoutDescription)

      expect(screen.queryByText("A test blueprint for crafting")).not.toBeInTheDocument()
    })
  })
})
