import React, { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useCustomDomain } from "../../hooks/contractor/CustomDomain"
import {
  isOrgOwned,
  mainSiteUrl,
} from "../../features/storefront/whiteLabelRoutes"
import { useWhiteLabelRoutes } from "../../features/storefront/hooks/useWhiteLabelRoutes"
import { useServerHandoff } from "../../ssr/requestContext"

/**
 * Sends the browser to the current page on sc-market.space when `leave`. In
 * a server render it reports the hand-off instead, and the SSR Function
 * answers a 302 (src/ssr/pagesFunction.ts).
 */
function useLeaveForMainSite(leave: boolean): void {
  const serverHandoff = useServerHandoff()
  if (leave && serverHandoff) serverHandoff.leaving = true
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    if (leave) window.location.replace(mainSiteUrl(pathname + search + hash))
  }, [leave, pathname, search, hash])
}

/**
 * On an org's white-label domain, a page the domain does not serve (an SC
 * Market-wide page, another org's profile, a user's profile, or a tab the
 * org turned off: features/storefront/whiteLabelRoutes.ts) is not rendered
 * under the org's brand: the visitor goes to the same page on
 * sc-market.space. A server render answers a 302 for it (and renders
 * nothing, so a browser's first render would match before it leaves).
 */
export function WhiteLabelRouteGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { pathname } = useLocation()
  const leave = useWhiteLabelRoutes().leaves(pathname)
  useLeaveForMainSite(leave)
  return leave ? null : <>{children}</>
}

/**
 * For a page of something a seller owns (a listing, a shop): on an org's
 * white-label domain, only the org's own stay; another seller's goes to the
 * same page on sc-market.space. `ownerSpectrumId`: the owning org's
 * spectrum_id, null for a user seller, undefined while unknown (loading).
 * Returns whether the page is leaving (render nothing).
 */
export function useWhiteLabelOwnerHandoff(
  ownerSpectrumId: string | null | undefined,
): boolean {
  const { isCustomDomain, customOrg } = useCustomDomain()
  const leave =
    isCustomDomain &&
    !!customOrg &&
    ownerSpectrumId !== undefined &&
    !isOrgOwned(ownerSpectrumId, customOrg)
  useLeaveForMainSite(leave)
  return leave
}
