import { describe, it, expect, beforeEach, vi } from "vitest"
import type { PrefetchDispatch } from "../dataPrefetch"

// Replace page prefetch functions with spies so matching and dedupe are
// tested without touching the API layer.
vi.mock("../../pages/wiki/prefetch", () => ({
  prefetchWikiCommodityPage: vi.fn(() => Promise.resolve()),
  prefetchWikiItemPage: vi.fn(() => Promise.resolve()),
  prefetchWikiShipPage: vi.fn(() => Promise.resolve()),
}))
vi.mock("../../pages/mining/prefetch", () => ({
  prefetchMiningOrePage: vi.fn(() => Promise.resolve()),
  prefetchMiningLocationPage: vi.fn(() => Promise.resolve()),
}))
vi.mock("../../pages/blueprints/prefetch", () => ({
  prefetchBlueprintPage: vi.fn(() => Promise.resolve()),
}))
vi.mock("../../pages/resources/prefetch", () => ({
  prefetchResourcePage: vi.fn(() => Promise.resolve()),
}))
vi.mock("../../features/market/v2/prefetch", () => ({
  prefetchListingPage: vi.fn(() => Promise.resolve()),
}))
vi.mock("../../features/shops/prefetch", () => ({
  prefetchShopPage: vi.fn(() => Promise.resolve()),
}))
vi.mock("../../features/contractor/prefetch", () => ({
  prefetchOrgPage: vi.fn(() => Promise.resolve()),
}))
vi.mock("../../features/profile/prefetch", () => ({
  prefetchUserProfilePage: vi.fn(() => Promise.resolve()),
}))

import {
  clearDataPrefetchCache,
  matchDataPrefetchRoute,
  prefetchDataForPath,
} from "../dataPrefetchRegistry"
import { prefetchListingPage } from "../../features/market/v2/prefetch"
import { prefetchShopPage } from "../../features/shops/prefetch"
import { prefetchWikiCommodityPage } from "../../pages/wiki/prefetch"

const dispatch = vi.fn() as unknown as PrefetchDispatch

describe("matchDataPrefetchRoute", () => {
  it.each([
    ["/wiki/commodities/abc", "/wiki/commodities/:id", { id: "abc" }],
    ["/wiki/items/item-1", "/wiki/items/:id", { id: "item-1" }],
    ["/wiki/ships/ship-1", "/wiki/ships/:id", { id: "ship-1" }],
    ["/mining/ores/quantanium", "/mining/ores/:name", { name: "quantanium" }],
    ["/mining/locations/aberdeen", "/mining/locations/:name", { name: "aberdeen" }],
    ["/blueprints/bp-1", "/blueprints/:slug", { slug: "bp-1" }],
    ["/resources/res-1", "/resources/:resource_id", { resource_id: "res-1" }],
    ["/market/abc123-some-title", "/market/:id", { id: "abc123-some-title" }],
    ["/shops/my-shop", "/shops/:slug", { slug: "my-shop" }],
    ["/shops/my-shop/reviews", "/shops/:slug/:tab", { slug: "my-shop", tab: "reviews" }],
    ["/contractor/SCMARKET", "/contractor/:id", { id: "SCMARKET" }],
    ["/contractor/SCMARKET/members", "/contractor/:id/:tab", { id: "SCMARKET", tab: "members" }],
    ["/user/alice", "/user/:username", { username: "alice" }],
    ["/user/alice/reviews", "/user/:username/:tab", { username: "alice", tab: "reviews" }],
  ])("matches %s to %s", (to, path, params) => {
    const match = matchDataPrefetchRoute(to)
    expect(match?.route.path).toBe(path)
    expect(match?.params).toEqual(params)
  })

  it("ignores query string and hash", () => {
    const match = matchDataPrefetchRoute("/wiki/items/item-1?tab=2#stats")
    expect(match?.route.path).toBe("/wiki/items/:id")
    expect(match?.params).toEqual({ id: "item-1" })
  })

  it("decodes params like the router does", () => {
    expect(matchDataPrefetchRoute("/mining/ores/Raw%20Ice")?.params).toEqual({
      name: "Raw Ice",
    })
  })

  it.each([
    "/market/cart",
    "/market/create",
    "/market/me",
    "/market/manage",
    "/market/manage-stock",
    "/market/services",
    "/shops/create",
    "/blueprints/inventory",
  ])("ranks the static route %s above the dynamic sibling", (to) => {
    expect(matchDataPrefetchRoute(to)).toBeNull()
  })

  it.each([
    "/",
    "/market",
    "/market/aggregate/item-1",
    "/wiki/items",
    "/mining/locations",
    "/shops/my-shop/reviews/extra",
    "/dashboard",
  ])("returns null for %s", (to) => {
    expect(matchDataPrefetchRoute(to)).toBeNull()
  })
})

describe("prefetchDataForPath", () => {
  beforeEach(() => {
    clearDataPrefetchCache()
    vi.clearAllMocks()
  })

  it("runs the matching prefetch with dispatch and route params", async () => {
    await prefetchDataForPath(dispatch, "/shops/my-shop/reviews")
    expect(prefetchShopPage).toHaveBeenCalledTimes(1)
    expect(prefetchShopPage).toHaveBeenCalledWith(dispatch, {
      slug: "my-shop",
      tab: "reviews",
    })
  })

  it("prefetches each pathname once", async () => {
    await prefetchDataForPath(dispatch, "/market/abc")
    await prefetchDataForPath(dispatch, "/market/abc")
    await prefetchDataForPath(dispatch, "/market/abc?ref=home")
    expect(prefetchListingPage).toHaveBeenCalledTimes(1)

    await prefetchDataForPath(dispatch, "/market/def")
    expect(prefetchListingPage).toHaveBeenCalledTimes(2)
  })

  it("returns the in-flight promise for repeated calls", () => {
    const first = prefetchDataForPath(dispatch, "/wiki/commodities/abc")
    const second = prefetchDataForPath(dispatch, "/wiki/commodities/abc")
    expect(second).toBe(first)
    expect(prefetchWikiCommodityPage).toHaveBeenCalledTimes(1)
  })

  it("resolves without prefetching for unmatched paths", async () => {
    await expect(prefetchDataForPath(dispatch, "/market/cart")).resolves.toBeUndefined()
    expect(prefetchListingPage).not.toHaveBeenCalled()
  })

  it("never rejects when a prefetch throws", async () => {
    vi.mocked(prefetchListingPage).mockRejectedValueOnce(new Error("boom"))
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    await expect(prefetchDataForPath(dispatch, "/market/boom")).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
