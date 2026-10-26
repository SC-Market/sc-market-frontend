import React from "react"
import { Box, Button, Grid } from "@mui/material"
import { useSearchListingsQuery } from "../../store/api/v2/market"
import { ListingCardV2 } from "../../features/market/v2/ListingSearchV2"
import { ListingWrapper } from "../../features/market/components/listings/ListingWrapper"
import { RecentListingsSkeleton } from "./RecentListingsSkeleton"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { MARKET_PATHS } from "../../routes/paths"
import { LandingSectionTitle } from "./LandingTypography"

export function RecentListingsV2() {
  const { t } = useTranslation()
  const { data, isLoading } = useSearchListingsQuery({
    page: 1,
    pageSize: 8,
    status: "active",
    // Landing page is a shop window — an out-of-stock listing is a dead end for
    // a first-time visitor, so only surface listings they can actually buy.
    inStock: true,
    sortBy: "created_at",
    sortOrder: "desc",
  })

  if (isLoading || !data) return <RecentListingsSkeleton />

  return (
    <Grid item xs={12}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <LandingSectionTitle sx={{ textAlign: "left" }}>
          {t("landing.recentListings", "Recent Listings")}
        </LandingSectionTitle>
        <Button
          component={Link}
          to={MARKET_PATHS.search}
          variant="outlined"
          color="secondary"
        >
          {t("landing.seeAll", "See All")}
        </Button>
      </Box>
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
