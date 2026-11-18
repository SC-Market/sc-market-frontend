import React from "react"
import { Navigate, useParams } from "react-router-dom"
import { useGetMyShopsQuery } from "../../features/shops/api/shopsApi"
import { PATHS } from "../../routes/paths"

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
