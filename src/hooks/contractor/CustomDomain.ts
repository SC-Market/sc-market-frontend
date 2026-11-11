import { createContext, useContext } from "react"
import { isMainSiteHostname } from "../../util/mainSiteHost"

// Resolve the current hostname to an org spectrum_id for white-label domains.
// Uses localStorage cache for instant resolution; useResolvedCustomDomain
// (HookProvider) asks the API on every load and applies its answer.

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

const domainOrgListeners = new Set<() => void>()

/**
 * Call `listener` whenever this page's domain answer is cached or dropped
 * (the browser's white-label head re-resolves then). Returns the unsubscribe.
 */
export function onDomainOrgChange(listener: () => void): () => void {
  domainOrgListeners.add(listener)
  return () => {
    domainOrgListeners.delete(listener)
  }
}

function notifyDomainOrgChange(): void {
  for (const listener of domainOrgListeners) listener()
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
  notifyDomainOrgChange()
}

export function getWhiteLabelConfig(): WhiteLabelDomainConfig | null {
  return getCachedDomainOrg()
}

/** Forget the cached domain answer (the API says this host is no org's). */
export function clearDomainOrg(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // silently fail
  }
  notifyDomainOrgChange()
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
 * and the domain cache. Browser-only; it is the first render's answer
 * (HookProvider, through useResolvedCustomDomain, which then asks the API and
 * updates the page when the answer differs: on a first visit there is no
 * cache yet, so the page must not stay the main site).
 * The build-time render of a prerendered page (src/prerender/paths.ts) is the
 * main site: prerendered pages are only hydrated on the main site
 * (entry.client.tsx renders them from scratch on white-label domains).
 */
export function resolveBrowserCustomDomain(): CustomDomain {
  if (typeof window === "undefined") return MAIN_SITE
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
