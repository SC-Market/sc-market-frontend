/**
 * Org storefront (drafts/whitelabel-overhaul-plan.md): shared query args
 * and helpers for the org home page, the embeds and the edge bridge.
 * Framework-free (the bridge imports it on Cloudflare).
 */
import type { SearchListingsApiArg } from "../../store/api/v2/market"

/** Featured listings on the org home page: the newest in-stock ones of every org shop. */
export const ORG_FEATURED_LISTINGS = 8

/** The org home page's featured listings query (the bridge sends the same). */
export function orgFeaturedListingsArgs(
  spectrumId: string,
  pageSize = ORG_FEATURED_LISTINGS,
): SearchListingsApiArg {
  return {
    org: spectrumId,
    page: 1,
    pageSize,
    status: "active",
    inStock: true,
    sortBy: "updated_at",
    sortOrder: "desc",
  }
}

/**
 * The market's search args on an org's white-label domain: only the org's
 * listings (every shop it owns). Unchanged on the main site.
 */
export function orgScopedListingArgs<T extends SearchListingsApiArg>(
  args: T,
  customOrg: string | undefined,
): T {
  return customOrg ? { ...args, org: customOrg } : args
}

/** "4.9" for a 0–5 average, null without reviews. */
export function ratingLabel(avg: number | null | undefined): string | null {
  return typeof avg === "number" && Number.isFinite(avg) ? avg.toFixed(1) : null
}

/** Year the org opened its first shop, for "On SC Market since". */
export function sinceYear(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : String(d.getUTCFullYear())
}
