/**
 * The pages prerendered to static HTML at build time (Phase 3 of
 * docs/ssr-migration-design.md; freshness notes in docs/prerender.md).
 *
 * Only pages whose content is static (guides, about) or changes with the game
 * data (the game database hubs), and only where the prerendered page is at
 * least as good for crawlers as the edge bridge's (links to the entries
 * included). /blueprints and /missions stay on the bridge for now (their
 * cards and rows are links; see docs/prerender.md): /blueprints hides
 * unsourceable blueprints in the browser, so its first page of 40 shows only
 * a few of them (the bridge links 50) until the search API takes that filter;
 * /missions renders 40 links and is ready once public/_routes.json excludes
 * it. Live hubs (market, shops, recruiting,
 * contractors) and every detail page stay on the SPA shell + edge bridge.
 * Every other path is the SPA shell (__spa-fallback.html, public/_redirects).
 *
 * A route listed here must be prerendered for ALL of its paths (React Router
 * requires that of routes with a `loader`), and its route module exports
 * `loader` (src/routes/prerender.ts). public/_routes.json excludes each path
 * so the static file is served without invoking the edge bridge.
 */

/**
 * The homepage. Its live sections (latest listings, Wanted now, top rated
 * shops, stats) are not shipped: they're loading skeletons in the HTML and
 * fill in from the API in the browser (src/server/prerenderData.ts).
 */
export const HOME_PATH = "/"

/** Game database hubs: build-time data from the public v2 game-data API. */
export const GAME_DATA_HUB_PATHS = [
  "/wiki",
  "/wiki/items",
  "/wiki/ships",
  "/wiki/commodities",
  "/wiki/locations",
  "/wiki/manufacturers",
  "/wiki/refinery",
  "/mining",
  "/mining/locations",
  "/resources",
] as const

/** Help & Guides and About: content from /content, no API data. */
export const CONTENT_ROUTE_PATTERNS = [
  "/guides",
  "/guides/:category",
  "/guides/:category/:slug",
  "/about",
] as const

/** Content pages from the content build's manifest (dist/content/manifest.json). */
export function contentPaths(manifest: {
  pages: { path: string }[]
}): string[] {
  return manifest.pages
    .map((page) => page.path)
    .filter(
      (path) =>
        path === "/about" || path === "/guides" || path.startsWith("/guides/"),
    )
}
