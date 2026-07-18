import { useMemo, useCallback } from "react"
import { useLocation, matchPath } from "react-router-dom"
import { useGetUserProfileQuery } from "../../../features/profile/api/profileApi"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useGetContractorBySpectrumIDQuery } from "../../../features/contractor/api/contractorApi"
import { CURRENT_CUSTOM_ORG } from "../../../hooks/contractor/CustomDomain"
import SCMarketLogo from "../../../assets/scmarket-logo.png"
import { SidebarItemProps } from "../types"
import { createItemFilter } from "../utils/sidebarFilters"
import { resolveOrgRoute } from "../utils/sidebarRouting"
import { useCookies } from "react-cookie"

/**
 * Hook for managing sidebar items with filtering and route resolution
 */
export function useSidebarItems() {
  const location = useLocation()
  const { data: profile, error: profileError } = useGetUserProfileQuery()
  const [currentOrgObj] = useCurrentOrg()
  const [cookies] = useCookies(["current_shop_slug"])

  const orgRouteContractorId = useMemo(() => {
    const m = matchPath("/org/:contractor_id/*", location.pathname)
    return (m?.params as { contractor_id?: string; "*"?: string })?.[
      "contractor_id"
    ]
  }, [location.pathname])

  const effectiveOrgId = orgRouteContractorId ?? currentOrgObj?.spectrum_id

  // Get the current shop slug from URL or cookie
  const shopSlug = useMemo(() => {
    const m = matchPath("/shop/:shopSlug/*", location.pathname)
    const fromUrl = (m?.params as { shopSlug?: string })?.shopSlug
    return fromUrl ?? cookies.current_shop_slug ?? null
  }, [location.pathname, cookies.current_shop_slug])

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
    createItemFilter(profile, profileError, currentOrgObj, shopSlug),
    [currentOrgObj, profile, profileError, shopSlug],
  )

  const resolveItem = useCallback(
    (item: SidebarItemProps) =>
      resolveOrgRoute(item, currentOrgObj?.spectrum_id, effectiveOrgId, shopSlug),
    [currentOrgObj?.spectrum_id, effectiveOrgId, shopSlug],
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
