import { describe, it, expect } from "vitest"
import { matchRoutes } from "react-router-dom"
import { BRIDGE_ROUTES, matchBridgeRoute, PRERENDERED_KINDS } from "../routes"
import { BRIDGE_PAGES } from "../pages"
import { PAGINATED_PATHS, PAGINATED_PATTERNS } from "../../seo/queryIndexing"
import { GAME_DATA_HUB_PATHS, HOME_PATH } from "../../prerender/paths"
import { STATIC_SIBLING_PATHS } from "../../router/staticSiblingPaths"
import routesJson from "../../../public/_routes.json"

/**
 * Every src/routes.ts route under the bridge prefixes (plus the catch-all), so
 * react-router's own ranking decides which page a URL renders.
 */
const APP_ROUTES = [
  ...BRIDGE_ROUTES.map((r) => r.path),
  ...STATIC_SIBLING_PATHS,
  "/market/multiple/:id/edit",
  "/market/category/:name",
  "/market/create/:tab",
  "/market/stock/:listingId",
  "/wiki/refinery",
  "/recruiting/post/:post_id/update",
  "/contracts",
  "/login",
  "/help",
  "/*",
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
  "/missions/givers",
  "/missions/factions",
  "/missions/types",
  "/missions/systems",
  "/missions/givers/headhunters",
  "/missions/factions/covalex",
  "/missions/types/bounty-hunter",
  "/missions/systems/pyro",
  "/missions/givers/a/b",
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
  "/market/multiple/abc--x/edit",
  "/market/aggregate",
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
  "/contractors",
  "/user/JackedCitizen",
  "/user/JackedCitizen/reviews",
  "/user/Some%20Body",
  "/recruiting",
  "/recruiting/post/c5c4c88a-430e-4b56-a5f2-47542ad12762",
  "/recruiting/post/create",
  "/recruiting/post/abc/update",
  "/wiki",
  "/wiki/items",
  "/wiki/ships",
  "/wiki/commodities",
  "/wiki/locations",
  "/wiki/manufacturers",
  "/wiki/manufacturers/cds",
  "/wiki/manufacturers/Klaus%20%26%20Werner",
  "/wiki/refinery",
  "/mining",
  "/mining/locations",
  "/blueprints",
  "/missions",
  "/resources",
  "/wiki/items/a/b",
  "/guides",
  "/guides/buying",
  "/guides/buying/buy-an-item",
  "/guides/buying/buy-an-item/extra",
  "/about",
  "/help",
  "/",
  "/login",
  "/contracts",
  "/favicon.ico",
  "/index.html",
  "/sw.js",
  "/assets/index-abc.js",
  "/robots.txt",
]

describe("matchBridgeRoute", () => {
  it.each(PATHS)("ranks %s like react-router", (path) => {
    const ours = matchBridgeRoute(path)
    expect(
      ours ? { kind: ours.route.kind, params: ours.params } : null,
    ).toEqual(routerMatch(path))
  })

  it("never matches static siblings", () => {
    for (const path of STATIC_SIBLING_PATHS) {
      expect(matchBridgeRoute(path)).toBeNull()
    }
  })

  it("matches / only for the root itself, never a file or other page", () => {
    expect(matchBridgeRoute("/")?.route.kind).toBe("home")
    for (const path of [
      "/favicon.ico",
      "/index.html",
      "/sw.js",
      "/robots.txt",
      "/logo512.png",
      "/assets/index-abc.js",
      "/login",
      "/x/y",
    ]) {
      expect(matchBridgeRoute(path), path).toBeNull()
    }
  })

  it("decodes params like useParams", () => {
    expect(matchBridgeRoute("/user/Some%20Body")?.params).toEqual({
      username: "Some Body",
    })
    expect(
      matchBridgeRoute("/wiki/manufacturers/Klaus%20%26%20Werner")?.params,
    ).toEqual({ id: "Klaus & Werner" })
  })

  it("rejects undecodable params", () => {
    expect(matchBridgeRoute("/user/%E0%A4%A")).toBeNull()
  })
})

/** The sitemap proxy's rule (functions/[sitemap].ts). */
const SITEMAP_RULE = "/sitemap*.xml"
/**
 * Exact robots.txt, for white-label hosts' own robots (src/bridge/whiteLabelSeo.ts):
 * the sitemap route's file again, no new Function. On the main host it
 * passes straight to the static file.
 */
const ROBOTS_RULE = "/robots.txt"
const SITEMAP_ROUTE_RULES = [SITEMAP_RULE, ROBOTS_RULE]
const PAGINATED_PRERENDERED_HUBS: string[] = [
  "/wiki/items",
  "/wiki/ships",
  "/wiki/commodities",
]

describe("public/_routes.json", () => {
  const toRegex = (rule: string) =>
    new RegExp(
      `^${rule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`,
    )
  const include = routesJson.include.map(toRegex)
  const exclude = routesJson.exclude.map(toRegex)
  const invokes = (path: string) =>
    include.some((r) => r.test(path)) && !exclude.some((r) => r.test(path))

  // _routes.json rules are case-sensitive, so mixed-case URLs (which the
  // router still renders) just get the plain shell. Links and the sitemap
  // only use the lowercase prefixes.
  it("invokes the Function for every lowercase-prefix bridge route that isn't prerendered", () => {
    for (const path of PATHS.filter(
      (p) => p.split("/")[1] === p.split("/")[1].toLowerCase(),
    )) {
      const match = matchBridgeRoute(path)
      if (match && !PRERENDERED_KINDS.has(match.route.kind)) {
        expect(invokes(path), path).toBe(true)
      }
    }
  })

  // Prerendered pages are static files: Pages serves them without running
  // the Function (and it would only pass them through, see handler.ts).
  it("skips the Function for the prerendered homepage, hubs, /guides and /about", () => {
    for (const path of [
      HOME_PATH,
      ...GAME_DATA_HUB_PATHS,
      "/guides",
      "/about",
    ]) {
      if (PAGINATED_PRERENDERED_HUBS.includes(path)) continue
      expect(invokes(path), path).toBe(false)
    }
  })

  // Their ?page=N (and filter-query noindex) is served by the bridge over the
  // static file; the clean URL is still passed straight through (handler.ts).
  it("invokes it for the paginated prerendered hubs, whose kinds are paginated", () => {
    for (const path of PAGINATED_PRERENDERED_HUBS) {
      expect(invokes(path), path).toBe(true)
      const kind = matchBridgeRoute(path)!.route.kind
      expect(PRERENDERED_KINDS.has(kind), path).toBe(true)
      expect(BRIDGE_PAGES[kind].paginated, path).toBe(true)
    }
  })

  // /storefronts is a paginated hub (?page=N, PAGINATED_PATHS) but stays a
  // plain static file: no Function invocations for it (Free plan quota).
  // Its ?page=N gets the prerendered page-1 file, which the SPA renders
  // fresh (a query skips hydration) with that page's canonical and links.
  it("leaves /storefronts and its ?page=N to the static file (no Function)", () => {
    expect(invokes("/storefronts")).toBe(false)
    expect(
      BRIDGE_PAGES[matchBridgeRoute("/storefronts")!.route.kind].paginated,
    ).toBe(true)
    expect(PAGINATED_PATHS).toContain("/storefronts")
  })

  it("invokes it for the sitemap proxy and robots.txt only", () => {
    expect(invokes("/sitemap.xml")).toBe(true)
    expect(invokes("/sitemap-market-0.xml")).toBe(true)
    expect(invokes("/sitemaps")).toBe(false)
    expect(invokes("/robots.txt")).toBe(true)
    expect(invokes("/robots.txt.bak")).toBe(false)
  })

  // The hubs' detail pages stay on the bridge: only the exact hub path is
  // excluded, never "/blueprints/*" or "/missions/*".
  it("still invokes it for /blueprints and /missions detail pages", () => {
    for (const path of [
      "/blueprints/82cec6d6-7716-4318-bd49-39002e5dfa96",
      "/missions/PU_Station_WasteDisposal_Lawful",
    ]) {
      expect(invokes(path), path).toBe(true)
    }
    expect(invokes("/blueprints/inventory")).toBe(false)
  })

  it("never invokes it for assets, files, the service worker or static siblings", () => {
    for (const path of [
      "/assets/index-abc.js",
      "/assets/",
      "/sw.js",
      "/index.html",
      "/favicon.ico",
      "/logo512.png",
      "/homepage-preview.webp",
      "/manifest.webmanifest",
      "/fonts/roboto-v30-latin-regular.woff2",
      "/login",
      "/wiki/refinery",
      "/market/multiple/abc--x/edit",
      "/content/manifest.json",
      "/content/bridge/index.json",
      "/help",
    ]) {
      expect(invokes(path), path).toBe(false)
    }
    for (const path of STATIC_SIBLING_PATHS) {
      expect(invokes(path), path).toBe(false)
    }
  })

  it("has no catch-all include: every rule is an exact path or a /prefix/*", () => {
    for (const rule of routesJson.include) {
      if (SITEMAP_ROUTE_RULES.includes(rule)) continue
      expect(rule, rule).toMatch(/^\/([a-z-]+(\/[a-z-]+)*(\/\*)?)?$/)
    }
  })

  it("has a Function file for every included prefix", () => {
    const files = Object.keys(import.meta.glob("/functions/**/*.ts"))
    for (const rule of routesJson.include) {
      const segment = rule.split("/")[1]
      const file = SITEMAP_ROUTE_RULES.includes(rule)
        ? "/functions/[sitemap].ts"
        : segment
          ? `/functions/${segment}/[[path]].ts`
          : "/functions/index.ts"
      expect(files, rule).toContain(file)
    }
  })

  it("stays within Cloudflare's limits (100 rules, 100 chars each)", () => {
    const rules = [...routesJson.include, ...routesJson.exclude]
    expect(rules.length).toBeLessThanOrEqual(100)
    for (const rule of rules) expect(rule.length, rule).toBeLessThanOrEqual(100)
  })
})

describe("pagination: SPA and bridge agree", () => {
  it("PAGINATED_PATHS are exactly the paginated bridge kinds' paths", () => {
    const paginatedKinds = Object.entries(BRIDGE_PAGES)
      .filter(([, page]) => page.paginated)
      .map(([kind]) => kind)
      .sort()
    // The patterns' kinds, through one sample path each.
    const patternSamples = [
      "/missions/givers/x",
      "/missions/factions/x",
      "/missions/types/x",
      "/missions/systems/x",
    ]
    for (const path of patternSamples)
      expect(
        PAGINATED_PATTERNS.some((p) => p.test(path)),
        path,
      ).toBe(true)
    const kindsOfPaths = [...PAGINATED_PATHS, ...patternSamples]
      .map((p) => matchBridgeRoute(p)!.route.kind)
      .sort()
    expect(kindsOfPaths).toEqual(paginatedKinds)
  })
})
