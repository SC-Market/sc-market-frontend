/**
 * Help & Guides URLs that moved. Each old path answers with a 301 to its new
 * path: at the edge (src/bridge/handler.ts; Cloudflare Pages skips
 * public/_redirects for paths a Function serves, and /guides/* is one), and
 * in the SPA (GuidePage / GuideCategory) for client-side navigations.
 *
 * Pure (no content import): shared by the SPA, the bridge and the build. The
 * content build fails if a target isn't a live page or a source still is one,
 * so an old URL can never be both redirected and in the manifest/sitemap.
 *
 * Never remove an entry: old URLs live on in search results and bookmarks.
 */
export const GUIDE_REDIRECTS: Readonly<Record<string, string>> = {
  // 2026-10: hub rebalanced into 6 categories of 2-5 guides.
  "/guides/safety": "/guides/getting-started",
  "/guides/safety/trade-safely": "/guides/getting-started/trade-safely",
  "/guides/orders": "/guides/buying",
  "/guides/orders/how-orders-work": "/guides/buying/how-orders-work",
  "/guides/orders/handle-orders-as-a-seller": "/guides/selling/handle-orders-as-a-seller",
  "/guides/orgs/org-shop": "/guides/org-storefront/org-shop",
  "/guides/orgs/recruiting": "/guides/org-storefront/recruiting",
  "/guides/orgs/white-label": "/guides/org-storefront/white-label",
  "/guides/orgs/white-label-theme": "/guides/org-storefront/white-label-theme",
}

const BY_LOWERCASE = new Map(Object.entries(GUIDE_REDIRECTS).map(([from, to]) => [from.toLowerCase(), to]))

/**
 * The new path for a moved Help & Guides pathname (percent-encoded, as in
 * `URL.pathname`), or null. Case-insensitive and ignores a trailing slash,
 * like the route matching.
 */
export function guideRedirectTarget(pathname: string): string | null {
  const key = pathname.replace(/\/+$/, "").toLowerCase()
  return BY_LOWERCASE.get(key) ?? null
}
