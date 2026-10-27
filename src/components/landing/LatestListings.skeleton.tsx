import React, { ReactNode } from "react"
import { Box, Button, Card, CardContent, Skeleton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MARKET_PATHS } from "../../routes/paths"
import { PageBusy } from "../metadata/PageReady"
import { LandingSection, LandingSectionHeader } from "./LandingSection"
import { LATEST_LISTINGS_COUNT } from "./landingLinks"

/** ListingCardV2's fixed height (px). */
export const LISTING_CARD_HEIGHT = 300

/**
 * "Latest listings": the section, its static header and the card grid, so
 * the skeleton and the loaded section are the same. The grid shows two
 * rows of cards at every width (3, 4, then 5 columns; cards past the
 * second row are hidden), and one sideways-scrolling row on phones.
 * CSS only, so the markup is the same at every width.
 */
export function LatestListingsLayout(props: { children: ReactNode }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <LandingSection
      labelledBy="landing-latest-listings-title"
      testId="landing-latest-listings"
    >
      <LandingSectionHeader
        id="landing-latest-listings-title"
        title={t("landing.latestListingsTitle")}
        subtitle={t("landing.latestListingsText")}
        actions={
          <Button
            component={Link}
            to={MARKET_PATHS.search}
            variant="outlined"
            color="secondary"
          >
            {t("landing.seeAll")}
          </Button>
        }
      />
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridAutoRows: LISTING_CARD_HEIGHT,
          // Phones: one row, scrolling sideways.
          gridAutoFlow: { xs: "column", sm: "row" },
          gridAutoColumns: { xs: "min(45vw, 200px)", sm: "auto" },
          gridTemplateColumns: {
            sm: "repeat(3, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
            lg: `repeat(${LATEST_LISTINGS_COUNT / 2}, minmax(0, 1fr))`,
          },
          overflowX: { xs: "auto", sm: "visible" },
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          // Exactly two rows: hide what a narrower grid can't fit.
          [theme.breakpoints.only("sm")]: {
            "& > :nth-of-type(n+7)": { display: "none" },
          },
          [theme.breakpoints.only("md")]: {
            "& > :nth-of-type(n+9)": { display: "none" },
          },
        }}
      >
        {props.children}
      </Box>
    </LandingSection>
  )
}

/** One listing card while loading: its size, image and text placeholders. */
export function ListingCardSkeleton() {
  return (
    <Card sx={{ height: LISTING_CARD_HEIGHT, position: "relative" }}>
      <Skeleton
        variant="rectangular"
        sx={{ position: "absolute", inset: 0, height: "100%" }}
      />
      <CardContent
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "8px 12px !important",
        }}
      >
        <Skeleton width="60%" sx={{ fontSize: "0.95rem" }} />
        <Skeleton width="85%" sx={{ fontSize: "0.75rem" }} />
        <Skeleton width="50%" sx={{ fontSize: "0.7rem" }} />
      </CardContent>
    </Card>
  )
}

/** The section while its chunk or its listings load. */
export function LatestListingsSkeleton() {
  return (
    <>
      <PageBusy />
      <LatestListingsLayout>
        {Array.from({ length: LATEST_LISTINGS_COUNT }, (_, i) => (
          <Box key={i} sx={{ minWidth: 0 }}>
            <ListingCardSkeleton />
          </Box>
        ))}
      </LatestListingsLayout>
    </>
  )
}
