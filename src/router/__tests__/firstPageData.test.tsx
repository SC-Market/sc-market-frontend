import React from "react"
import { render, screen, waitFor, act } from "@testing-library/react"
import { Provider } from "react-redux"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// The real profile endpoints (the dashboard reads the seeded profile).
vi.unmock("../../features/profile/api/profileApi")

import { makeStore } from "../../store/store"
import { browserNetworkEnv } from "../../store/browserNetworkEnv"
import { resetSessionCheck } from "../../store/sessionCheck"
import { resetRefreshBackoff } from "../../store/refreshAuth"
import { userApi } from "../../features/profile/api/profileApi"
import { prefetchFirstPageData } from "../firstPageData"
import { useGetPublicServicesQuery } from "../../features/services/api/servicesApi"
import { useSearchListingsQuery } from "../../store/api/v2/market"
import { listingSearchArgs } from "../../features/market/v2/listingSearchArgs"
import { SERVICE_LISTINGS_PAGE_SIZE } from "../../components/skeletons/ServiceListingSkeleton"
import type { UserProfileState } from "../../hooks/login/UserProfile"

/**
 * The first-page prefetch must send exactly the request the page's own
 * component sends: the component then reuses the cache entry, and the page
 * makes one request, not two.
 */

type Route = () => Response
let routes: Record<string, Route>
let requests: string[]

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function fakeFetch(input: RequestInfo | URL, init?: RequestInit) {
  const request = input instanceof Request ? input : null
  const url = new URL(request ? request.url : String(input))
  const method = (request?.method ?? init?.method ?? "GET").toUpperCase()
  requests.push(`${method} ${url.pathname}${url.search}`)
  const route = routes[`${method} ${url.pathname}`]
  return Promise.resolve(route ? route() : json(404, { error: "Not found" }))
}

let originalFetch: typeof fetch

beforeEach(() => {
  resetSessionCheck()
  resetRefreshBackoff()
  requests = []
  routes = {
    "GET /api/auth/session": () => json(200, { authenticated: false }),
  }
  originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn(fakeFetch) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

function env(isMobile = false, mainSite = true) {
  return { isMobile, mainSite, session: browserNetworkEnv.checkSession() }
}

const paths = () => requests.map((r) => r.split("?")[0])

describe("prefetchFirstPageData", () => {
  it("/market/services: ServiceListings reuses the prefetched first page", async () => {
    routes["GET /api/services/public"] = () =>
      json(200, {
        data: {
          data: [],
          pagination: {
            currentPage: 0,
            pageSize: 20,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      })
    const store = makeStore({ networkEnv: browserNetworkEnv })
    await prefetchFirstPageData(
      store,
      { pathname: "/market/services", search: "" },
      env(),
    )
    function Probe() {
      // ServiceListings' first-render args.
      const { data, isFetching } = useGetPublicServicesQuery({
        page: 0,
        pageSize: SERVICE_LISTINGS_PAGE_SIZE,
        sortBy: "timestamp",
        sortOrder: "desc",
      })
      return <span data-testid="p">{`${!!data}:${isFetching}`}</span>
    }
    render(
      <Provider store={store}>
        <Probe />
      </Provider>,
    )
    expect(screen.getByTestId("p").textContent).toBe("true:false")
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(paths().filter((p) => p === "GET /api/services/public")).toHaveLength(1)
  })

  it.each([
    ["/market", "", false],
    ["/market", "?text=laser&page=2&sort=price", true],
    ["/market/category/armor", "?item_type=Helmet", false],
  ])(
    "%s%s (mobile %s): ListingSearchV2's request, sent once",
    async (pathname, search, isMobile) => {
      routes["GET /api/v2/listings/search"] = () =>
        json(200, { listings: [], total: 0, page: 1, page_size: 48 })
      const store = makeStore({ networkEnv: browserNetworkEnv })
      await prefetchFirstPageData(store, { pathname, search }, env(isMobile))
      function Probe() {
        const args = listingSearchArgs(new URLSearchParams(search), isMobile)
        const { data, isFetching } = useSearchListingsQuery(args)
        return <span data-testid="p">{`${!!data}:${isFetching}`}</span>
      }
      render(
        <Provider store={store}>
          <Probe />
        </Provider>,
      )
      expect(screen.getByTestId("p").textContent).toBe("true:false")
      await act(() => new Promise((r) => setTimeout(r, 20)))
      const searches = requests.filter((r) =>
        r.startsWith("GET /api/v2/listings/search"),
      )
      expect(searches).toHaveLength(1)
      expect(searches[0]).toContain(`page_size=${isMobile ? 12 : 48}`)
    },
  )

  it("/: the hero and top shops queries; nothing on a white-label domain", async () => {
    const store = makeStore({ networkEnv: browserNetworkEnv })
    await prefetchFirstPageData(
      store,
      { pathname: "/", search: "" },
      env(false, false),
    )
    expect(paths()).not.toContain("GET /api/v2/listings/search")

    await prefetchFirstPageData(
      makeStore({ networkEnv: browserNetworkEnv }),
      { pathname: "/", search: "" },
      env(),
    )
    expect(paths()).toEqual(
      expect.arrayContaining([
        "GET /api/market/stats",
        "GET /api/v2/listings/search",
        "GET /api/v2/buy-orders/search",
        "GET /api/v2/shops",
      ]),
    )
  })

  describe("/dashboard", () => {
    const profile = { username: "tester", role: "user" } as UserProfileState

    function seededStore() {
      const store = makeStore({ networkEnv: browserNetworkEnv })
      void store.dispatch(
        userApi.util.upsertQueryData(
          "profileGetUserProfile",
          undefined,
          profile,
        ),
      )
      return store
    }

    it("signed in with a cached profile: assigned orders and received offers", async () => {
      routes["GET /api/auth/session"] = () =>
        json(200, { authenticated: true })
      await prefetchFirstPageData(
        seededStore(),
        { pathname: "/dashboard", search: "" },
        env(),
      )
      const orders = requests.find((r) => r.startsWith("GET /api/orders/search"))
      const offers = requests.find((r) => r.startsWith("GET /api/offers/search"))
      expect(orders).toContain("assigned=tester")
      expect(orders).toContain("status=active")
      expect(offers).toContain("assigned=tester")
      expect(offers).toContain("status=to-seller")
    })

    it("anonymous (stale cache): no auth-only request", async () => {
      await prefetchFirstPageData(
        seededStore(),
        { pathname: "/dashboard", search: "" },
        env(),
      )
      await waitFor(() => expect(paths()).toEqual(["GET /api/auth/session"]))
    })

    it("no cached profile: nothing (the args need the username)", async () => {
      routes["GET /api/auth/session"] = () =>
        json(200, { authenticated: true })
      await prefetchFirstPageData(
        makeStore({ networkEnv: browserNetworkEnv }),
        { pathname: "/dashboard", search: "" },
        env(),
      )
      expect(paths()).toEqual(["GET /api/auth/session"])
    })
  })
})
