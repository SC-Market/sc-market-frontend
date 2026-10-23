import { describe, it, expect } from "vitest"
import { matchRoutes } from "react-router-dom"
import { BRIDGE_ROUTES, matchBridgeRoute } from "../routes"
import { STATIC_SIBLING_PATHS } from "../../router/staticSiblingPaths"
import routesJson from "../../../public/_routes.json"

/**
 * Every src/App.tsx route under the bridge prefixes, so react-router's own
 * ranking decides which page a URL renders.
 */
const APP_ROUTES = [
  ...BRIDGE_ROUTES.map((r) => r.path),
  ...STATIC_SIBLING_PATHS,
  "/market",
  "/market/aggregate/:id",
  "/market/multiple/:id",
  "/market/multiple/:id/edit",
  "/market/category/:name",
  "/market/create/:tab",
  "/market/stock/:listingId",
  "/shops",
  "/blueprints",
  "/missions",
  "/resources",
  "/mining/locations",
  "/wiki/items",
  "/wiki/ships",
  "/wiki/commodities",
  "/recruiting/post/:post_id/update",
]

function routerMatch(pathname: string) {
  const matches = matchRoutes(
    APP_ROUTES.map((path) => ({ path })),
    pathname,
  )
  const match = matches?.[matches.length - 1]
  const route = BRIDGE_ROUTES.find((r) => r.path === match?.route.path)
  return route && match ? { kind: route.kind, params: match.params } : null
}

const PATHS = [
  "/wiki/commodities/5db940a8--gold",
  "/wiki/items/38fc7b63--lifecure-medsticks",
  "/wiki/ships/57e51d27--crusader-intrepid",
  "/mining/ores/beryl_raw",
  "/mining/locations/stanton1b",
  "/blueprints/82cec6d6-7716-4318-bd49-39002e5dfa96",
  "/blueprints/inventory",
  "/missions/PU_Station_WasteDisposal_Lawful",
  "/resources/5db940a8--gold",
  "/market/71012eb4--une-unification-war-medal-pristine",
  "/market/cart",
  "/market/create",
  "/market/me",
  "/market/manage",
  "/market/manage-stock",
  "/market/services",
  "/market/aggregate/abc--x",
  "/market/multiple/abc--x",
  "/market/category/weapons",
  "/market/create/item",
  "/market/stock/123",
  "/market",
  "/market/",
  "/MARKET/CART",
  "/Market/abc--x",
  "/market/abc--x/",
  "/shops/hades-svk-shop",
  "/shops/hades-svk-shop/reviews",
  "/shops/create",
  "/shops",
  "/contractor/NARCO",
  "/contractor/NARCO/members",
  "/user/JackedCitizen",
  "/user/JackedCitizen/reviews",
  "/user/Some%20Body",
  "/recruiting/post/c5c4c88a-430e-4b56-a5f2-47542ad12762",
  "/recruiting/post/create",
  "/recruiting/post/abc/update",
  "/wiki/items",
  "/mining/locations",
  "/wiki/items/a/b",
  "/",
]

describe("matchBridgeRoute", () => {
  it.each(PATHS)("ranks %s like react-router", (path) => {
    const ours = matchBridgeRoute(path)
    expect(ours ? { kind: ours.route.kind, params: ours.params } : null).toEqual(
      routerMatch(path),
    )
  })

  it("never matches static siblings", () => {
    for (const path of STATIC_SIBLING_PATHS) {
      expect(matchBridgeRoute(path)).toBeNull()
    }
  })

  it("decodes params like useParams", () => {
    expect(matchBridgeRoute("/user/Some%20Body")?.params).toEqual({ username: "Some Body" })
  })

  it("rejects undecodable params", () => {
    expect(matchBridgeRoute("/user/%E0%A4%A")).toBeNull()
  })
})

describe("public/_routes.json", () => {
  const toRegex = (rule: string) =>
    new RegExp(`^${rule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`)
  const include = routesJson.include.map(toRegex)
  const exclude = routesJson.exclude.map(toRegex)
  const invokes = (path: string) =>
    include.some((r) => r.test(path)) && !exclude.some((r) => r.test(path))

  // _routes.json rules are case-sensitive, so mixed-case URLs (which the
  // router still renders) just get the plain shell. Links and the sitemap
  // only use the lowercase prefixes.
  it("invokes the Function for every lowercase-prefix bridge route", () => {
    for (const path of PATHS.filter((p) => p.split("/")[1] === p.split("/")[1].toLowerCase())) {
      if (matchBridgeRoute(path)) expect(invokes(path), path).toBe(true)
    }
  })

  it("never invokes it for assets, the service worker or static siblings", () => {
    for (const path of ["/assets/index-abc.js", "/sw.js", "/", "/index.html", "/favicon.ico"]) {
      expect(invokes(path), path).toBe(false)
    }
    for (const path of STATIC_SIBLING_PATHS) {
      expect(invokes(path), path).toBe(false)
    }
  })

  it("stays within Cloudflare's 100-rule limit", () => {
    expect(routesJson.include.length + routesJson.exclude.length).toBeLessThanOrEqual(100)
  })
})
