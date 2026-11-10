import { describe, expect, it } from "vitest"
import {
  isMainSiteOnlyPath,
  isOrgOwned,
  mainSiteUrl,
} from "../whiteLabelRoutes"

describe("isMainSiteOnlyPath", () => {
  it.each([
    "/buyorders",
    "/buyorder/create",
    "/buyorder/abc",
    "/bulk",
    "/market/aggregate/123-laser",
    "/shops",
    "/shops/",
    "/storefronts",
    "/shopping-lists",
    "/missions/givers",
    "/mining",
    "/blueprints/inventory",
    "/resources",
    "/crafting/calculator",
    "/wiki",
    "/wiki/items/abc",
    "/contractor/OTHERORG",
    "/contractor/OTHERORG/members",
    "/user/someone",
    "/user/someone/reviews",
    "/buyorders?sort=price",
  ])("%s is served only on sc-market.space", (path) => {
    expect(isMainSiteOnlyPath(path, "MEDRUNNER")).toBe(true)
  })

  it.each([
    "/",
    "/market",
    "/market/services",
    "/market/cart",
    "/market/abc-listing",
    "/shops/medrunner",
    "/shops/medrunner/listings",
    "/contractor/MEDRUNNER",
    "/contractor/medrunner/about",
    "/contracts",
    "/orders",
    "/messages",
    "/login",
    "/marketplace",
    "/wikipedia",
  ])("%s is served on the org's domain", (path) => {
    expect(isMainSiteOnlyPath(path, "MEDRUNNER")).toBe(false)
  })

  it("does not judge org pages before the domain's org is known", () => {
    expect(isMainSiteOnlyPath("/contractor/OTHERORG", undefined)).toBe(false)
    expect(isMainSiteOnlyPath("/buyorders", undefined)).toBe(true)
  })
})

describe("isMainSiteOnlyPath: tabs the org turned off", () => {
  const off = new Set([
    "market",
    "services",
    "contracts",
    "recruiting",
    "contractors",
  ])
  it.each([
    "/market",
    "/market/category/weapons",
    "/market/services",
    "/services",
    "/contracts",
    "/contracts/create",
    "/contracts/public/abc",
    "/recruiting",
    "/recruiting/post/abc",
    "/contractors",
  ])("%s leaves when its tab is off", (path) => {
    expect(isMainSiteOnlyPath(path, "MEDRUNNER", off)).toBe(true)
    // ...and stays while it's on
    expect(isMainSiteOnlyPath(path, "MEDRUNNER")).toBe(false)
  })

  it.each(["/market/cart", "/market/abc-listing", "/contractor/MEDRUNNER"])(
    "%s (checkout, the org's own pages) stays with every tab off",
    (path) => {
      expect(isMainSiteOnlyPath(path, "MEDRUNNER", off)).toBe(false)
    },
  )
})

describe("isOrgOwned", () => {
  it("is the org's own only", () => {
    expect(isOrgOwned("MEDRUNNER", "medrunner")).toBe(true)
    expect(isOrgOwned("BWINCORP", "MEDRUNNER")).toBe(false)
    expect(isOrgOwned(null, "MEDRUNNER")).toBe(false)
    expect(isOrgOwned("MEDRUNNER", "")).toBe(false)
  })
})

describe("mainSiteUrl", () => {
  it("is the same page on sc-market.space", () => {
    expect(mainSiteUrl("/wiki/items?x=1#a")).toBe(
      "https://sc-market.space/wiki/items?x=1#a",
    )
  })
})
