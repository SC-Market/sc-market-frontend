import React from "react"
import { Navigate } from "react-router-dom"
import { useCookies } from "react-cookie"

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

  return <Navigate to="/dashboard/shops" replace />
}

export function ShopRedirectListings() {
  return <ShopRedirect subpath="listings" />
}

export function ShopRedirectStock() {
  return <ShopRedirect subpath="stock" />
}
