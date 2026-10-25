/**
 * useSearchParams / useNavigate behavior the market search relies on.
 *
 * Part 1 drives the real /market page (real routes + providers, fake API)
 * and records which search request the URL turns into, how in-app URL
 * changes re-query, and where the market/buy-orders toggle navigates.
 *
 * Part 2 pins the React Router primitives the market code uses with the
 * real useMarketSearch hook: setSearchParams push vs. replace, functional
 * updates, and navigate() between market tabs. Under v7_startTransition
 * these updates are wrapped in startTransition, so every assertion waits
 * for the router to settle instead of reading synchronously.
 */
import React from "react"
import { act, fireEvent, render, waitFor } from "@testing-library/react"
import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { routes } from "../../App"
import { APP_TEST_TIMEOUT_MS, mountApp } from "./regression/harness"
import { useMarketSearch } from "../../features/market/hooks/MarketSearch"
import { MARKET_PATHS } from "../../routes/paths"

vi.unmock("../../features/profile/api/profileApi")
vi.mock("react-router-dom", async (importOriginal) =>
  (await import("./regression/instrument")).instrumentRouterModule(
    await importOriginal<typeof import("react-router-dom")>(),
  ),
)
vi.mock("socket.io-client", async () =>
  (await import("./regression/instrument")).fakeSocketModule(),
)
vi.mock("@mui/x-charts/LineChart", async () =>
  (await import("./regression/instrument")).fakeChartModule(),
)
vi.mock("@mui/x-charts/BarChart", async () =>
  (await import("./regression/instrument")).fakeChartModule(),
)

function searchRequests(requests: Array<{ path: string }>) {
  return [
    ...new Set(
      requests.map((r) => r.path).filter((p) => p.includes("/listings/search")),
    ),
  ]
}

describe("/market page (real app)", () => {
  it(
    "turns URL search params into the listings search request",
    async () => {
      const app = mountApp(
        routes,
        "/market?query=laser&page=2&price_min=100&sort_by=price&sort_order=asc",
        { session: "anonymous" },
      )
      // The search box also fires a debounced 5-result suggestion query
      // (ListingSearchV2 / CommandPalette, pageSize 5); wait for it so the
      // snapshot doesn't depend on whether the debounce fired before settle.
      const waitForSuggestion = (text: string) =>
        waitFor(
          () =>
            expect(searchRequests(app.requests)).toContain(
              `/api/v2/listings/search?text=${text}&page_size=5`,
            ),
          { timeout: 15_000 },
        )
      try {
        await app.settle()
        await waitForSuggestion("laser")
        const initial = searchRequests(app.requests)

        // In-app URL change (what setSearchParams does) re-queries.
        await act(async () => {
          await app.router.navigate("/market?query=rifle")
        })
        await app.settle()
        await waitForSuggestion("rifle")
        const afterNavigate = searchRequests(app.requests).filter(
          (p) => !initial.includes(p),
        )

        // Back restores the previous search.
        await act(async () => {
          await app.router.navigate(-1)
        })
        await app.settle()

        expect({
          finalUrlAfterBack:
            app.router.state.location.pathname +
            app.router.state.location.search,
          initial,
          afterNavigate,
          h1: [...document.querySelectorAll("h1")].map((h) => h.textContent),
        }).toMatchSnapshot()
      } finally {
        app.unmount()
      }
    },
    APP_TEST_TIMEOUT_MS,
  )

  it(
    "market / buy orders toggle navigates between the two tabs",
    async () => {
      const app = mountApp(routes, "/market?query=laser", {
        session: "anonymous",
      })
      try {
        await app.settle()
        const toggles = [...document.querySelectorAll("button[value]")].map(
          (b) => b.getAttribute("value"),
        )
        const visited: string[] = []
        const buyOrders = document.querySelector('button[value="buyorders"]')
        if (buyOrders) {
          await act(async () => {
            fireEvent.click(buyOrders)
          })
          await app.settle()
          visited.push(
            `${app.router.state.historyAction} ${app.router.state.location.pathname}${app.router.state.location.search}`,
          )
          const market = document.querySelector('button[value="market"]')
          if (market) {
            await act(async () => {
              fireEvent.click(market)
            })
            await app.settle()
            visited.push(
              `${app.router.state.historyAction} ${app.router.state.location.pathname}${app.router.state.location.search}`,
            )
          }
        }
        expect({ toggles, visited }).toMatchSnapshot()
      } finally {
        app.unmount()
      }
    },
    APP_TEST_TIMEOUT_MS,
  )
})

// ── Part 2: primitives with the real useMarketSearch hook ──────────────────

type Api = {
  marketSearch: ReturnType<typeof useMarketSearch>
  setSearchParams: ReturnType<typeof useSearchParams>[1]
  navigate: ReturnType<typeof useNavigate>
}
let api: Api | null = null

function Harness() {
  const marketSearch = useMarketSearch()
  const [, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  api = { marketSearch, setSearchParams, navigate }
  return null
}

function mountHarness(url: string) {
  const router = createMemoryRouter(
    [
      { path: MARKET_PATHS.search, element: <Harness /> },
      { path: MARKET_PATHS.buyOrders, element: <Harness /> },
    ],
    { initialEntries: [url] },
  )
  const view = render(<RouterProvider router={router} />)
  const where = () =>
    `${router.state.historyAction} ${router.state.location.pathname}${router.state.location.search}`
  return { router, view, where }
}

describe("market search primitives", () => {
  it("parses the URL into search state", () => {
    const { view } = mountHarness(
      "/market?query=laser&kind=sale&type=weapon&sort=price&minCost=5&attr_size=4,5",
    )
    expect(api!.marketSearch[0]).toMatchSnapshot()
    view.unmount()
  })

  it("setSearchState pushes a normalized query string", async () => {
    const { view, where } = mountHarness("/market?query=laser")
    const before = where()
    await act(async () => {
      api!.marketSearch[1]((prev) => ({
        ...prev,
        query: "rifle",
        sort: "price",
        index: 2,
      }))
    })
    await waitFor(() => expect(where()).not.toBe(before))
    const afterSet = where()
    expect({ before, afterSet, state: api!.marketSearch[0] }).toMatchSnapshot()
    view.unmount()
  })

  it("setSearchParams(params, { replace: true }) replaces the entry", async () => {
    const { router, view, where } = mountHarness("/market?query=laser")
    await act(async () => {
      api!.setSearchParams(new URLSearchParams("query=rifle&has_photos=true"), {
        replace: true,
      })
    })
    await waitFor(() => expect(router.state.location.search).toContain("rifle"))
    expect(where()).toMatchInlineSnapshot(
      `"REPLACE /market?query=rifle&has_photos=true"`,
    )
    view.unmount()
  })

  it("functional setSearchParams sees the latest params", async () => {
    const { router, view, where } = mountHarness("/market?page=1")
    await act(async () => {
      api!.setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set("page", String(Number(prev.get("page")) + 1))
        return next
      })
    })
    await waitFor(() => expect(router.state.location.search).toBe("?page=2"))
    expect(where()).toMatchInlineSnapshot(`"PUSH /market?page=2"`)
    view.unmount()
  })

  it("navigate() between market tabs drops the market query", async () => {
    const { router, view, where } = mountHarness("/market?query=laser")
    await act(async () => {
      api!.navigate(MARKET_PATHS.buyOrders)
    })
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/buyorders"),
    )
    const toBuyOrders = where()
    await act(async () => {
      api!.navigate(-1)
    })
    await waitFor(() => expect(router.state.location.pathname).toBe("/market"))
    expect({ toBuyOrders, back: where() }).toMatchSnapshot()
    view.unmount()
  })
})
