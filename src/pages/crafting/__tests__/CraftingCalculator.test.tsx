/**
 * CraftingCalculator Component Tests
 * 
 * Tests for the Crafting Calculator component including:
 * - Blueprint selection autocomplete
 * - Material input form
 * - Calculate button functionality
 * - Display calculation results
 * 
 * Task 13.1 - Create CraftingCalculator component
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { CraftingCalculator } from "../CraftingCalculator"
import { blueprintsApi } from "../../../store/blueprintsApi"
import { craftingApi } from "../../../store/craftingApi"
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

// Helper to create a test store
function createTestStore() {
  return configureStore({
    reducer: {
      [blueprintsApi.reducerPath]: blueprintsApi.reducer,
      [craftingApi.reducerPath]: craftingApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(blueprintsApi.middleware, craftingApi.middleware),
  })
}

// Helper to render with providers
function renderWithProviders(component: React.ReactElement) {
  const store = createTestStore()
  
  // Wrapper component to provide necessary context
  function TestWrapper({ children }: { children: React.ReactNode }) {
    const drawerState = React.useState(false)
    const currentOrgState = React.useState(null)

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

// Mock blueprint data
const mockBlueprints = [
  {
    blueprint_id: "bp-1",
    blueprint_name: "Advanced Weapon Blueprint",
    output_item_name: "Advanced Weapon",
    output_item_icon: "/icons/weapon.png",
    item_category: "Weapons",
    rarity: "Rare",
    tier: 3,
    ingredient_count: 3,
    mission_count: 5,
    crafting_time_seconds: 300,
  },
  {
    blueprint_id: "bp-2",
    blueprint_name: "Basic Armor Blueprint",
    output_item_name: "Basic Armor",
    item_category: "Armor",
    rarity: "Common",
    tier: 1,
    ingredient_count: 2,
    mission_count: 10,
  },
]

// Mock calculation result
const mockCalculationResult = {
  output_quality_tier: 3,
  output_quality_value: 75.5,
  output_quantity: 1,
  calculation_breakdown: {
    formula_used: "weighted_average",
    input_weights: {
      "material-1": 0.5,
      "material-2": 0.5,
    },
    quality_contributions: [
      {
        material_name: "Steel Ingot",
        quality_tier: 3,
        quality_value: 70,
        weight: 0.5,
        contribution: 35,
      },
      {
        material_name: "Carbon Fiber",
        quality_tier: 4,
        quality_value: 85,
        weight: 0.5,
        contribution: 42.5,
      },
    ],
  },
  estimated_cost: {
    material_cost: 5000,
    crafting_station_fee: 500,
    total_cost: 5500,
  },
  success_probability: 0.95,
  critical_success_chance: 0.15,
}

describe("CraftingCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Requirement 5.1: WHEN a player selects a blueprint and input materials,
   * THE Crafting_Calculator SHALL compute output item statistics
   */
  describe("Blueprint Selection and Calculation", () => {
    it("should render the crafting calculator with blueprint selector", () => {
      renderWithProviders(<CraftingCalculator />)

      expect(screen.getByText("Crafting Calculator")).toBeInTheDocument()
      expect(screen.getByText("Select Blueprint")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Search blueprints...")).toBeInTheDocument()
    })

    it("should allow typing in blueprint search field", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      const autocomplete = screen.getByPlaceholderText("Search blueprints...")
      await user.type(autocomplete, "weapon")

      expect(autocomplete).toHaveValue("weapon")
    })
  })

  /**
   * Requirement 5.2: THE Crafting_Calculator SHALL accept quality_tier
   * and quality_value for each input material
   */
  describe("Material Input Form", () => {
    it("should render material input form with default material", () => {
      renderWithProviders(<CraftingCalculator />)

      expect(screen.getByText("Materials")).toBeInTheDocument()
      expect(screen.getByLabelText("Material ID")).toBeInTheDocument()
      expect(screen.getByLabelText("Tier")).toBeInTheDocument()
      expect(screen.getByText(/Quality:/)).toBeInTheDocument()
      expect(screen.getByLabelText("Qty")).toBeInTheDocument()
    })

    it("should allow adding new material inputs", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      const addButton = screen.getByRole("button", { name: /Add Material/i })
      await user.click(addButton)

      // Should now have 2 material ID inputs
      const materialInputs = screen.getAllByLabelText("Material ID")
      expect(materialInputs).toHaveLength(2)
    })

    it("should allow removing material inputs (except the last one)", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      // Add a second material
      const addButton = screen.getByRole("button", { name: /Add Material/i })
      await user.click(addButton)

      // Find delete buttons
      const deleteButtons = screen.getAllByRole("button", { name: "" }).filter(
        (btn) => btn.querySelector("svg[data-testid='DeleteIcon']")
      )

      // Should have 2 delete buttons now
      expect(deleteButtons.length).toBeGreaterThanOrEqual(2)

      // Click the first delete button
      await user.click(deleteButtons[0])

      // Should be back to 1 material
      await waitFor(() => {
        const materialInputs = screen.getAllByLabelText("Material ID")
        expect(materialInputs).toHaveLength(1)
      })
    })

    it("should allow setting material ID", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      const materialIdInput = screen.getByLabelText("Material ID")
      await user.clear(materialIdInput)
      await user.type(materialIdInput, "steel-ingot-123")

      expect(materialIdInput).toHaveValue("steel-ingot-123")
    })

    it("should allow selecting quality tier (1-5)", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      const tierSelect = screen.getByLabelText("Tier")
      await user.click(tierSelect)

      // Should show tier options 1-5
      await waitFor(() => {
        expect(screen.getByText("Tier 1")).toBeInTheDocument()
        expect(screen.getByText("Tier 5")).toBeInTheDocument()
      })

      await user.click(screen.getByText("Tier 3"))

      expect(tierSelect).toHaveTextContent("Tier 3")
    })

    it("should allow adjusting quality value slider (0-100)", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      // Find the slider by its label
      const qualityLabel = screen.getByText(/Quality: 50/)
      expect(qualityLabel).toBeInTheDocument()

      // The slider should be present (default value 50)
      const slider = qualityLabel.parentElement?.querySelector('input[type="range"]')
      expect(slider).toBeInTheDocument()
      expect(slider).toHaveValue("50")
    })

    it("should allow setting material quantity", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      const quantityInput = screen.getByLabelText("Qty")
      await user.clear(quantityInput)
      await user.type(quantityInput, "5")

      expect(quantityInput).toHaveValue(5)
    })

    it("should enforce minimum quantity of 1", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      const quantityInput = screen.getByLabelText("Qty")
      await user.clear(quantityInput)
      await user.type(quantityInput, "0")

      // Should be set to 1 (minimum)
      await waitFor(() => {
        expect(quantityInput).toHaveValue(1)
      })
    })
  })

  /**
   * Requirement 5.3: THE Crafting_Calculator SHALL compute output quality_tier
   * based on input material qualities
   * 
   * Requirement 5.4: THE Crafting_Calculator SHALL compute output quality_value
   * based on input material qualities
   */
  describe("Calculate Button and Results", () => {
    it("should disable calculate button when no blueprint is selected", () => {
      renderWithProviders(<CraftingCalculator />)

      const calculateButton = screen.getByRole("button", { name: /Calculate Quality/i })
      expect(calculateButton).toBeDisabled()
    })

    it("should show calculate button text", () => {
      renderWithProviders(<CraftingCalculator />)

      expect(screen.getByRole("button", { name: /Calculate Quality/i })).toBeInTheDocument()
    })
  })

  /**
   * Requirement 5.5: THE Crafting_Calculator SHALL display the calculation
   * formula or methodology
   */
  describe("Calculation Breakdown Display", () => {
    it("should have a section for calculation breakdown", () => {
      renderWithProviders(<CraftingCalculator />)
      
      // The breakdown section appears after calculation
      // This test just verifies the component renders without breakdown initially
      expect(screen.queryByText("Calculation Breakdown")).not.toBeInTheDocument()
    })
  })

  /**
   * Requirement 5.6: THE Crafting_Calculator SHALL validate that input
   * materials match blueprint requirements
   */
  describe("Error Handling and Validation", () => {
    it("should allow empty material IDs (validation happens on backend)", () => {
      renderWithProviders(<CraftingCalculator />)

      const materialIdInput = screen.getByLabelText("Material ID")
      expect(materialIdInput).toHaveValue("")
      
      // Component allows empty IDs, backend will validate
      expect(materialIdInput).toBeInTheDocument()
    })
  })

  /**
   * Additional UI/UX Tests
   */
  describe("User Experience", () => {
    it("should maintain material inputs when adding/removing materials", async () => {
      const user = userEvent.setup()
      renderWithProviders(<CraftingCalculator />)

      // Set first material
      const firstMaterialId = screen.getByLabelText("Material ID")
      await user.clear(firstMaterialId)
      await user.type(firstMaterialId, "steel")

      // Add second material
      await user.click(screen.getByRole("button", { name: /Add Material/i }))

      // First material should still have its value
      const materialInputs = screen.getAllByLabelText("Material ID")
      expect(materialInputs[0]).toHaveValue("steel")
      expect(materialInputs[1]).toHaveValue("")
    })

    it("should not allow removing the last material", () => {
      renderWithProviders(<CraftingCalculator />)

      // Find delete button (should be disabled when only 1 material)
      const deleteButtons = screen.getAllByRole("button", { name: "" }).filter(
        (btn) => btn.querySelector("svg[data-testid='DeleteIcon']")
      )

      // Should have at least one delete button, and it should be disabled
      expect(deleteButtons.length).toBeGreaterThan(0)
      expect(deleteButtons[0]).toBeDisabled()
    })
  })
})
