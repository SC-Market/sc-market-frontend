import React from "react"
import { Navigate, useParams } from "react-router-dom"
import { useCookies } from "react-cookie"
import { useGetMyShopsQuery } from "../../store/api/v2/market"
import { PATHS } from "../../routes/paths"

/**
 * Reads the current_shop_slug cookie and redirects to the appropriate
 * shop-scoped URL. Falls back to /dashboard/shops if no cookie is set.
 */
export function ShopRedirect({ subpath }: { subpath: string }) {
  const [cookies] = useCookies(["current_shop_slug"])
  const slug = cookies.current_shop_slug

  if (slug) {
    return <Navigate to={`/shop/${slug}/${subpath}`} replace />
  }

  return <Navigate to={PATHS.dashboardShops} replace />
}

export function ShopRedirectListings({ suffix }: { suffix?: string }) {
  return <ShopRedirect subpath={`listings${suffix || ""}`} />
}

export function ShopRedirectStock() {
  return <ShopRedirect subpath="stock" />
}

/**
 * Orgs no longer own listings or stock; their shops do. The old
 * /org/:contractor_id/listings and /org/:contractor_id/manage-stock pages
 * send you to that org's shop page (subpath), or to My Shops when the org
 * has no shop you belong to, or several to pick from.
 */
export function OrgShopRedirect({
  subpath,
}: {
  subpath: "listings" | "stock"
}) {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const { data: myShops, isLoading } = useGetMyShopsQuery()

  if (isLoading) return null

  const orgShops = (myShops ?? []).filter(
    (s) =>
      s.is_org_owned &&
      s.owner_contractor_spectrum_id?.toLowerCase() ===
        contractor_id?.toLowerCase(),
  )

  if (orgShops.length === 1) {
    return <Navigate to={`/shop/${orgShops[0].slug}/${subpath}`} replace />
  }

  return <Navigate to={PATHS.dashboardShops} replace />
}

export function OrgShopRedirectListings() {
  return <OrgShopRedirect subpath="listings" />
}

export function OrgShopRedirectStock() {
  return <OrgShopRedirect subpath="stock" />
}
