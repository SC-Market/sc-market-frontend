import React from "react"
import { Box, Grid } from "@mui/material"
import { useSearchListingsQuery } from "../../store/api/v2/market"
import { ListingCardV2 } from "../../features/market/v2/ListingSearchV2"
import { ListingWrapper } from "../../features/market/components/listings/ListingWrapper"
import {
  RECENT_LISTINGS_COUNT,
  RecentListingsHeader,
  RecentListingsSkeleton,
} from "./RecentListingsSkeleton"
import { usePageReady } from "../metadata/PageReady"
import { isPrimaryLoading } from "../metadata/pageReadyStore"

export function RecentListingsV2() {
  const { data, isLoading, isFetching: pageIsFetching, currentData: pageCurrentData } = useSearchListingsQuery({
    page: 1,
    pageSize: RECENT_LISTINGS_COUNT,
    status: "active",
    // Landing page is a shop window — an out-of-stock listing is a dead end for
    // a first-time visitor, so only surface listings they can actually buy.
    inStock: true,
    sortBy: "created_at",
    sortOrder: "desc",
  })
  // Primary content of the home page: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({ isLoading, isFetching: pageIsFetching, currentData: pageCurrentData }),
  )

  if (isLoading || !data) return <RecentListingsSkeleton />

  return (
    <Grid item xs={12}>
      <RecentListingsHeader />
      <Box sx={{ width: "100%", overflowX: "scroll" }}>
        <Box display="flex" gap={1}>
          {data.listings.map((listing, index) => (
            <ListingWrapper key={listing.listing_id} useFixedWidth={true}>
              <ListingCardV2 listing={listing} index={index} />
            </ListingWrapper>
          ))}
        </Box>
      </Box>
    </Grid>
  )
}
