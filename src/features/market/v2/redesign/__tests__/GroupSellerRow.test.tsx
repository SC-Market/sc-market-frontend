import "../../components/__tests__/setup"
/**
 * A grouped listing's seller rows show what the top-level listing card
 * (ListingCardV2) shows for that listing, compactly: the listing's photo as
 * a thumbnail (FALLBACK_IMAGE_URL without one, as on the card), title, shop
 * link, rating and badges, seller activity, price, quality, stock, updated
 * time and the NEW / bulk discount / out of stock / internal / unlisted
 * chips.
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
import { FALLBACK_IMAGE_URL } from "../../../../../util/constants"
import {
  formatPrice,
  formatPriceRange,
} from "../../../../../util/format/format"
import { formatMarketUrl } from "../../../domain/urls"

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
// The rating widget is the card's: pin what the row hands it.
vi.mock("../../../../../components/rating/ListingRating", () => ({
  MarketListingRating: (p: {
    avg_rating: number
    rating_count: number | null
    badge_ids?: string[] | null
  }) => (
    <span data-testid="rating">
      {`${p.avg_rating}/${p.rating_count}/${(p.badge_ids ?? []).join(",")}`}
    </span>
  ),
}))

const { GroupSellers } = await import("../GroupSellers")
const { GroupSellersFallback } = await import("../GroupSellersFallback")

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
const recent = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
const old = "2025-01-01T00:00:00.000Z"

function variant(o: Partial<GameItemListingResult>): GameItemListingResult {
  return {
    listing_id: "74c8f00b-ae69-4e09-803c-a39d7cf53838",
    variant_id: "503acaba-6e83-4a04-9d93-b6e45cc26df9",
    title: "Irradiated Valakkar Fang (Apex)",
    shop_id: "2eaa6cf3-108c-4395-83b0-684d4b6647ce",
    shop_name: "Phal's Grand Bazzar",
    shop_slug: "phalannx-shop",
    shop_rating: 4.8,
    shop_rating_count: 25,
    shop_badge_ids: ["fast_responder", "trusted"],
    shop_activity: {
      last_seen: "today",
      reply_time: "within_hour",
      reply_sample_size: 12,
      completed_orders: 40,
    },
    price: 429000,
    quantity_available: 3,
    quality_tier: 5,
    variant_display_name: "Tier 5",
    photo: "https://cdn.sc-market.space/fang.webp",
    created_at: recent,
    updated_at: recent,
    has_bulk_discount: true,
    visibility: "private",
    quantity_unit: "unit",
    ...o,
  }
}

function renderSellers(listings: GameItemListingResult[]) {
  listingsResponse.current = {
    game_item: { id: ITEM, name: "Fang", type: "Miscellaneous" },
    quality_distribution: [],
    listings,
    total: listings.length,
    page: 1,
    page_size: 100,
  }
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <GroupSellers gameItemId={ITEM} gameItemName="Fang" />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe("grouped listing seller rows", () => {
  it("shows the listing's own photo as a thumbnail, linked to the listing", () => {
    renderSellers([variant({})])
    const thumb = screen.getByTestId("group-seller-thumbnail")
    expect(thumb).toHaveAttribute(
      "src",
      "https://cdn.sc-market.space/fang.webp",
    )
    expect(thumb.closest("a")).toHaveAttribute(
      "href",
      formatMarketUrl(variant({})),
    )
  })

  it("falls back to the listing card's fallback image without a photo", () => {
    renderSellers([variant({ photo: undefined })])
    expect(screen.getByTestId("group-seller-thumbnail")).toHaveAttribute(
      "src",
      FALLBACK_IMAGE_URL,
    )
  })

  it("carries every detail of the top-level listing card", () => {
    renderSellers([variant({})])
    const row = within(screen.getByTestId("group-seller-row"))
    // title, variant and shop (linked to its profile, as on the card)
    expect(row.getByText("Irradiated Valakkar Fang (Apex)")).toBeInTheDocument()
    expect(row.getByText("Tier 5")).toBeInTheDocument()
    expect(row.getByText("Phal's Grand Bazzar").closest("a")).toHaveAttribute(
      "href",
      "/shops/phalannx-shop",
    )
    // rating and badges
    expect(row.getByTestId("rating")).toHaveTextContent(
      "4.8/25/fast_responder,trusted",
    )
    // seller activity: last seen and reply time buckets
    expect(row.getByTestId("seller-activity-compact")).toHaveTextContent(
      "Active today · Replies < 1h",
    )
    // price, quality, stock and updated time
    expect(row.getByText(formatPrice(429000, "en"))).toBeInTheDocument()
    expect(row.getByText("Q5")).toBeInTheDocument()
    expect(row.getByTestId("group-seller-stock")).toHaveTextContent(
      /^3 avail\. · Updated 2 hours ago$/,
    )
    // status chips
    expect(row.getByText("New")).toBeInTheDocument()
    expect(row.getByText("BULK DISCOUNT")).toBeInTheDocument()
    expect(row.getByText("Internal Listing")).toBeInTheDocument()
    // superlative tag and the add-to-cart unit
    expect(row.getByText("Lowest price")).toBeInTheDocument()
    expect(row.getByRole("button", { name: "Add" })).toBeEnabled()
  })

  it("leaves out the chips that don't apply, and shows SCU stock in SCU", () => {
    renderSellers([
      variant({
        created_at: old,
        updated_at: old,
        has_bulk_discount: false,
        visibility: "public",
        quantity_unit: "scu",
        quantity_available: 250,
        shop_activity: undefined,
      }),
    ])
    const row = within(screen.getByTestId("group-seller-row"))
    expect(row.queryByText("New")).toBeNull()
    expect(row.queryByText("BULK DISCOUNT")).toBeNull()
    expect(row.queryByText("Internal Listing")).toBeNull()
    expect(row.queryByTestId("seller-activity-compact")).toBeNull()
    expect(row.getByTestId("group-seller-stock")).toHaveTextContent(
      /^2\.50 SCU avail\./,
    )
  })

  it("marks unlisted listings like the card does", () => {
    renderSellers([variant({ visibility: "unlisted" })])
    expect(
      within(screen.getByTestId("group-seller-row")).getByText("Unlisted"),
    ).toBeInTheDocument()
  })

  it("gives the fallback rows (search results) the same thumbnail and details", () => {
    const listing = {
      listing_id: "l1",
      title: "Fang",
      shop_id: "s1",
      shop_name: "Splashy2000's Shop",
      shop_slug: "splashy2000-shop",
      shop_rating: 4,
      shop_rating_count: 3,
      shop_badge_ids: ["trusted"],
      shop_languages: ["en"],
      shop_activity: {
        last_seen: "this_week",
        reply_time: null,
        reply_sample_size: null,
        completed_orders: 2,
      },
      price_min: 1000,
      price_max: 2000,
      quantity_available: 0,
      quality_tier_min: 2,
      quality_tier_max: 4,
      variant_count: 2,
      created_at: old,
      updated_at: old,
      game_item_id: "",
      game_item_name: "Fang",
      game_item_type: "Miscellaneous",
      quantity_unit: "unit",
      visibility: "public",
    } satisfies ListingSearchResult
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <GroupSellersFallback listings={[listing]} />
        </MemoryRouter>
      </ThemeProvider>,
    )
    const row = within(screen.getByTestId("group-seller-row"))
    expect(row.getByTestId("group-seller-thumbnail")).toHaveAttribute(
      "src",
      FALLBACK_IMAGE_URL,
    )
    expect(row.getByTestId("rating")).toHaveTextContent("4/3/trusted")
    expect(row.getByTestId("seller-activity-compact")).toHaveTextContent(
      "Active this week",
    )
    expect(row.getByText("Out of Stock")).toBeInTheDocument()
    expect(
      row.getByText(formatPriceRange(1000, 2000, "en")),
    ).toBeInTheDocument()
  })
})
