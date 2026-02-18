import React from "react"
import { useSearchMarketListingsQuery } from "../../features/market/api/marketApi"
import { DisplayListingsHorizontal } from "../../features/market/views/ItemListings"
import { RecentListingsSkeleton } from "./RecentListingsSkeleton"

export function RecentListings() {
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
