import { useMemo, useCallback } from "react"
import { useLocation, matchPath } from "react-router-dom"
import { useSession } from "../../../hooks/login/useSession"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useGetContractorBySpectrumIDQuery } from "../../../features/contractor/api/contractorApi"
import { useCustomDomain } from "../../../hooks/contractor/CustomDomain"
import SCMarketLogo from "../../../assets/scmarket-logo.png"
import { SidebarItemProps } from "../types"
import { createItemFilter } from "../utils/sidebarFilters"
import { resolveOrgRoute } from "../utils/sidebarRouting"
import { useCookies } from "react-cookie"
import { useFeatureFlag } from "../../../hooks/market/useFeatureFlag"

/**
 * Hook for managing sidebar items with filtering and route resolution
 */
export function useSidebarItems() {
  const location = useLocation()
  const { profile } = useSession()
  const [currentOrgObj] = useCurrentOrg()
  const [cookies] = useCookies(["current_shop_slug"])
  const { flags } = useFeatureFlag()

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

  const { customOrg } = useCustomDomain()
  const { data: customOrgData } = useGetContractorBySpectrumIDQuery(
    customOrg!,
    { skip: !customOrg },
  )

  const avatar = useMemo(() => {
    if (customOrg) {
      return customOrgData?.avatar || SCMarketLogo
    }
    return SCMarketLogo
  }, [customOrg, customOrgData])

  const filterItems = useCallback(
    createItemFilter(profile, currentOrgObj, shopSlug, flags, customOrg),
    [currentOrgObj, profile, shopSlug, flags, customOrg],
  )

  const resolveItem = useCallback(
    (item: SidebarItemProps) =>
      resolveOrgRoute(item, currentOrgObj?.spectrum_id, effectiveOrgId, shopSlug),
    [currentOrgObj?.spectrum_id, effectiveOrgId, shopSlug],
  )

  return {
    profile,
    currentOrgObj,
    effectiveOrgId,
    avatar,
    filterItems,
    resolveItem,
  }
}
