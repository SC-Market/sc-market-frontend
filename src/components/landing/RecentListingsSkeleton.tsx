import React from "react"
import { Box, Button, Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { HorizontalListingSkeleton } from "../skeletons"
import { ListingWrapper } from "../../features/market/components/listings/ListingWrapper"
import { MARKET_PATHS } from "../../routes/paths"
import { LandingSectionTitle } from "./LandingTypography"

/** Cards shown by RecentListingsV2 (its page size). */
export const RECENT_LISTINGS_COUNT = 8

/**
 * ListingCardV2's fixed card height. The skeleton card takes its height from
 * its parent in dark mode (absolute content, 100% media), so on its own it
 * collapses to ~0 and the sections below jumped ~300px when the cards came.
 */
const LISTING_CARD_HEIGHT = 300

/**
 * The header row of the Recent Listings section: static, so the skeleton
 * renders the real one (left-aligned title, "See All") and the section
 * doesn't jump from a centered empty box to the header.
 */
export function RecentListingsHeader() {
  const { t } = useTranslation()
  return (
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
  )
}

/**
 * Skeleton for the Recent Listings section: the same grid item, header and
 * fixed-width card row as RecentListingsV2.
 */
export function RecentListingsSkeleton() {
  return (
    <Grid item xs={12}>
      <RecentListingsHeader />
      <Box sx={{ width: "100%", overflowX: "scroll" }}>
        <Box display="flex" gap={1}>
          {Array.from({ length: RECENT_LISTINGS_COUNT }).map((_, index) => (
            <ListingWrapper key={index} useFixedWidth={true}>
              <Box
                sx={{
                  height: LISTING_CARD_HEIGHT,
                  overflow: "hidden",
                  "& > *": { height: "100%" },
                }}
              >
                <HorizontalListingSkeleton index={index} />
              </Box>
            </ListingWrapper>
          ))}
        </Box>
      </Box>
    </Grid>
  )
}
