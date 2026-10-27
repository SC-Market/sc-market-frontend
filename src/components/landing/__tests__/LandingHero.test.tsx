/**
 * The homepage hero: one <h1>, the all-time stats (live, with same-line
 * skeletons while loading), a market search, the category chips, the four
 * intent cards and the "Wanted now" buy-order table. There is no sign-in card:
 * sign-in lives in the navbar and the sidebar.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import type { Session } from "../../../hooks/login/useSession"
import type { MarketStats } from "../../../features/market/domain/types"
import type {
  SearchBuyOrdersResponse,
  SearchListingsResponse,
  StandingBuyOrder,
} from "../../../store/api/v2/market"
import english from "../../../locales/en/english.json"

type StatsResult = { data?: MarketStats; isError: boolean; isLoading: boolean }
type QueryResult<T> = {
  data?: T
  currentData?: T
  isError: boolean
  isLoading: boolean
  isFetching: boolean
}
type ListingsResult = QueryResult<SearchListingsResponse>
type OrdersResult = QueryResult<SearchBuyOrdersResponse>

const h = vi.hoisted(() => ({
  session: { status: "unknown" } as Session,
  stats: { data: undefined, isError: false, isLoading: true } as StatsResult,
  listings: {
    data: undefined,
    isError: false,
    isLoading: true,
    isFetching: true,
  } as ListingsResult,
  orders: {
    data: undefined,
    isError: false,
    isLoading: true,
    isFetching: true,
  } as OrdersResult,
}))
vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () => h.session,
}))
// The real English strings (the test setup has no i18n instance).
vi.mock("react-i18next", async () => {
  const actual =
    await vi.importActual<typeof import("react-i18next")>("react-i18next")
  const { default: catalog } = await import("../../../locales/en/english.json")
  const t = (key: string, options?: Record<string, unknown>) => {
    const value =
      key.split(".").reduce<unknown>((node, part) => {
        return node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined
      }, catalog) ?? key
    return String(value).replace(/\{\{(\w+)\}\}/g, (_, name) =>
      String(options?.[name] ?? ""),
    )
  }
  return { ...actual, useTranslation: () => ({ t, i18n: { language: "en" } }) }
})
vi.mock("../../../features/market/api/marketApi", () => ({
  useGetMarketStatsQuery: () => h.stats,
}))
vi.mock("../../../store/api/v2/market", () => ({
  useSearchListingsQuery: () => h.listings,
  useSearchBuyOrdersQuery: () => h.orders,
}))

const { LandingHero } = await import("../LandingHero")
const { LandingHeroSkeleton } = await import("../LandingHero.skeleton")
const { WEEKLY_STATS_MIN_ORDERS } = await import("../LandingHeroLayout")

const STATS: MarketStats = {
  total_orders: 10174,
  total_order_value: 1677981402101,
  week_orders: 27,
  week_order_value: 12375400,
}

function order(
  id: string,
  name: string,
  extra: Partial<StandingBuyOrder> = {},
): StandingBuyOrder {
  return {
    buy_order_id: id,
    game_item_id: `item-${id}`,
    game_item_name: name,
    buyer_id: "b1",
    buyer_name: "RunicSage",
    quantity: 3,
    quantity_fulfilled: 1,
    price_per_unit: 3000000,
    negotiable: false,
    status: "active",
    created_at: "2026-10-26T00:00:00Z",
    ...extra,
  }
}

const LISTINGS: SearchListingsResponse = {
  listings: [],
  total: 439,
  page: 1,
  page_size: 10,
}

const ORDERS: SearchBuyOrdersResponse = {
  buy_orders: [
    order("o1", "Savrilium", {
      photos: [{ resource_id: "r1", url: "https://cdn.example/savrilium.webp" }],
    }),
    order("o2", "Killshot Rifle", { price_per_unit: 0 }),
  ],
  total: 2,
  page: 1,
  page_size: 6,
}

function loaded<T>(data: T): QueryResult<T> {
  return {
    data,
    currentData: data,
    isError: false,
    isLoading: false,
    isFetching: false,
  }
}

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderWith(node: React.ReactNode) {
  return render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={node} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

beforeEach(() => {
  h.session = { status: "anonymous", profile: undefined }
  h.stats = { data: STATS, isError: false, isLoading: false }
  h.listings = loaded(LISTINGS)
  h.orders = loaded(ORDERS)
})

describe("LandingHero", () => {
  it("has exactly one <h1>, the headline", () => {
    renderWith(<LandingHero />)
    const headings = screen.getAllByRole("heading", { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent(english.landing.heroTitle)
    expect(headings[0]).toHaveTextContent("Star Citizen")
  })

  it("headline and numbers use the bright text.secondary, supporting copy text.primary", () => {
    // In this theme text.secondary is the brighter colour.
    const bright = mainTheme.palette.text.secondary.toLowerCase()
    const dull = mainTheme.palette.text.primary.toLowerCase()
    renderWith(<LandingHero />)
    const color = (el: Element) => getComputedStyle(el).color.toLowerCase()
    expect(color(screen.getByRole("heading", { level: 1 }))).toBe(bright)
    expect(color(screen.getByText("10,174"))).toBe(bright)
    expect(color(screen.getByText(english.landing.heroText))).toBe(dull)
    expect(color(screen.getByText(english.landing.heroOrdersLabel))).toBe(dull)
  })

  it("shows the all-time totals, the big one in words", () => {
    renderWith(<LandingHero />)
    expect(screen.getByTestId("landing-total-orders")).toHaveTextContent(
      "10,174",
    )
    expect(screen.getByTestId("landing-total-value")).toHaveTextContent(
      "1.6 trillion",
    )
    expect(screen.getByTestId("landing-hero-stats")).not.toHaveAttribute(
      "aria-busy",
    )
    expect(WEEKLY_STATS_MIN_ORDERS).toBe(40)
  })

  it("holds the stat numbers with skeletons while loading, labels stay real", () => {
    h.stats = { data: undefined, isError: false, isLoading: true }
    h.listings = {
      data: undefined,
      isError: false,
      isLoading: true,
      isFetching: true,
    }
    renderWith(<LandingHero />)
    const row = screen.getByTestId("landing-hero-stats")
    expect(row).toHaveAttribute("aria-busy", "true")
    expect(row.querySelectorAll(".MuiSkeleton-root")).toHaveLength(3)
    expect(row).toHaveTextContent(english.landing.heroOrdersLabel)
    expect(row).toHaveTextContent(english.landing.heroValueLabel)
  })

  it("keeps the stats cells (empty, hidden) when the request failed", () => {
    h.stats = { data: undefined, isError: true, isLoading: false }
    renderWith(<LandingHero />)
    const row = screen.getByTestId("landing-hero-stats")
    expect(row).not.toHaveAttribute("aria-busy")
    for (const id of ["landing-total-orders", "landing-total-value"]) {
      expect(screen.getByTestId(id)).toHaveAttribute("aria-hidden", "true")
    }
  })

  it("weekly stats stay hidden below WEEKLY_STATS_MIN_ORDERS", () => {
    h.stats = {
      data: { ...STATS, week_orders: WEEKLY_STATS_MIN_ORDERS - 1 },
      isError: false,
      isLoading: false,
    }
    renderWith(<LandingHero />)
    for (const id of ["landing-week-orders", "landing-week-value"]) {
      const cell = screen.getByTestId(id)
      expect(cell).toHaveAttribute("aria-hidden", "true")
      expect(cell).toHaveAttribute("inert")
    }
    expect(screen.getByTestId("landing-week-orders")).not.toHaveTextContent(
      "39",
    )
  })

  it("weekly stats show from WEEKLY_STATS_MIN_ORDERS, in the same style", () => {
    h.stats = {
      data: {
        ...STATS,
        week_orders: WEEKLY_STATS_MIN_ORDERS,
        week_order_value: 12375400,
      },
      isError: false,
      isLoading: false,
    }
    renderWith(<LandingHero />)
    const orders = screen.getByTestId("landing-week-orders")
    const value = screen.getByTestId("landing-week-value")
    expect(orders).not.toHaveAttribute("aria-hidden")
    expect(orders).toHaveTextContent(
      `${WEEKLY_STATS_MIN_ORDERS}${english.landing.heroWeekOrdersLabel}`,
    )
    expect(value).toHaveTextContent(
      `12.3 million${english.landing.heroWeekValueLabel}`,
    )
  })

  it("shows the live listings total from the latest listings query", () => {
    renderWith(<LandingHero />)
    expect(screen.getByTestId("landing-live-listings")).toHaveTextContent(
      `439${english.landing.heroListingsLabel}`,
    )
  })

  it("has no sign-in card; the four intents link to buy, hire, wanted and sell (via login when signed out)", () => {
    renderWith(<LandingHero />)
    expect(screen.queryByText(/sign in/i)).toBeNull()
    const intents = screen.getByRole("navigation", {
      name: english.landing.intentsLabel,
    })
    const href = (name: string) =>
      within(intents).getByRole("link", { name }).getAttribute("href")
    expect(href(english.landing.intentBuyAction)).toBe("/market")
    expect(href(english.landing.intentHireAction)).toBe("/market/services")
    expect(href(english.landing.intentWantedAction)).toBe("/buyorder/create")
    expect(href(english.landing.intentSellAction)).toBe(
      "/login?redirect=%2Fmarket%2Fcreate",
    )
    expect(
      within(intents)
        .getAllByTestId("landing-intent")
        .map((card) => card.getAttribute("data-id")),
    ).toEqual(["buy", "hire", "wanted", "sell"])
  })

  it("signed in: Sell goes straight to the create-listing page", () => {
    h.session = { status: "authenticated", profile: {} as never }
    renderWith(<LandingHero />)
    expect(
      screen.getByRole("link", { name: english.landing.intentSellAction }),
    ).toHaveAttribute("href", "/market/create")
  })

  it("the category chips open the market search (Services its own page)", () => {
    renderWith(<LandingHero />)
    const nav = screen.getByRole("navigation", {
      name: english.landing.categoriesLabel,
    })
    expect(
      within(nav).getByRole("link", { name: english.landing.categoryWeapons }),
    ).toHaveAttribute("href", "/market?text=weapons")
    expect(
      within(nav).getByRole("link", { name: english.landing.categoryServices }),
    ).toHaveAttribute("href", "/market/services")
  })

  it("the Wanted now table links each buy order, with its photo, price and quantity", () => {
    renderWith(<LandingHero />)
    const table = screen.getByRole("region", {
      name: english.landing.wantedNowTitle,
    })
    const rows = within(table).getAllByTestId("buy-order-row")
    expect(rows.map((r) => r.getAttribute("data-id"))).toEqual(["o1", "o2"])
    expect(
      within(rows[0]).getByRole("link", { name: "Savrilium" }),
    ).toHaveAttribute("href", "/buyorder/o1")
    const thumb = rows[0].querySelector("img")!
    expect(thumb).toHaveAttribute("src", "https://cdn.example/savrilium.webp")
    expect(thumb).toHaveAttribute("width", "32")
    expect(thumb).toHaveAttribute("height", "32")
    expect(rows[0]).toHaveTextContent("3M aUEC×2")
    expect(rows[1]).toHaveTextContent("Make an offer")
    expect(
      within(table).getByRole("link", { name: english.landing.seeAll }),
    ).toHaveAttribute("href", "/buyorders")
  })

  it("a short list keeps six rows: the first free one invites a buy order", () => {
    renderWith(<LandingHero />)
    const table = screen.getByTestId("landing-wanted-now")
    expect(table.querySelectorAll("tbody tr")).toHaveLength(6)
    const post = within(table).getByTestId("landing-post-buy-order")
    expect(
      within(post).getByRole("link", { name: english.landing.wantedNowPost }),
    ).toHaveAttribute("href", "/buyorder/create")
    expect(within(table).getAllByTestId("landing-post-buy-order")).toHaveLength(1)
  })

  it("the Wanted now table holds skeleton rows while loading and a message on failure", () => {
    h.orders = {
      data: undefined,
      isError: false,
      isLoading: true,
      isFetching: true,
    }
    const { unmount } = renderWith(<LandingHero />)
    const table = screen.getByTestId("landing-wanted-now")
    expect(table).toHaveAttribute("aria-busy", "true")
    expect(table.querySelectorAll("tbody tr")).toHaveLength(6)
    expect(table.querySelectorAll("tbody .MuiSkeleton-root").length).toBe(24)
    unmount()

    h.orders = {
      data: undefined,
      isError: true,
      isLoading: false,
      isFetching: false,
    }
    h.listings = {
      data: undefined,
      isError: true,
      isLoading: false,
      isFetching: false,
    }
    renderWith(<LandingHero />)
    const failed = screen.getByTestId("landing-wanted-now")
    expect(failed.querySelectorAll("tbody tr")).toHaveLength(6)
    expect(failed).toHaveTextContent(english.landing.wantedNowError)
    expect(screen.getByTestId("landing-live-listings")).toHaveAttribute(
      "aria-hidden",
      "true",
    )
  })

  it("the search submits to the market's text filter", () => {
    renderWith(<LandingHero />)
    const search = screen.getByRole("search", {
      name: english.landing.heroSearchLabel,
    })
    fireEvent.change(within(search).getByRole("searchbox"), {
      target: { value: " p4-ar rifle " },
    })
    fireEvent.submit(search)
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/market?text=p4-ar%20rifle",
    )
  })

  it("an empty search opens the market", () => {
    renderWith(<LandingHero />)
    const search = screen.getByRole("search", {
      name: english.landing.heroSearchLabel,
    })
    fireEvent.submit(search)
    expect(screen.getByTestId("location")).toHaveTextContent(/^\/market$/)
  })

  it("the route skeleton is the same layout, with the stat numbers as skeletons", () => {
    renderWith(<LandingHeroSkeleton />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      english.landing.heroTitle,
    )
    expect(screen.getByTestId("landing-hero-stats")).toHaveAttribute(
      "aria-busy",
      "true",
    )
    expect(
      screen.getByRole("link", { name: english.landing.intentBuyAction }),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId("landing-wanted-now").querySelectorAll("tbody tr"),
    ).toHaveLength(6)
  })
})
