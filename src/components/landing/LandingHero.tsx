import React from "react"
import { useSession } from "../../hooks/login/useSession"
import { useGetMarketStatsQuery } from "../../features/market/api/marketApi"
import { MARKET_PATHS, PATHS } from "../../routes/paths"
import { LandingHeroLayout } from "./LandingHeroLayout"

/**
 * "Start selling" goes straight to the create-listing page when signed in.
 * Signed out (or not known yet) it goes through the login page with a
 * redirect, the same URL LoggedInRoute would send them to.
 */
export function landingSellHref(signedIn: boolean): string {
  return signedIn
    ? MARKET_PATHS.create
    : `${PATHS.login}?redirect=${encodeURIComponent(MARKET_PATHS.create)}`
}

export function LandingHero() {
  const session = useSession()
  // Shares the cached request with the weekly stats row (OrderStatistics).
  const { data, isError } = useGetMarketStatsQuery()
  return (
    <LandingHeroLayout
      sellHref={landingSellHref(session.status === "authenticated")}
      stats={
        isError && !data
          ? null
          : data && {
              totalOrders: data.total_orders,
              totalOrderValue: data.total_order_value,
            }
      }
    />
  )
}
