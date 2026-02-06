import { useMemo, useCallback } from "react"
import { useLocation, matchPath } from "react-router-dom"
import { useGetUserProfileQuery } from "../../../store/profile"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useGetContractorBySpectrumIDQuery } from "../../../store/contractor"
import { CURRENT_CUSTOM_ORG } from "../../../hooks/contractor/CustomDomain"
import SCMarketLogo from "../../../assets/scmarket-logo.png"
import { SidebarItemProps } from "../types"
import { createItemFilter } from "../utils/sidebarFilters"
import { resolveOrgRoute } from "../utils/sidebarRouting"

/**
 * Hook for managing sidebar items with filtering and route resolution
 */
export function useSidebarItems() {
  const location = useLocation()
  const { data: profile, error: profileError } = useGetUserProfileQuery()
  const [currentOrgObj] = useCurrentOrg()

  const orgRouteContractorId = useMemo(() => {
    const m = matchPath("/org/:contractor_id/*", location.pathname)
    return (m?.params as { contractor_id?: string; "*"?: string })?.[
      "contractor_id"
    ]
  }, [location.pathname])

  const effectiveOrgId = orgRouteContractorId ?? currentOrgObj?.spectrum_id

  const { data: customOrgData } = useGetContractorBySpectrumIDQuery(
    CURRENT_CUSTOM_ORG!,
    { skip: !CURRENT_CUSTOM_ORG },
  )

  const avatar = useMemo(() => {
    if (CURRENT_CUSTOM_ORG) {
      return customOrgData?.avatar || SCMarketLogo
    }
    return SCMarketLogo
  }, [customOrgData])

  const filterItems = useCallback(
    createItemFilter(profile, profileError, currentOrgObj),
    [currentOrgObj, profile, profileError],
  )

  const resolveItem = useCallback(
    (item: SidebarItemProps) =>
      resolveOrgRoute(item, currentOrgObj?.spectrum_id, effectiveOrgId),
    [currentOrgObj?.spectrum_id, effectiveOrgId],
  )

  return {
    profile,
    profileError,
    currentOrgObj,
    effectiveOrgId,
    avatar,
    filterItems,
    resolveItem,
  }
}
