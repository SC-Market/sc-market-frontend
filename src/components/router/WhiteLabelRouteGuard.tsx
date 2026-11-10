import React, { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useCustomDomain } from "../../hooks/contractor/CustomDomain"
import {
  isMainSiteOnlyPath,
  mainSiteUrl,
} from "../../features/storefront/whiteLabelRoutes"

/**
 * On an org's white-label domain, a page the domain does not serve (an SC
 * Market-wide page or another org's profile, features/storefront/
 * whiteLabelRoutes.ts) is not rendered under the org's brand: the visitor
 * goes to the same page on sc-market.space. A server render renders nothing
 * for it, so the browser's first render matches before it leaves.
 */
export function WhiteLabelRouteGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { isCustomDomain, customOrg } = useCustomDomain()
  const { pathname, search, hash } = useLocation()
  const leave = isCustomDomain && isMainSiteOnlyPath(pathname, customOrg)

  useEffect(() => {
    if (leave) window.location.replace(mainSiteUrl(pathname + search + hash))
  }, [leave, pathname, search, hash])

  return leave ? null : <>{children}</>
}
