/**
 * The Storefronts hub, a page at a time: ?page=N picks the page (the same
 * args as the homepage row on page 1), the MUI pagination's page buttons are
 * real /storefronts?page=N links that navigate in the app, the bare pages
 * get rel prev/next, and a focus chip filters on the server (?field=),
 * starting on its first page.
 */
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import type {
  GetStorefrontsApiArg,
  StorefrontCard,
  StorefrontsResponse,
} from "../../../store/api/v2/market"

const h = vi.hoisted(() => ({
  calls: [] as unknown[],
  total: 60,
  fields: ["trading", "freight"] as string[],
}))

function card(i: number): StorefrontCard {
  return {
    spectrum_id: `ORG${i}`,
    name: `Org ${i}`,
    logo_url: null,
    tagline: "",
    fields: [],
    active_listings: 1,
    active_services: 0,
    services_shop_slug: null,
    completed_orders: 0,
    avg_rating: null,
    rating_count: 0,
    showcase: false,
  }
}

/** The API's page for these args, from `h.total` orgs ORG0..ORG(n-1). */
function respond(args: GetStorefrontsApiArg): StorefrontsResponse {
  const page = args.page ?? 1
  const size = args.pageSize ?? 24
  const from = (page - 1) * size
  const count = Math.max(0, Math.min(size, h.total - from))
  return {
    storefronts: Array.from({ length: count }, (_, i) => card(from + i)),
    total: h.total,
    page,
    page_size: size,
    fields: h.fields,
  }
}

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(importOriginal),
)
vi.mock("../../../store/api/v2/market", () => ({
  useGetStorefrontsQuery: (args: GetStorefrontsApiArg) => {
    h.calls.push(args)
    const data = respond(args)
    return { data, currentData: data, isLoading: false, isFetching: false }
  },
}))
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: (props: { children: React.ReactNode }) => <div>{props.children}</div>,
}))
// The <head> tags, rendered in place so the test can read them.
vi.mock("@unhead/react/helmet", () => ({
  Helmet: (props: { children: React.ReactNode }) => <div data-testid="head">{props.children}</div>,
}))
vi.mock("../../../components/metadata/PageReady", () => ({ usePageReady: () => {} }))
vi.mock("../../../features/storefront/components/StorefrontCard", () => ({
  STOREFRONT_CARD_HEIGHT: 100,
  StorefrontCard: (props: { storefront: StorefrontCard }) => (
    <div data-testid="storefront-card">{props.storefront.spectrum_id}</div>
  ),
}))
vi.mock("../../../features/storefront/components/EnquireBrandedStorefront", () => ({
  EnquireBrandedStorefront: () => null,
}))

const { StorefrontsHub } = await import("../StorefrontsHub")
const { STOREFRONTS_PAGE_SIZE, storefrontsHubArgs } = await import("../../../features/storefront/domain")

function Location() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderHub(url = "/storefronts") {
  return render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route
            path="/storefronts"
            element={
              <>
                <StorefrontsHub />
                <Location />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

const cards = () => screen.getAllByTestId("storefront-card").map((el) => el.textContent)
const nav = () => screen.getByRole("navigation", { name: /pagination/i })
/** React hoists <link> into document.head. */
const headLink = (rel: string) => document.querySelector(`link[rel="${rel}"]`)?.getAttribute("href") ?? null

beforeEach(() => {
  h.calls = []
  h.total = 60
  h.fields = ["trading", "freight"]
})

describe("StorefrontsHub pagination", () => {
  it("page 1: the first 24 cards, the homepage row's args, and links to every page", () => {
    renderHub()
    expect(h.calls.at(-1)).toEqual(storefrontsHubArgs())
    expect(h.calls.at(-1)).toEqual({ page: 1, pageSize: STOREFRONTS_PAGE_SIZE })
    expect(cards()).toHaveLength(24)
    expect(cards()[0]).toBe("ORG0")
    const page2 = within(nav()).getByRole("link", { name: /page 2/i })
    expect(page2.getAttribute("href")).toBe("/storefronts?page=2")
    expect(within(nav()).getByRole("link", { name: /page 3/i }).getAttribute("href")).toBe("/storefronts?page=3")
    expect(headLink("prev")).toBeNull()
    expect(headLink("next")).toBe("https://sc-market.space/storefronts?page=2")
  })

  it("clicking a page navigates to ?page=N and shows that page's cards", () => {
    renderHub()
    fireEvent.click(within(nav()).getByRole("link", { name: /page 2/i }))
    expect(screen.getByTestId("location").textContent).toBe("/storefronts?page=2")
    expect(h.calls.at(-1)).toEqual({ page: 2, pageSize: 24 })
    expect(cards()[0]).toBe("ORG24")
    expect(cards()).toHaveLength(24)
    expect(headLink("prev")).toBe("https://sc-market.space/storefronts")
    expect(headLink("next")).toBe("https://sc-market.space/storefronts?page=3")
  })

  it("the next-page arrow goes to the following page; the last page has no next", () => {
    renderHub("/storefronts?page=2")
    fireEvent.click(within(nav()).getByRole("link", { name: /next page/i }))
    expect(screen.getByTestId("location").textContent).toBe("/storefronts?page=3")
    expect(cards()).toEqual(Array.from({ length: 12 }, (_, i) => `ORG${48 + i}`))
    expect(headLink("next")).toBeNull()
    expect(headLink("prev")).toBe("https://sc-market.space/storefronts?page=2")
  })

  it("no pagination when everything fits on one page", () => {
    h.total = 10
    renderHub()
    expect(cards()).toHaveLength(10)
    expect(screen.queryByRole("navigation", { name: /pagination/i })).toBeNull()
    expect(headLink("next")).toBeNull()
  })

  it("a focus chip filters on the server and starts on its first page", () => {
    renderHub("/storefronts?page=2")
    fireEvent.click(screen.getByRole("button", { name: "freight" }))
    expect(screen.getByTestId("location").textContent).toBe("/storefronts?field=freight")
    expect(h.calls.at(-1)).toEqual({ page: 1, pageSize: 24, field: "freight" })
    // A filtered view is a noindex variant: no prev/next, plain page buttons.
    expect(screen.queryByTestId("head")).toBeNull()
    expect(headLink("next")).toBeNull()
    expect(within(nav()).queryByRole("link", { name: /page 2/i })).toBeNull()
    fireEvent.click(within(nav()).getByRole("button", { name: /page 2/i }))
    expect(screen.getByTestId("location").textContent).toBe("/storefronts?field=freight&page=2")
    expect(h.calls.at(-1)).toEqual({ page: 2, pageSize: 24, field: "freight" })
    fireEvent.click(screen.getByRole("button", { name: "All" }))
    expect(screen.getByTestId("location").textContent).toBe("/storefronts")
  })
})
