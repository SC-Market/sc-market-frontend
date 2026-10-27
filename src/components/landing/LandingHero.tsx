import React from "react"
import { useSession } from "../../hooks/login/useSession"
import { useGetMarketStatsQuery } from "../../features/market/api/marketApi"
import { useSearchListingsQuery } from "../../store/api/v2/market"
import { usePageReady } from "../metadata/PageReady"
import { isPrimaryLoading } from "../metadata/pageReadyStore"
import { LandingHeroLayout } from "./LandingHeroLayout"
import { LATEST_LISTINGS_ARGS } from "./landingLinks"

export function LandingHero() {
  const session = useSession()
  const stats = useGetMarketStatsQuery()
  const listings = useSearchListingsQuery(LATEST_LISTINGS_ARGS)
  // The hero's data is the page's primary content: drives main[data-ready].
  usePageReady(stats.isLoading)
  usePageReady(isPrimaryLoading(listings))

  const failed = listings.isError && !listings.data
  return (
    <LandingHeroLayout
      signedIn={session.status === "authenticated"}
      stats={
        stats.isError && !stats.data
          ? null
          : stats.data && {
              totalOrders: stats.data.total_orders,
              totalOrderValue: stats.data.total_order_value,
              weekOrders: stats.data.week_orders,
              weekOrderValue: stats.data.week_order_value,
            }
      }
      liveListings={failed ? null : listings.data?.total}
      listings={failed ? null : listings.data?.listings}
    />
  )
}
