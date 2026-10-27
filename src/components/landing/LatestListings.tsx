import React from "react"
import { Box, Paper, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useSearchListingsQuery } from "../../store/api/v2/market"
import { ListingCardV2 } from "../../features/market/v2/ListingSearchV2"
import { usePageReady } from "../metadata/PageReady"
import { isPrimaryLoading } from "../metadata/pageReadyStore"
import {
  LISTING_CARD_HEIGHT,
  LatestListingsLayout,
  LatestListingsSkeleton,
} from "./LatestListings.skeleton"
import { LATEST_LISTINGS_ARGS } from "./landingLinks"

/**
 * "Latest listings": the newest in-stock listings as the market's own
 * full-image cards (ListingCardV2), so sellers' photos carry the section.
 * Same query as the hero's "live listings" total (one request).
 */
export function LatestListings() {
  const { t } = useTranslation()
  const result = useSearchListingsQuery(LATEST_LISTINGS_ARGS)
  usePageReady(isPrimaryLoading(result))

  if (result.isLoading) return <LatestListingsSkeleton />

  const listings = result.data?.listings ?? []
  return (
    <LatestListingsLayout>
      {listings.length > 0 ? (
        listings.map((listing, index) => (
          // Grid cell; the card is ListingCardV2's fixed 300px.
          <Box key={listing.listing_id} sx={{ minWidth: 0 }}>
            <ListingCardV2 listing={listing} index={index} />
          </Box>
        ))
      ) : (
        <Paper
          sx={{
            gridColumn: "1 / -1",
            height: LISTING_CARD_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Typography color="text.secondary">
            {result.isError
              ? t("landing.latestListingsError")
              : t("landing.latestListingsEmpty")}
          </Typography>
        </Paper>
      )}
    </LatestListingsLayout>
  )
}

export default LatestListings
