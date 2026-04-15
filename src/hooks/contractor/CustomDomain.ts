// Resolve the current hostname to an org spectrum_id for white-label domains.
// Uses localStorage cache for instant resolution, revalidated by HookProvider.

const CACHE_KEY = "sc-market-domain-org"
const hostname = window.location.hostname

// Legacy hardcoded fallback (used until cache is populated)
const legacyDomains = new Map<string, string>()
legacyDomains.set("bwsc.sc-market.space", "BWINCORP")
legacyDomains.set("medrunner.sc-market.space", "MEDRUNNER")
legacyDomains.set("redscar.sc-market.space", "RSNM")

interface CachedDomainOrg {
  spectrum_id: string
  contractor_id: string
  name: string
  hostname: string
  fetched_at: number
}

function getCachedDomainOrg(): CachedDomainOrg | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: CachedDomainOrg = JSON.parse(raw)
    // Only use if it matches current hostname
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
}): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...data, hostname, fetched_at: Date.now() }),
    )
  } catch {
    // silently fail
  }
}

// Determine if we're on a custom domain (not the main site)
const isMainSite =
  hostname === "localhost" ||
  hostname === "sc-market.space" ||
  hostname === "www.sc-market.space" ||
  hostname.endsWith(".localhost")

// Resolve: try cache first, then legacy fallback
const cached = getCachedDomainOrg()
const legacyId = legacyDomains.get(hostname)

/**
 * The spectrum_id of the org whose white-label domain we're on, or undefined if main site.
 */
export const CURRENT_CUSTOM_ORG: string | undefined = isMainSite
  ? undefined
  : cached?.spectrum_id ?? legacyId

/**
 * Whether the current hostname is a custom white-label domain (not the main site).
 * True even before the domain is resolved — used to trigger resolution.
 */
export const IS_CUSTOM_DOMAIN: boolean = !isMainSite
