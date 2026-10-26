/**
 * The homepage hero: one <h1>, the all-time stats (live, with same-line
 * skeletons while loading), a market search and the two calls to action.
 * There is no sign-in card: sign-in lives in the navbar and the sidebar.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import type { Session } from "../../../hooks/login/useSession"
import type { MarketStats } from "../../../features/market/domain/types"
import english from "../../../locales/en/english.json"

type StatsResult = { data?: MarketStats; isError: boolean }

const h = vi.hoisted(() => ({
  session: { status: "unknown" } as Session,
  stats: { data: undefined, isError: false } as StatsResult,
}))
vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () => h.session,
}))
// The real English strings (the test setup has no i18n instance).
vi.mock("react-i18next", async () => {
  const actual =
    await vi.importActual<typeof import("react-i18next")>("react-i18next")
  const { default: catalog } = await import("../../../locales/en/english.json")
  const t = (key: string) =>
    key.split(".").reduce<unknown>((node, part) => {
      return node && typeof node === "object"
        ? (node as Record<string, unknown>)[part]
        : undefined
    }, catalog) ?? key
  return { ...actual, useTranslation: () => ({ t, i18n: { language: "en" } }) }
})
vi.mock("../../../features/market/api/marketApi", () => ({
  useGetMarketStatsQuery: () => h.stats,
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
  h.stats = { data: STATS, isError: false }
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
    h.stats = { data: undefined, isError: false }
    renderWith(<LandingHero />)
    const row = screen.getByTestId("landing-hero-stats")
    expect(row).toHaveAttribute("aria-busy", "true")
    expect(row.querySelectorAll(".MuiSkeleton-root")).toHaveLength(2)
    expect(row).toHaveTextContent(english.landing.heroOrdersLabel)
    expect(row).toHaveTextContent(english.landing.heroValueLabel)
  })

  it("keeps the stats cells (empty, hidden) when the request failed", () => {
    h.stats = { data: undefined, isError: true }
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

  it("has no sign-in card; one primary CTA and a sell CTA via login when signed out", () => {
    renderWith(<LandingHero />)
    expect(screen.queryByText(/sign in/i)).toBeNull()
    expect(
      screen.getByRole("link", { name: english.landing.heroBrowse }),
    ).toHaveAttribute("href", "/market")
    expect(
      screen.getByRole("link", { name: english.landing.heroSell }),
    ).toHaveAttribute("href", "/login?redirect=%2Fmarket%2Fcreate")
  })

  it("signed in: the sell CTA goes straight to the create-listing page", () => {
    h.session = { status: "authenticated", profile: {} as never }
    renderWith(<LandingHero />)
    expect(
      screen.getByRole("link", { name: english.landing.heroSell }),
    ).toHaveAttribute("href", "/market/create")
  })

  it("the search submits to the market's text filter", () => {
    renderWith(<LandingHero />)
    const search = screen.getByRole("search", {
      name: english.landing.heroSearchLabel,
    })
    fireEvent.change(within(search).getByRole("searchbox"), {
      target: { value: " p4-ar rifle " },
    })
    fireEvent.click(
      within(search).getByRole("button", {
        name: english.landing.heroSearchSubmit,
      }),
    )
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/market?text=p4-ar%20rifle",
    )
  })

  it("an empty search opens the market", () => {
    renderWith(<LandingHero />)
    const search = screen.getByRole("search", {
      name: english.landing.heroSearchLabel,
    })
    fireEvent.click(
      within(search).getByRole("button", {
        name: english.landing.heroSearchSubmit,
      }),
    )
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
      screen.getByRole("link", { name: english.landing.heroBrowse }),
    ).toBeInTheDocument()
  })
})
