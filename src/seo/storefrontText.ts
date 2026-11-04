/**
 * Crawler text for an org storefront (the edge bridge's org page summary):
 * the trust stats the org home page shows, as one plain sentence.
 * Framework-free: the bridge runs on Cloudflare.
 */
import type { OrgStorefront } from "../store/api/v2/market"
import { formatNumber } from "../util/format/format"

// English crawler text: English digits too.
function plural(n: number, one: string, many: string): string {
  return `${formatNumber(n, "en")} ${n === 1 ? one : many}`
}

/** "RSI-verified org. 23 completed orders. Rated 4.9/5 from 12 reviews. …" */
export function storefrontFacts(storefront: OrgStorefront): string {
  const t = storefront.trust
  const facts: string[] = []
  if (storefront.verified) facts.push("RSI-verified org")
  if (t.completed_orders > 0)
    facts.push(
      plural(t.completed_orders, "completed order", "completed orders"),
    )
  if (
    t.avg_rating !== null &&
    t.avg_rating !== undefined &&
    t.rating_count > 0
  ) {
    facts.push(
      `Rated ${t.avg_rating.toFixed(1)}/5 from ${plural(t.rating_count, "review", "reviews")}`,
    )
  }
  if (t.response_rate !== null && t.response_rate !== undefined) {
    facts.push(
      `${Math.round(t.response_rate)}% of orders completed within 24 hours`,
    )
  }
  if (t.members > 0)
    facts.push(`${plural(t.members, "member", "members")} on SC Market`)
  facts.push(plural(t.active_listings, "active listing", "active listings"))
  if (t.active_services > 0)
    facts.push(plural(t.active_services, "service", "services"))
  if (t.on_sc_market_since) {
    const year = new Date(t.on_sc_market_since).getUTCFullYear()
    if (Number.isFinite(year)) facts.push(`On SC Market since ${year}`)
  }
  return facts.join(". ") + "."
}
