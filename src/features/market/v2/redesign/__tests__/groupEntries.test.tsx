import "../../components/__tests__/setup"
/**
 * Grouped market cards cover an item's matching listings on EVERY result page
 * (the search's item_summaries), not only the loaded page.
 *
 * Reported case: "UEE 6th Platoon Medal (Pristine)" read "across 2 sellers"
 * while its expanded list showed 4: two of its sellers were on page 1, the
 * others further down. Items with a single listing on the page but more on
 * other pages (Wikelo Favor, Tevarin War Service Marker) were not grouped at
 * all, and BULK DISCOUNT never showed.
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { describe, expect, it, vi } from "vitest"
import type {
  ListingSearchResult,
  SearchItemSummary,
} from "../../../../../store/api/v2/market"
import { buildGroupEntries } from "../groupEntries"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const { GroupCard } = await import("../GroupCard")

const MEDAL = "2cf75c1a-aa19-410b-9c56-b2e41f829e6a"
const FAVOR = "f0000000-0000-4000-8000-000000000001"
const LONE = "f0000000-0000-4000-8000-000000000002"
const SHIP = "f0000000-0000-4000-8000-000000000003"

const listing = (
  n: number,
  game_item_id: string,
  extra: Partial<ListingSearchResult> = {},
): ListingSearchResult => ({
  listing_id: `l${n}`,
  title: `Listing ${n}`,
  shop_id: `shop-${n}`,
  shop_name: `Shop ${n}`,
  shop_slug: `shop-${n}`,
  shop_rating: 0,
  shop_rating_count: 0,
  shop_badge_ids: [],
  shop_languages: ["en"],
  price_min: 1000 * n,
  price_max: 1000 * n,
  quantity_available: 1,
  variant_count: 1,
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
  game_item_id,
  game_item_name: "UEE 6th Platoon Medal (Pristine)",
  game_item_type: "Miscellaneous",
  quantity_unit: "unit",
  ...extra,
})

const summary = (
  game_item_id: string,
  extra: Partial<SearchItemSummary> = {},
): SearchItemSummary => ({
  game_item_id,
  listing_count: 1,
  seller_count: 1,
  quantity_available: 1,
  price_min: 1000,
  price_max: 1000,
  has_bulk_discount: false,
  ...extra,
})

describe("buildGroupEntries", () => {
  it("groups by the whole search's listing count, not the page's", () => {
    const page = [
      listing(2, MEDAL),
      listing(1, FAVOR), // its other listings are on later pages
      listing(3, LONE),
      listing(1, MEDAL, { listing_id: "l1b" }),
    ]
    const entries = buildGroupEntries(page, [
      summary(MEDAL, { listing_count: 4, seller_count: 4 }),
      summary(FAVOR, { listing_count: 3, seller_count: 3 }),
      summary(LONE),
    ])
    expect(entries.map((e) => e.key)).toEqual([
      `g:${MEDAL}`,
      `g:${FAVOR}`,
      "s:l3",
      // the medal's second page listing is in its group, not a card of its own
    ])
    const medal = entries[0]
    expect(
      medal.kind === "group" && medal.listings.map((l) => l.listing_id),
    ).toEqual(["l1b", "l2"]) // cheapest first
    expect(medal.kind === "group" && medal.summary.seller_count).toBe(4)
  })

  it("never groups non-fungible items or items without a summary", () => {
    const entries = buildGroupEntries(
      [
        listing(1, SHIP, { game_item_type: "Ship for Sale/Rental" }),
        listing(2, SHIP, { game_item_type: "Ship for Sale/Rental" }),
        listing(3, MEDAL),
        listing(4, MEDAL),
      ],
      [summary(SHIP, { listing_count: 2 })],
    )
    expect(entries.map((e) => e.kind)).toEqual([
      "single",
      "single",
      "single",
      "single",
    ])
  })
})

const theme = createTheme({
  layoutSpacing: { layout: 2, component: 1, text: 1, compact: 0.5 },
  borderRadius: {
    topLevel: 0.375,
    image: 0.375,
    button: 1,
    input: 0.5,
    chip: 0.5,
    minimal: 0,
  },
  palette: { mode: "light", outline: { main: "#e0e0e0" } },
} as Parameters<typeof createTheme>[0])

function renderCard(s: SearchItemSummary, listings: ListingSearchResult[]) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <GroupCard
          listings={listings}
          summary={s}
          priority={false}
          open={false}
          onToggle={() => {}}
        />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe("GroupCard", () => {
  it("counts every seller of the item, with its stock, quality and discount", () => {
    renderCard(
      summary(MEDAL, {
        listing_count: 4,
        seller_count: 4,
        quantity_available: 9,
        price_min: 500,
        price_max: 4000,
        quality_value_min: 300,
        quality_value_max: 900,
        has_bulk_discount: true,
      }),
      [listing(1, MEDAL), listing(2, MEDAL)], // only 2 on this page
    )
    expect(screen.getByText(/across 4 sellers/)).toBeInTheDocument()
    expect(screen.getByText("4 sellers")).toBeInTheDocument()
    expect(screen.getByText("300–900")).toBeInTheDocument()
    expect(screen.getByText(/bulk discount/i)).toBeInTheDocument()
    expect(screen.queryByText(/out of stock/i)).not.toBeInTheDocument()
  })

  it("is out of stock only when no seller has stock", () => {
    renderCard(
      summary(MEDAL, {
        listing_count: 2,
        seller_count: 0,
        quantity_available: 0,
      }),
      [listing(1, MEDAL, { quantity_available: 0 })],
    )
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
    expect(screen.queryByText(/bulk discount/i)).not.toBeInTheDocument()
  })
})
