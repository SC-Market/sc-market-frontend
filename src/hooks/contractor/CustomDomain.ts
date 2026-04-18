// Resolve the current hostname to an org spectrum_id for white-label domains.
// Uses localStorage cache for instant resolution, revalidated by HookProvider.

const CACHE_KEY = "sc-market-domain-org"
const hostname = window.location.hostname

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
    if (cached.hostname !== hostname) return null
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
        hostname,
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

// Determine if we're on a custom domain (not the main site)
const isMainSite =
  hostname === "localhost" ||
  hostname === "sc-market.space" ||
  hostname === "www.sc-market.space" ||
  hostname.endsWith(".localhost")

const cached = getCachedDomainOrg()

/**
 * The spectrum_id of the org whose white-label domain we're on, or undefined if main site.
 */
export const CURRENT_CUSTOM_ORG: string | undefined = isMainSite
  ? undefined
  : cached?.spectrum_id

/**
 * Whether the current hostname is a custom white-label domain (not the main site).
 * True even before the domain is resolved — used to trigger resolution.
 */
export const IS_CUSTOM_DOMAIN: boolean = !isMainSite
