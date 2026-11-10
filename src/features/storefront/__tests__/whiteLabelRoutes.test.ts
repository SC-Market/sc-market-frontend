import { describe, expect, it } from "vitest"
import { isMainSiteOnlyPath, mainSiteUrl } from "../whiteLabelRoutes"

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

describe("mainSiteUrl", () => {
  it("is the same page on sc-market.space", () => {
    expect(mainSiteUrl("/wiki/items?x=1#a")).toBe(
      "https://sc-market.space/wiki/items?x=1#a",
    )
  })
})
