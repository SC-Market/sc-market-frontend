import React from "react"
import { Box, Grid } from "@mui/material"
import { useSearchListingsQuery } from "../../store/api/v2/market"
import { ListingCardV2 } from "../../features/market/v2/ListingSearchV2"
import { ListingWrapper } from "../../features/market/components/listings/ListingCard"
import { RecentListingsSkeleton } from "./RecentListingsSkeleton"

export function RecentListingsV2() {
  const { data, isLoading } = useSearchListingsQuery({
    page: 1,
    pageSize: 8,
    status: "active",
    sortBy: "created_at",
    sortOrder: "desc",
  })

  if (isLoading || !data) return <RecentListingsSkeleton />

  return (
    <Grid item xs={12}>
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
