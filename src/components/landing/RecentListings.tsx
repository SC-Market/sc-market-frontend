import React from "react"
import { useSearchMarketListingsQuery } from "../../features/market/api/marketApi"
import { useSearchListingsQuery } from "../../store/api/v2/market"
import { DisplayListingsHorizontal } from "../../features/market/views/ItemListings"
import { RecentListingsSkeleton } from "./RecentListingsSkeleton"
import { useFeatureFlag } from "../../hooks/market/useFeatureFlag"
import { RecentListingsV2 } from "./RecentListingsV2"

export function RecentListings() {
  const { marketVersion } = useFeatureFlag()

  if (marketVersion === "V2") {
    return <RecentListingsV2 />
  }

  return <RecentListingsV1 />
}

function RecentListingsV1() {
  const { data: results, isLoading } = useSearchMarketListingsQuery({
    page: 0,
    page_size: 8,
    statuses: "active",
    sale_type: "sale",
    listing_type: "unique",
    sort: "activity",
    quantityAvailable: 1,
  })

  return !isLoading && results ? (
    <DisplayListingsHorizontal listings={results.listings || []} />
  ) : (
    <RecentListingsSkeleton />
  )
}
