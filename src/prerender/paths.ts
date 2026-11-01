/**
 * The pages prerendered to static HTML at build time (Phase 3 of
 * docs/ssr-migration-design.md; freshness notes in docs/prerender.md).
 *
 * Only pages whose content is static (guides, about, changelog) or changes with the game
 * data (the game database hubs), and only where the prerendered page is at
 * least as good for crawlers as the edge bridge's (links to the entries
 * included). /blueprints (40 links: "Hide Unsourceable", on by default, is
 * the search API's `sourceable=true`) and /missions (40 links) ship their
 * first page; their detail pages stay on the bridge. The mission hubs
 * (/missions/<kind> and every /missions/<kind>/<slug>) are prerendered too. Live hubs (market, shops, recruiting,
 * contractors) and every detail page stay on the SPA shell + edge bridge.
 * Every other path is the SPA shell (__spa-fallback.html, public/_redirects).
 *
 * A route listed here must be prerendered for ALL of its paths (React Router
 * requires that of routes with a `loader`), and its route module exports
 * `loader` (src/routes/prerender.ts). public/_routes.json excludes each path
 * so the static file is served without invoking the edge bridge.
 */

import { SSR_PLACEHOLDER_SEGMENT } from "../ssr/routePlaceholders"

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
  "/blueprints",
  "/missions",
  "/missions/givers",
  "/missions/factions",
  "/missions/types",
  "/missions/systems",
  "/resources",
] as const

/**
 * Mission hub pages (/missions/<kind>/<slug>): one per hub of the active
 * LIVE version, listed by the API at build time
 * (missionHubPaths.node.ts). Each ships its first page of missions; `?page=N`
 * is served by the bridge over the static file (handler.ts). A hub that
 * appears after a game-data import has no file until the next deploy (the
 * SPA renders it).
 */
export function missionHubPaths(hubs: {
  givers: { slug: string }[]
  factions: { slug: string }[]
  types: { slug: string }[]
  systems: { slug: string }[]
}): string[] {
  return (["givers", "factions", "types", "systems"] as const).flatMap((kind) =>
    hubs[kind].map((hub) => `/missions/${kind}/${encodeURIComponent(hub.slug)}`),
  )
}

/**
 * Not pages: one path per mission hub route, so the routes may export a
 * `loader` even when a build prerenders no hub (React Router requires a
 * prerendered path for every route with one). entry.server.tsx answers
 * them with a stub and scripts/build/finalize.ts deletes their files.
 */
export const MISSION_HUB_ROUTE_PLACEHOLDERS: readonly string[] = (
  ["givers", "factions", "types", "systems"] as const
).map((kind) => `/missions/${kind}/${SSR_PLACEHOLDER_SEGMENT}`)

/**
 * Help & Guides, About and the changelog: content from /content, no API
 * data. The changelog is one route with an optional segment, so its route
 * has a prerendered path (/changelog) even before an entry is published.
 */
export const CONTENT_ROUTE_PATTERNS = [
  "/guides",
  "/guides/:category",
  "/guides/:category/:slug",
  "/about",
  "/changelog/:slug?",
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
