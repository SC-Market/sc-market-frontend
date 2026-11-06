/**
 * Org storefront (drafts/whitelabel-overhaul-plan.md): shared query args
 * and helpers for the org home page, the embeds and the edge bridge.
 * Framework-free (the bridge imports it on Cloudflare).
 */
import type {
  GetStorefrontsApiArg,
  SearchListingsApiArg,
} from "../../store/api/v2/market"

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

/** Cards per page of the Storefronts hub (/storefronts?page=N); the bridge reads the same pages. */
export const STOREFRONTS_PAGE_SIZE = 24

/**
 * The Storefronts hub's query for `page`, optionally only orgs with `field`.
 * The homepage row asks for page 1 with these same args, so the two share
 * one cache entry (and the prerendered data of both pages).
 */
export function storefrontsHubArgs(
  page = 1,
  field?: string | null,
  pageSize = STOREFRONTS_PAGE_SIZE,
): GetStorefrontsApiArg {
  return field ? { page, pageSize, field } : { page, pageSize }
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

/**
 * An org registered through its RSI org page (SC Market's verification):
 * its spectrum ID is RSI's, not a "~" custom identifier (test orgs are
 * "~TEST…"). Same rule as the backend's isRsiVerifiedOrg.
 */
export function isRsiVerifiedSpectrumId(
  spectrumId: string | null | undefined,
): boolean {
  return !!spectrumId && !spectrumId.startsWith("~")
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
