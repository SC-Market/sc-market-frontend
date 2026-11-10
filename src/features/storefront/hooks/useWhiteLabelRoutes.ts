import { useCallback, useMemo } from "react"
import { useCustomDomain } from "../../../hooks/contractor/CustomDomain"
import { useWhiteLabelSidebar } from "../../contractor/hooks/useWhiteLabelSidebar"
import { isMainSiteAccountPath, isMainSiteOnlyPath } from "../whiteLabelRoutes"

/**
 * Which pages this domain serves (features/storefront/whiteLabelRoutes.ts):
 * everything on sc-market.space; on an org's white-label domain not the SC
 * Market-wide pages, other orgs' pages, nor the tabs the org turned off.
 *
 * - `shows(path)`: whether to link it (sidebar, bottom nav, command
 *   palette); until the org's settings load, its tabs have their defaults.
 *   The visitor's messages and notifications stay linked: the guard opens
 *   them on sc-market.space.
 * - `leaves(path)`: whether visiting it hands the visitor to sc-market.space
 *   (WhiteLabelRouteGuard); the org's tab settings apply once loaded, so an
 *   opted-in tab is never left on a first render.
 */
export function useWhiteLabelRoutes(): {
  shows: (path: string) => boolean
  leaves: (path: string) => boolean
} {
  const { isCustomDomain, customOrg } = useCustomDomain()
  const { hidden, loaded } = useWhiteLabelSidebar()
  const shows = useCallback(
    (path: string) =>
      !isCustomDomain ||
      isMainSiteAccountPath(path) ||
      !isMainSiteOnlyPath(path, customOrg, hidden),
    [isCustomDomain, customOrg, hidden],
  )
  const leaves = useCallback(
    (path: string) =>
      isCustomDomain &&
      isMainSiteOnlyPath(path, customOrg, loaded ? hidden : undefined),
    [isCustomDomain, customOrg, hidden, loaded],
  )
  return useMemo(() => ({ shows, leaves }), [shows, leaves])
}
