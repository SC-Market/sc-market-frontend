/**
 * Page data prefetch functions against a real store: each test asserts the
 * cache holds fulfilled entries for exactly the args the page's components
 * pass to their hooks (selected with those args), and that no subscription
 * is left behind.
 */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import { serviceApi } from "../../store/service"
import { generatedApi } from "../../store/generatedApi"
import { generatedApiV2 } from "../../store/generatedApiV2"
import { marketV2Api } from "../../store/api/v2/market"
import { contractorsApi } from "../../features/contractor/api/contractorApi"
import { recruitingApi } from "../../features/recruiting/api/recruitingApi"
import type { StoreExtra } from "../../store/networkEnv"
import { prefetchWikiCommodityPage } from "../../pages/wiki/prefetch"
import { prefetchListingPage } from "../../features/market/v2/prefetch"
import { prefetchShopPage } from "../../features/shops/prefetch"
import { prefetchOrgPage } from "../../features/contractor/prefetch"

/**
 * Same slices as src/store/store.ts. The V2 slot uses marketV2Api (the
 * enhanced generatedApiV2, same reducer at runtime) so its typed selectors
 * accept this store's state. Like makeStore(), it passes a NetworkEnv as the
 * thunk extra argument (anonymous: no cookies, no refresh).
 */
function makeTestStore() {
  const extra: StoreExtra = {
    networkEnv: {
      credentials: "omit",
      headers: {},
      onUnauthorized: async () => false,
    },
  }
  return configureStore({
    reducer: {
      [serviceApi.reducerPath]: serviceApi.reducer,
      [generatedApi.reducerPath]: generatedApi.reducer,
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (gDM) =>
      gDM({ thunk: { extraArgument: extra } }).concat(
        serviceApi.middleware,
        generatedApi.middleware,
        marketV2Api.middleware,
      ),
  })
}
type TestStore = ReturnType<typeof makeTestStore>

/** Respond to API requests by pathname suffix; anything else is a 404. */
function mockApi(routes: Record<string, unknown>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    const match = Object.keys(routes).find((suffix) => url.pathname.endsWith(suffix))
    if (match === undefined) {
      return new Response(JSON.stringify({ message: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }
    return new Response(JSON.stringify(routes[match]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

function requestedPaths(fetchMock: ReturnType<typeof mockApi>): string[] {
  return fetchMock.mock.calls.map(([input]) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    return url.pathname + url.search
  })
}

interface SubscriptionSelectors {
  getSubscriptions: () => Map<string, Map<string, unknown>>
}

/** Live subscription count, read from RTK Query's subscription middleware. */
function subscriptionCount(
  store: TestStore,
  api: typeof serviceApi | typeof generatedApiV2,
): number {
  const selectors = store.dispatch(
    api.internalActions.internal_getRTKQSubscriptions(),
  ) as unknown as SubscriptionSelectors
  let count = 0
  selectors.getSubscriptions().forEach((byRequest) => {
    count += byRequest.size
  })
  return count
}

function expectNoSubscriptions(store: TestStore) {
  expect(subscriptionCount(store, generatedApiV2)).toBe(0)
  expect(subscriptionCount(store, serviceApi)).toBe(0)
}

describe("page data prefetch", () => {
  let store: TestStore

  beforeEach(() => {
    store = makeTestStore()
  })

  it("wiki commodity: resource, then ores searched by the resolved name", async () => {
    const fetchMock = mockApi({
      "/game-data/resources/agricium": {
        resource: { resource_id: "res-1", resource_name: "Agricium" },
        blueprints_requiring: [],
      },
      "/game-data/mining/ores": { ores: [], total: 0 },
    })

    await prefetchWikiCommodityPage(store.dispatch, { id: "agricium" })

    const state = store.getState()
    expect(
      marketV2Api.endpoints.getResource.select({ resourceId: "agricium" })(state)
        .status,
    ).toBe("fulfilled")
    // MiningDataSection: useSearchOresQuery({ text: resourceName, pageSize: 5 })
    expect(
      marketV2Api.endpoints.searchOres.select({ text: "Agricium", pageSize: 5 })(
        state,
      ).status,
    ).toBe("fulfilled")
    expect(requestedPaths(fetchMock)).toHaveLength(2)
    expectNoSubscriptions(store)
  })

  it("wiki commodity: stops after a failed resource lookup", async () => {
    const fetchMock = mockApi({})

    await prefetchWikiCommodityPage(store.dispatch, { id: "missing" })

    expect(requestedPaths(fetchMock)).toEqual(["/api/v2/game-data/resources/missing"])
    expectNoSubscriptions(store)
  })

  it("listing: detail, then seller/item sections from the resolved listing", async () => {
    const fetchMock = mockApi({
      "/listings/abc": {
        listing: { listing_id: "listing-1", title: "Gun", sale_type: "auction" },
        seller: { shop_id: "shop-1", slug: "acme", name: "Acme" },
        items: [
          {
            game_item: { id: "item-1", name: "Gun", type: "Weapon" },
            variants: [{ price: 100, quantity: 1, attributes: {}, locations: [] }],
          },
        ],
      },
      "/shops/shop-1/reviews": { reviews: [], total: 0 },
      "/analytics/price-history": { data: [] },
      "/listings/search": { listings: [], total: 0 },
      "/auctions/listing-1": { listing_id: "listing-1" },
    })

    await prefetchListingPage(store.dispatch, { id: "abc" })

    const state = store.getState()
    const status = (s: { status: string }) => s.status
    expect(status(marketV2Api.endpoints.getListingDetail.select({ id: "abc" })(state))).toBe(
      "fulfilled",
    )
    // SellerReviews
    expect(
      status(
        marketV2Api.endpoints.getShopReviews.select({ shopId: "shop-1", pageSize: 3 })(state),
      ),
    ).toBe("fulfilled")
    // AggregateMarketDataV2
    expect(
      status(marketV2Api.endpoints.getPriceHistory.select({ gameItemId: "item-1" })(state)),
    ).toBe("fulfilled")
    // SellerOtherListingsV2
    expect(
      status(
        marketV2Api.endpoints.searchListings.select({
          shopSlug: "acme",
          pageSize: 8,
          sortBy: "created_at",
          sortOrder: "desc",
        })(state),
      ),
    ).toBe("fulfilled")
    // RelatedListingsV2
    expect(
      status(
        marketV2Api.endpoints.searchListings.select({
          itemType: "Weapon",
          pageSize: 8,
          sortBy: "created_at",
          sortOrder: "desc",
        })(state),
      ),
    ).toBe("fulfilled")
    // BidAreaV2 (auction)
    expect(
      status(marketV2Api.endpoints.getAuctionDetail.select({ listingId: "listing-1" })(state)),
    ).toBe("fulfilled")
    // Seller-only ListingOrdersSection is not prefetched
    expect(
      status(marketV2Api.endpoints.getOrdersByListing.select({ listingId: "listing-1" })(state)),
    ).toBe("uninitialized")
    expect(fetchMock).toHaveBeenCalledTimes(6)
    expectNoSubscriptions(store)
  })

  it("shop: listings tab prefetches the first listings page; other tabs don't", async () => {
    mockApi({
      "/shops/acme": { shop_id: "shop-1", slug: "acme", name: "Acme" },
      "/shops/shop-1/reviews": { reviews: [], total: 0 },
      "/listings/search": { listings: [], total: 0 },
    })
    const listingsArgs = {
      shopSlug: "acme",
      page: 1,
      pageSize: 24,
      sortBy: "created_at",
      sortOrder: "desc",
    } as const

    await prefetchShopPage(store.dispatch, { slug: "acme", tab: "about" })
    let state = store.getState()
    expect(marketV2Api.endpoints.getShop.select({ slug: "acme" })(state).status).toBe(
      "fulfilled",
    )
    expect(
      marketV2Api.endpoints.getShopReviews.select({ shopId: "shop-1", pageSize: 200 })(state)
        .status,
    ).toBe("fulfilled")
    expect(marketV2Api.endpoints.searchListings.select(listingsArgs)(state).status).toBe(
      "uninitialized",
    )

    await prefetchShopPage(store.dispatch, { slug: "acme" })
    state = store.getState()
    expect(marketV2Api.endpoints.searchListings.select(listingsArgs)(state).status).toBe(
      "fulfilled",
    )
    expectNoSubscriptions(store)
  })

  it("org: contractor, then every preloaded tab keyed on the resolved spectrum id", async () => {
    mockApi({
      "/api/contractors/scm": { data: { spectrum_id: "SCM", name: "SC Market" } },
      "/api/recruiting/contractors/SCM/posts": { data: { post_id: "post-1" } },
      "/api/recruiting/posts/post-1/comments": { data: [] },
      "/shops/by-owner": [],
      "/api/contractors/SCM/members": { data: { total: 0, page: 0, page_size: 50, members: [] } },
      "/api/contractors/SCM/reviews": { data: [] },
    })

    await prefetchOrgPage(store.dispatch, { id: "scm" })

    const state = store.getState()
    expect(contractorsApi.endpoints.getContractorBySpectrumID.select("scm")(state).status).toBe(
      "fulfilled",
    )
    expect(recruitingApi.endpoints.recruitingGetPostByOrg.select("SCM")(state).status).toBe(
      "fulfilled",
    )
    expect(
      recruitingApi.endpoints.recruitingGetPostCommentsByID.select("post-1")(state).status,
    ).toBe("fulfilled")
    // OrgStoreView passes { username: undefined, spectrumId }; same cache entry
    expect(
      marketV2Api.endpoints.getShopsByOwner.select({ username: undefined, spectrumId: "SCM" })(
        state,
      ).status,
    ).toBe("fulfilled")
    // MemberList's first-render args
    expect(
      contractorsApi.endpoints.getContractorMembers.select({
        spectrum_id: "SCM",
        page: 0,
        page_size: 50,
        search: "",
        role_filter: "",
        sort: "username",
      })(state).status,
    ).toBe("fulfilled")
    expect(contractorsApi.endpoints.getContractorReviews.select("SCM")(state).status).toBe(
      "fulfilled",
    )
    expectNoSubscriptions(store)
  })
})
