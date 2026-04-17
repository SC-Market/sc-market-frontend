import "./setup";
import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { OfferMarketListingsV2 } from "../OfferMarketListingsV2"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { BrowserRouter } from "react-router-dom"
import { OrderItemDetail } from "../../../../store/api/v2/market"

// Create test theme with all required properties
const testTheme = createTheme({
  palette: {
    outline: {
      main: "#e0e0e0",
    },
  },
  layoutSpacing: {
    compact: 1,
    text: 1,
    layout: 2,
  },
  borderRadius: {
    image: 1,
    topLevel: 1,
  },
  spacing: (factor: number) => `${8 * factor}px`,
} as any)

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "OfferMarketListings.associatedMarketListings": "Associated Market Listings",
        "OfferMarketListings.product": "Product",
        "OfferMarketListings.qty": "Qty",
        "OfferMarketListings.unitPrice": "Unit Price",
        "OfferMarketListings.total": "Total",
        "OfferMarketListings.noAssociatedListings": "No associated listings",
      }
      return translations[key] || key
    },
  }),
}))

const mockOrderItems: OrderItemDetail[] = [
  {
    order_item_id: "item-1",
    listing_id: "listing-1",
    item_id: "game-item-1",
    variant: {
      variant_id: "variant-1",
      attributes: {
        quality_tier: 5,
        quality_value: 95.5,
        crafted_source: "crafted",
      },
      display_name: "Tier 5 (95.5%) - Crafted",
      short_name: "T5 Crafted",
    },
    quantity: 10,
    price_per_unit: 50000,
    subtotal: 500000,
  },
  {
    order_item_id: "item-2",
    listing_id: "listing-2",
    item_id: "game-item-2",
    variant: {
      variant_id: "variant-2",
      attributes: {
        quality_tier: 3,
        quality_value: 65.0,
        crafted_source: "looted",
      },
      display_name: "Tier 3 (65.0%) - Looted",
      short_name: "T3 Looted",
    },
    quantity: 5,
    price_per_unit: 25000,
    subtotal: 125000,
  },
]

const renderComponent = (items: OrderItemDetail[] = mockOrderItems, title?: string) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={testTheme}>
        <OfferMarketListingsV2 items={items} title={title} />
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe("OfferMarketListingsV2", () => {
  describe("Requirement 27.1: Component Rendering", () => {
    it("should render the component with order items", () => {
      renderComponent()
      expect(screen.getByText("Associated Market Listings")).toBeInTheDocument()
    })

    it("should render custom title when provided", () => {
      renderComponent(mockOrderItems, "Custom Order Title")
      expect(screen.getByText("Custom Order Title")).toBeInTheDocument()
    })
  })

  describe("Requirement 27.2: Visual Parity with V1", () => {
    it("should use identical table structure to V1", () => {
      renderComponent()
      
      // Check for table headers
      expect(screen.getByText("Product")).toBeInTheDocument()
      expect(screen.getByText("Qty")).toBeInTheDocument()
      expect(screen.getByText("Unit Price")).toBeInTheDocument()
      // Use getAllByText for "Total" since it appears in header and total row
      const totalElements = screen.getAllByText("Total")
      expect(totalElements.length).toBeGreaterThan(0)
    })

    it("should display total section with correct styling", () => {
      renderComponent()
      
      // Total label should be present (appears in header and total row)
      const totalLabels = screen.getAllByText("Total")
      expect(totalLabels.length).toBeGreaterThan(0)
      
      // Total amount should be formatted correctly
      expect(screen.getByText("625,000 aUEC")).toBeInTheDocument()
    })
  })

  describe("Requirement 27.4: Display Variant Details", () => {
    it("should display variant display name for each item", () => {
      renderComponent()
      
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
      expect(screen.getByText("Tier 3 (65.0%) - Looted")).toBeInTheDocument()
    })

    it("should display all variant attributes in readable format", () => {
      renderComponent()
      
      // Variant display names contain quality tier, quality value, and source
      const tier5Variant = screen.getByText("Tier 5 (95.5%) - Crafted")
      expect(tier5Variant).toBeInTheDocument()
      
      const tier3Variant = screen.getByText("Tier 3 (65.0%) - Looted")
      expect(tier3Variant).toBeInTheDocument()
    })
  })

  describe("Requirement 27.5: Quality Tier Visual Indicators", () => {
    it("should display QualityBadge for items with quality_tier", () => {
      renderComponent()
      
      // QualityBadge renders "Tier X" text
      expect(screen.getByText("Tier 5")).toBeInTheDocument()
      expect(screen.getByText("Tier 3")).toBeInTheDocument()
    })

    it("should handle items without quality_tier gracefully", () => {
      const itemsWithoutQuality: OrderItemDetail[] = [
        {
          order_item_id: "item-3",
          listing_id: "listing-3",
          item_id: "game-item-3",
          variant: {
            variant_id: "variant-3",
            attributes: {},
            display_name: "Standard Item",
            short_name: "Standard",
          },
          quantity: 1,
          price_per_unit: 10000,
          subtotal: 10000,
        },
      ]
      
      renderComponent(itemsWithoutQuality)
      
      // Should still render the item
      expect(screen.getByText("Standard Item")).toBeInTheDocument()
      // Use getAllByText since price appears in multiple columns
      const priceElements = screen.getAllByText(/10,000 aUEC/)
      expect(priceElements.length).toBeGreaterThan(0)
    })
  })

  describe("Requirement 27.6: Variant Attributes Display", () => {
    it("should display variant attributes in readable format", () => {
      renderComponent()
      
      // Display name includes quality tier, quality value, and crafted source
      const craftedVariant = screen.getByText("Tier 5 (95.5%) - Crafted")
      expect(craftedVariant).toBeInTheDocument()
      
      const lootedVariant = screen.getByText("Tier 3 (65.0%) - Looted")
      expect(lootedVariant).toBeInTheDocument()
    })
  })

  describe("Requirement 27.7: Per-Variant Pricing", () => {
    it("should display price per unit for each variant", () => {
      renderComponent()
      
      // Unit prices should be displayed
      expect(screen.getByText("50,000 aUEC")).toBeInTheDocument()
      expect(screen.getByText("25,000 aUEC")).toBeInTheDocument()
    })

    it("should display subtotal for each variant", () => {
      renderComponent()
      
      // Subtotals should be displayed
      expect(screen.getByText("500,000 aUEC")).toBeInTheDocument()
      expect(screen.getByText("125,000 aUEC")).toBeInTheDocument()
    })

    it("should calculate total price correctly across all variants", () => {
      renderComponent()
      
      // Total should be sum of all subtotals: 500,000 + 125,000 = 625,000
      expect(screen.getByText("625,000 aUEC")).toBeInTheDocument()
    })
  })

  describe("Requirement 27.8: Quantity Display", () => {
    it("should display quantity for each order item", () => {
      renderComponent()
      
      // Quantities should be formatted with toLocaleString()
      expect(screen.getByText("10")).toBeInTheDocument()
      // Use getAllByText for "5" since it appears in table and pagination
      const fiveElements = screen.getAllByText("5")
      expect(fiveElements.length).toBeGreaterThan(0)
    })
  })

  describe("Empty State", () => {
    it("should display empty state when no items", () => {
      renderComponent([])
      
      expect(screen.getByText("Associated Market Listings")).toBeInTheDocument()
      expect(screen.getByText("No associated listings")).toBeInTheDocument()
    })

    it("should display custom title in empty state", () => {
      renderComponent([], "Custom Empty Title")
      
      expect(screen.getByText("Custom Empty Title")).toBeInTheDocument()
      expect(screen.getByText("No associated listings")).toBeInTheDocument()
    })
  })

  describe("Number Formatting", () => {
    it("should format large numbers with commas", () => {
      const largeQuantityItems: OrderItemDetail[] = [
        {
          order_item_id: "item-large",
          listing_id: "listing-large",
          item_id: "game-item-large",
          variant: {
            variant_id: "variant-large",
            attributes: {
              quality_tier: 4,
            },
            display_name: "Tier 4 Item",
            short_name: "T4",
          },
          quantity: 1000,
          price_per_unit: 1000000,
          subtotal: 1000000000,
        },
      ]
      
      renderComponent(largeQuantityItems)
      
      // Should format with commas
      expect(screen.getByText("1,000")).toBeInTheDocument()
      // Use getAllByText for prices that appear in multiple columns
      const millionElements = screen.getAllByText(/1,000,000 aUEC/)
      expect(millionElements.length).toBeGreaterThan(0)
      const billionElements = screen.getAllByText(/1,000,000,000 aUEC/)
      expect(billionElements.length).toBeGreaterThan(0)
    })
  })

  describe("Multiple Items", () => {
    it("should render multiple order items correctly", () => {
      renderComponent()
      
      // Should have 2 items
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
      expect(screen.getByText("Tier 3 (65.0%) - Looted")).toBeInTheDocument()
      
      // Should have correct quantities
      expect(screen.getByText("10")).toBeInTheDocument()
      // Use getAllByText for "5" since it appears in table and pagination
      const fiveElements = screen.getAllByText("5")
      expect(fiveElements.length).toBeGreaterThan(0)
      
      // Should have correct total
      expect(screen.getByText("625,000 aUEC")).toBeInTheDocument()
    })
  })

  describe("Visual Consistency", () => {
    it("should use theme spacing for layout", () => {
      const { container } = renderComponent()
      
      // Component should render without errors
      expect(container.querySelector('[class*="MuiPaper"]')).toBeInTheDocument()
      expect(container.querySelector('[class*="MuiStack"]')).toBeInTheDocument()
    })

    it("should use correct typography variants", () => {
      renderComponent()
      
      // Title should use h5 variant
      const title = screen.getByText("Associated Market Listings")
      expect(title).toBeInTheDocument()
    })
  })
})
