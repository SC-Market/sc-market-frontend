import "../../components/__tests__/setup"
/**
 * A grouped listing's "N sellers" and its expanded seller list follow one
 * rule (groupSellerRule.ts): one seller per distinct shop. Pinned on the
 * reported case: Irradiated Valakkar Fang (Apex), listed by Phal's Grand
 * Bazzar and Splashy2000's Shop. The card said "2 sellers" but the expansion
 * only showed Phal's, because it rendered the superlative winners (Phal's
 * is both the cheapest and the top rated) instead of every seller.
 */
import React from "react"
import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { describe, expect, it, vi } from "vitest"
import type {
  GameItemListingResult,
  GetListingsApiResponse,
  ListingSearchResult,
} from "../../../../../store/api/v2/market"
import { sellerCards, sellerCount, sellerShops } from "../groupSellerRule"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const listingsResponse = vi.hoisted(() => ({
  current: undefined as GetListingsApiResponse | undefined,
}))
vi.mock("../../../../../store/api/v2/market", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useGetListingsQuery: () => ({
    data: listingsResponse.current,
    isLoading: false,
    error: undefined,
  }),
}))
vi.mock("../../../hooks/useCartActions", () => ({
  useAddToCart: () => ({ add: vi.fn(), isAdding: false }),
}))

const { GroupSellers } = await import("../GroupSellers")

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
  palette: { outline: { main: "#e0e0e0" } },
} as Parameters<typeof createTheme>[0])

const ITEM = "36971a5a-971b-4f60-a1a6-a11d8bc0d5e3"
const PHAL = "2eaa6cf3-108c-4395-83b0-684d4b6647ce"
const SPLASHY = "1910b642-0072-4cc9-9912-aa0f6327b573"

/** The expand fetch (/game-items/{id}/listings), as the live API returned it. */
function variant(o: Partial<GameItemListingResult>): GameItemListingResult {
  return {
    listing_id: "l",
    variant_id: "503acaba-6e83-4a04-9d93-b6e45cc26df9",
    title: "Irradiated Valakkar Fang (Apex)",
    shop_id: "s",
    shop_name: "shop",
    shop_rating: 0,
    shop_rating_count: 0,
    shop_badge_ids: [],
    shop_slug: "shop",
    price: 0,
    quantity_available: 1,
    variant_display_name: "Standard",
    variant_short_name: "Std",
    created_at: "2026-11-02T13:52:46.257Z",
    ...o,
  }
}

const phal = variant({
  listing_id: "74c8f00b-ae69-4e09-803c-a39d7cf53838",
  shop_id: PHAL,
  shop_name: "Phal's Grand Bazzar",
  shop_slug: "phalannx-shop",
  shop_rating: 5,
  shop_rating_count: 5,
  price: 429000,
  quantity_available: 3,
})
const splashy = variant({
  listing_id: "e04af54e-9bf8-494c-81d1-07a619c2fcc8",
  shop_id: SPLASHY,
  shop_name: "Splashy2000's Shop",
  shop_slug: "splashy2000-shop",
  price: 1500000,
  quantity_available: 5,
})

/** The search page's rows for the item (only shop_id matters to the count). */
const searchRows = [
  { shop_id: SPLASHY, listing_id: splashy.listing_id },
  { shop_id: PHAL, listing_id: phal.listing_id },
] as ListingSearchResult[]

describe("grouped listing sellers", () => {
  it("counts distinct shops, not listing rows", () => {
    const twoFromPhal = [
      ...searchRows,
      { shop_id: PHAL, listing_id: "x" } as ListingSearchResult,
    ]
    expect(sellerCount(twoFromPhal)).toBe(2)
    expect(sellerShops(twoFromPhal).map((rows) => rows.length)).toEqual([1, 2])
  })

  it("gives every counted seller a card, winners first, tags on winners only", () => {
    const cards = sellerCards([phal, splashy])
    expect(cards.length).toBe(sellerCount(searchRows))
    expect(cards.map((c) => [c.shop_id, c.tags])).toEqual([
      [PHAL, ["lowestPrice", "topRated"]],
      [SPLASHY, []],
    ])
  })

  it("shows a shop's highest quality variant when that is what it won", () => {
    const cheapLow = variant({ shop_id: PHAL, price: 10, quality_tier: 1 })
    const pricyHigh = variant({
      shop_id: SPLASHY,
      variant_id: "v-low",
      price: 20,
      quality_tier: 1,
    })
    const splashyTop = variant({
      shop_id: SPLASHY,
      variant_id: "v-high",
      price: 50,
      quality_tier: 5,
    })
    const cards = sellerCards([cheapLow, pricyHigh, splashyTop])
    expect(cards).toHaveLength(2)
    expect(cards[1]).toMatchObject({
      shop_id: SPLASHY,
      tags: ["highestQuality"],
      variant_count: 2,
    })
    expect(cards[1].variant.variant_id).toBe("v-high")
  })

  it("renders one card per seller and counts the same sellers", () => {
    listingsResponse.current = {
      game_item: { id: ITEM, name: phal.title, type: "Miscellaneous" },
      quality_distribution: [],
      listings: [phal, splashy],
      total: 2,
      page: 1,
      page_size: 100,
    } as GetListingsApiResponse
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <GroupSellers gameItemId={ITEM} gameItemName={phal.title} />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText("Phal's Grand Bazzar")).toBeInTheDocument()
    expect(screen.getByText("Splashy2000's Shop")).toBeInTheDocument()
    expect(
      within(screen.getByTestId("group-sellers-summary")).getByText(
        /2 sellers/,
      ),
    ).toBeInTheDocument()
  })
})
