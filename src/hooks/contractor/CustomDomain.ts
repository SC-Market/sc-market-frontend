import { createContext, useContext } from "react"

// Resolve the current hostname to an org spectrum_id for white-label domains.
// Uses localStorage cache for instant resolution, revalidated by HookProvider.

const CACHE_KEY = "sc-market-domain-org"

export interface WhiteLabelDomainConfig {
  spectrum_id: string
  contractor_id: string
  name: string
  hostname: string
  fetched_at: number
  focus_mode: "public" | "internal"
  homepage_path: string | null
  require_membership: boolean
}

function getCachedDomainOrg(): WhiteLabelDomainConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: WhiteLabelDomainConfig = JSON.parse(raw)
    if (cached.hostname !== window.location.hostname) return null
    return cached
  } catch {
    return null
  }
}

export function cacheDomainOrg(data: {
  spectrum_id: string
  contractor_id: string
  name: string
  focus_mode?: string
  homepage_path?: string | null
  require_membership?: boolean
}): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ...data,
        hostname: window.location.hostname,
        fetched_at: Date.now(),
        focus_mode: data.focus_mode || "public",
        homepage_path: data.homepage_path || null,
        require_membership: data.require_membership || false,
      }),
    )
  } catch {
    // silently fail
  }
}

export function getWhiteLabelConfig(): WhiteLabelDomainConfig | null {
  return getCachedDomainOrg()
}

function isMainSiteHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "sc-market.space" ||
    hostname === "www.sc-market.space" ||
    hostname.endsWith(".localhost")
  )
}

export interface CustomDomain {
  /**
   * Whether the hostname is a custom white-label domain (not the main site).
   * True even before the domain is resolved — used to trigger resolution.
   */
  isCustomDomain: boolean
  /** spectrum_id of the org whose white-label domain we're on, or undefined on the main site. */
  customOrg: string | undefined
}

const MAIN_SITE: CustomDomain = { isCustomDomain: false, customOrg: undefined }

/**
 * Resolve the white-label domain for the current page from `window.location`
 * and the domain cache. Browser-only; HookProvider calls it once per mount and
 * provides the result, so it stays fixed for the page's lifetime — background
 * revalidation updates the cache for the next load, not the current one.
 * A server render will provide a value derived from the request Host instead.
 */
export function resolveBrowserCustomDomain(): CustomDomain {
  const isCustomDomain = !isMainSiteHostname(window.location.hostname)
  return {
    isCustomDomain,
    customOrg: isCustomDomain ? getCachedDomainOrg()?.spectrum_id : undefined,
  }
}

/**
 * Provided by HookProvider. Trees rendered outside it (unit tests) get the
 * main site.
 */
export const CustomDomainContext = createContext<CustomDomain>(MAIN_SITE)

export function useCustomDomain(): CustomDomain {
  return useContext(CustomDomainContext)
}
