import React from "react"
import {
  Outlet,
  Navigate,
  useLocation,
  useParams,
  useOutletContext,
} from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import LoadingBar from "react-top-loading-bar"
import {
  useGetShopQuery,
  useGetMyShopsQuery,
  ShopResponse,
} from "../../features/shops/api/shopsApi"
import { PATHS } from "../../routes/paths"
import {
  canOpenShopSection,
  canViewShopPrivate,
  shopSectionOfPath,
} from "../../features/shops/domain/shopPermissions"
import { NoShopPermission } from "./NoShopPermission"

interface ShopRouteContext {
  shop: ShopResponse
}

/**
 * When rendered under a route with :shopSlug (e.g. /shop/:shopSlug/listings),
 * fetches that shop and verifies the current user may open the page: shops
 * that aren't theirs (not in /shops/mine) go back to My Shops, and a page
 * their org role doesn't allow (canOpenShopSection: the same rules the
 * sidebar uses to hide it) shows NoShopPermission. Provides shop data to
 * children via outlet context.
 */
export function ShopContextFromRoute() {
  const { shopSlug } = useParams<{ shopSlug: string }>()
  const { pathname } = useLocation()
  const theme = useTheme()

  const { data: myShops, isLoading: myShopsLoading } = useGetMyShopsQuery()

  const {
    data: shopPublic,
    isLoading: shopLoading,
    isError: shopError,
  } = useGetShopQuery({ slug: shopSlug! }, { skip: !shopSlug })

  if (!shopSlug) {
    return <Navigate to={PATHS.dashboardShops} replace />
  }

  if (shopLoading || myShopsLoading) {
    return <LoadingBar color={theme.palette.primary.main} progress={0.5} />
  }

  if (shopError || !shopPublic) {
    return <Navigate to={PATHS.dashboardShops} replace />
  }

  // Find the full ShopResponse from myShops (which includes can_manage)
  const ownedShop = myShops?.find((s) => s.slug === shopSlug)

  if (!ownedShop || !canViewShopPrivate(ownedShop)) {
    // Not the user's shop, nor one of their orgs'
    return <Navigate to={PATHS.dashboardShops} replace />
  }

  const section = shopSectionOfPath(pathname)
  if (section && !canOpenShopSection(ownedShop, section)) {
    return <NoShopPermission section={section} shop={ownedShop} />
  }

  return <Outlet context={{ shop: ownedShop } satisfies ShopRouteContext} />
}

/**
 * Type-safe hook for reading shop data from outlet context
 * in pages rendered under ShopContextFromRoute.
 */
export function useShopRouteContext() {
  return useOutletContext<ShopRouteContext>()
}

/**
 * Optional version of useShopRouteContext — returns null when the component
 * is NOT rendered under a ShopContextFromRoute outlet (e.g. under org routes).
 * Use this for components that are mounted in both /shop/:slug/... and /org/:id/... trees.
 */
export function useOptionalShopRouteContext(): ShopRouteContext | null {
  const ctx = useOutletContext<ShopRouteContext | undefined>()
  if (ctx && "shop" in ctx && ctx.shop?.shop_id) {
    return ctx as ShopRouteContext
  }
  return null
}
