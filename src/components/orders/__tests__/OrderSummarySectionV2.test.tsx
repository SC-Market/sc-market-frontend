import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { OrderSummarySectionV2 } from "../OrderSummarySectionV2"
import { OrderItemDetail } from "../../../store/api/v2/market"
import { OfferChanges } from "../../../util/offerChanges"

// Mock i18next
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultValue?: string) => defaultValue || key,
    }),
  }
})

describe("OrderSummarySectionV2", () => {
  const mockItems: OrderItemDetail[] = [
    {
    order_item_id: "item-1",
    listing_id: "listing-1",
    listing_title: "Test Listing 1",
      item_id: "item-1",
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
      quantity: 2,
      price_per_unit: 1000,
      subtotal: 2000,
    },
    {
    order_item_id: "item-2",
    listing_id: "listing-2",
    listing_title: "Test Listing 2",
      item_id: "item-2",
      variant: {
        variant_id: "variant-2",
        attributes: {
          quality_tier: 3,
          quality_value: 75.0,
          crafted_source: "store",
        },
        display_name: "Tier 3 (75.0%) - Store",
        short_name: "T3 Store",
      },
      quantity: 1,
      price_per_unit: 500,
      subtotal: 500,
    },
  ]

  it("renders order summary with item details", () => {
    render(
      <OrderSummarySectionV2 items={mockItems} total_cost={2500} />
    )

    // Check title
    expect(screen.getByText("Order Summary")).toBeInTheDocument()

    // Check listing titles
    expect(screen.getByText("Test Listing 1")).toBeInTheDocument()
    expect(screen.getByText("Test Listing 2")).toBeInTheDocument()

    // Check quantities and prices
    expect(screen.getByText(/1,000 aUEC × 2/)).toBeInTheDocument()
    expect(screen.getByText(/500 aUEC × 1/)).toBeInTheDocument()

    // Check subtotals
    expect(screen.getByText("2,000 aUEC")).toBeInTheDocument()
    expect(screen.getByText("500 aUEC")).toBeInTheDocument()

    // Check total
    expect(screen.getByText("Total")).toBeInTheDocument()
    expect(screen.getByText(/2,500/)).toBeInTheDocument()
  })

  it("displays listing titles", () => {
    render(
      <OrderSummarySectionV2 items={mockItems} total_cost={2500} />
    )

    // Listing titles should be rendered
    expect(screen.getByText("Test Listing 1")).toBeInTheDocument()
    expect(screen.getByText("Test Listing 2")).toBeInTheDocument()
  })

  it("shows NEW! chip for added listings", () => {
    const offerChanges: OfferChanges = {
      costChanged: false,
      descriptionChanged: false,
      serviceChanged: false,
      addedListings: new Set(["listing-1"]),
      removedListings: new Set(),
      quantityChanges: new Map(),
    }

    render(
      <OrderSummarySectionV2
        items={mockItems}
        total_cost={2500}
        offerChanges={offerChanges}
      />
    )

    // Should show NEW! chip for added listing
    const newChips = screen.getAllByText("NEW!")
    expect(newChips).toHaveLength(1)
  })

  it("shows quantity changes with old value", () => {
    const offerChanges: OfferChanges = {
      costChanged: false,
      descriptionChanged: false,
      serviceChanged: false,
      addedListings: new Set(),
      removedListings: new Set(),
      quantityChanges: new Map([["listing-1", { old: 1, new: 2 }]]),
    }

    render(
      <OrderSummarySectionV2
        items={mockItems}
        total_cost={2500}
        offerChanges={offerChanges}
      />
    )

    // Should show old quantity
    expect(screen.getByText(/\(was 1\)/)).toBeInTheDocument()

    // Should show NEW! chip for quantity change
    const newChips = screen.getAllByText("NEW!")
    expect(newChips).toHaveLength(1)
  })

  it("calculates total from item subtotals", () => {
    render(
      <OrderSummarySectionV2 items={mockItems} total_cost={2500} />
    )

    // Total should be sum of subtotals (2000 + 500 = 2500)
    expect(screen.getByText(/2,500/)).toBeInTheDocument()
  })

  it("returns null when no items provided", () => {
    const { container } = render(
      <OrderSummarySectionV2 items={[]} total_cost={0} />
    )

    expect(container.firstChild).toBeNull()
  })

  it("returns null when items is undefined", () => {
    const { container } = render(
      <OrderSummarySectionV2 items={undefined} total_cost={0} />
    )

    expect(container.firstChild).toBeNull()
  })

  it("handles items without quality tier", () => {
    const itemsWithoutQuality: OrderItemDetail[] = [
      {
    order_item_id: "item-1",
    listing_id: "listing-1",
    listing_title: "Looted Item Listing",
        item_id: "item-1",
        variant: {
          variant_id: "variant-1",
          attributes: {
            crafted_source: "looted",
          },
          display_name: "Looted Item",
          short_name: "Looted",
        },
        quantity: 1,
        price_per_unit: 100,
        subtotal: 100,
      },
    ]

    render(
      <OrderSummarySectionV2 items={itemsWithoutQuality} total_cost={100} />
    )

    // Should render listing title
    expect(screen.getByText("Looted Item Listing")).toBeInTheDocument()
  })

  it("formats large numbers with locale string", () => {
    const expensiveItems: OrderItemDetail[] = [
      {
    order_item_id: "item-1",
    listing_id: "listing-1",
    listing_title: "Test Listing 1",
        item_id: "item-1",
        variant: {
          variant_id: "variant-1",
          attributes: {
            quality_tier: 5,
          },
          display_name: "Tier 5",
          short_name: "T5",
        },
        quantity: 10,
        price_per_unit: 1000000,
        subtotal: 10000000,
      },
    ]

    render(
      <OrderSummarySectionV2 items={expensiveItems} total_cost={10000000} />
    )

    // Should format with commas
    expect(screen.getByText(/1,000,000 aUEC × 10/)).toBeInTheDocument()
    expect(screen.getByText("10,000,000 aUEC")).toBeInTheDocument()
  })

  it("maintains visual parity with V1 structure", () => {
    const { container } = render(
      <OrderSummarySectionV2 items={mockItems} total_cost={2500} />
    )

    // Check for key structural elements matching V1
    const box = container.querySelector('[class*="MuiBox"]')
    expect(box).toBeInTheDocument()

    const dividers = container.querySelectorAll('[class*="MuiDivider"]')
    expect(dividers.length).toBeGreaterThan(0)

    const stack = container.querySelector('[class*="MuiStack"]')
    expect(stack).toBeInTheDocument()
  })

  it("displays links to listing pages", () => {
    render(
      <OrderSummarySectionV2 items={mockItems} total_cost={2500} />
    )

    // Check for listing links — uses formatMarketUrl which produces slug-based URLs
    const links = screen.getAllByRole("link")
    expect(links.length).toBe(2)
    expect(links[0]).toHaveAttribute("href", "/market/listing1--test-listing-1")
    expect(links[1]).toHaveAttribute("href", "/market/listing2--test-listing-2")
  })
})
