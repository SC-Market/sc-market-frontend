import React from "react"
import { Outlet, Navigate, useParams, useOutletContext } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import LoadingBar from "react-top-loading-bar"
import {
  useGetShopQuery,
  useGetMyShopsQuery,
  ShopResponse,
} from "../../store/api/v2/market"
import { PATHS } from "../../routes/paths"

interface ShopRouteContext {
  shop: ShopResponse
}

/**
 * When rendered under a route with :shopSlug (e.g. /shop/:shopSlug/listings),
 * fetches that shop and verifies the current user can manage it.
 * Provides shop data to children via outlet context.
 */
export function ShopContextFromRoute() {
  const { shopSlug } = useParams<{ shopSlug: string }>()
  const theme = useTheme()

  const {
    data: myShops,
    isLoading: myShopsLoading,
  } = useGetMyShopsQuery()

  const {
    data: shopPublic,
    isLoading: shopLoading,
    isError: shopError,
  } = useGetShopQuery(
    { slug: shopSlug! },
    { skip: !shopSlug },
  )

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

  if (!ownedShop) {
    // User doesn't own this shop
    return <Navigate to={PATHS.dashboardShops} replace />
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
