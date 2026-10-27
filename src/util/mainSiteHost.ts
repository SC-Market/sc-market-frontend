/**
 * Whether a hostname is the main SC Market site (or local dev), as opposed to
 * an org's white-label custom domain. Pure, so both the SPA and the edge
 * bridge can use it.
 */
export function isMainSiteHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "sc-market.space" ||
    hostname === "www.sc-market.space" ||
    hostname.endsWith(".localhost") ||
    // Cloudflare Pages preview deployments of this project: they preview the
    // main site (orgs' white-label domains are their own hostnames).
    hostname.endsWith(".sc-market-frontend.pages.dev")
  )
}
