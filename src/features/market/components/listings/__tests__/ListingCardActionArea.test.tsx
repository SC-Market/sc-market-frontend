/**
 * The in-grid ads hover, focus and press like the listing cards around them:
 * both are a ListingCardActionArea, so they share one style and can't drift.
 */
import { describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { cardActionAreaClasses } from "@mui/material/CardActionArea"
import { MemoryRouter } from "react-router-dom"
import { mainTheme } from "../../../../../hooks/styles/Theme"
import { AdCard } from "../../../../../components/ads/AdCard"
import { MARKET_ADS } from "../../../../../components/ads/adConfig"
import { IAE_2956 } from "../../../../../components/ads/iae2956"
import { ListingCardV2 } from "../../../v2/ListingCardV2"
import { LISTING_CARD_ACTION_CLASS } from "../ListingCardActionArea"
import { formatMarketUrl } from "../../../domain/urls"
import type { ListingSearchResult } from "../../../../../store/api/v2/market"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const listing: ListingSearchResult = {
  listing_id: "l-1",
  title: "Arrowhead Sniper Rifle",
  shop_id: "s-1",
  shop_name: "Test Shop",
  shop_slug: "test-shop",
  shop_rating: 4.5,
  shop_rating_count: 10,
  shop_badge_ids: [],
  shop_languages: ["en"],
  price_min: 1000,
  price_max: 1000,
  quantity_available: 0,
  variant_count: 1,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  game_item_id: "g-1",
  game_item_name: "Arrowhead",
  game_item_type: "Weapon",
  quantity_unit: "unit",
}

/** The sx-generated (emotion) class: identical styles give the same one. */
function styleClass(el: HTMLElement) {
  return [...el.classList].filter((c) => c.startsWith("css-"))
}

function tileOf(link: HTMLElement) {
  expect(link.classList).toContain(LISTING_CARD_ACTION_CLASS)
  expect(link.classList).toContain(cardActionAreaClasses.root)
  // The tint layer that fades in on hover and keyboard focus.
  expect(
    link.querySelector(`.${cardActionAreaClasses.focusHighlight}`),
  ).not.toBeNull()
  return link
}

describe("AdCard hover", () => {
  it.each(
    [...MARKET_ADS, ...IAE_2956.creatives].map((ad) => [ad.id, ad] as const),
  )("%s uses the listing card's hover, focus and press styling", (_id, ad) => {
    render(
      <ThemeProvider theme={mainTheme}>
        <MemoryRouter>
          <div data-testid="listing">
            <ListingCardV2 listing={listing} index={0} />
          </div>
          <div data-testid="ad">
            <AdCard ad={ad} index={0} noGridWrapper />
          </div>
        </MemoryRouter>
      </ThemeProvider>,
    )
    const listingTile = tileOf(
      within(screen.getByTestId("listing")).getByRole("link", {
        name: /Arrowhead Sniper Rifle/,
      }),
    )
    const adTile = tileOf(within(screen.getByTestId("ad")).getByRole("link"))

    // The tile itself is the link (one tab stop, focus-visible on it).
    expect(listingTile.getAttribute("href")).toBe(formatMarketUrl(listing))
    expect(adTile.getAttribute("href")).toBe(ad.linkUrl)
    expect(adTile.getAttribute("target")).toBe("_blank")
    expect(adTile.getAttribute("rel")).toBe("noopener noreferrer")

    // Same style source, so the same generated class.
    expect(styleClass(adTile)).toEqual(styleClass(listingTile))
    expect(styleClass(adTile)).toHaveLength(1)

    // Card height is unchanged.
    expect(adTile.firstElementChild?.classList).toContain("MuiCard-root")
  })
})
