import React, { ReactNode } from "react"
import { Box, Button, Card, CardContent, Skeleton } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { MARKET_PATHS } from "../../routes/paths"
import { ListingWrapper } from "../../features/market/components/listings/ListingWrapper"
import { PageBusy } from "../metadata/PageReady"
import { LandingSection, LandingSectionHeader } from "./LandingSection"

/** Open buy orders the section asks for (newest first). */
export const WANTED_NOW_COUNT = 6

/** The buy-order card's fixed height (BuyOrderAggregateCard). */
export const BUY_ORDER_CARD_HEIGHT = 300

/**
 * "Wanted now": the section and its header, static, so the skeleton and the
 * loaded section are the same. `children` is the card rail.
 */
export function WantedNowLayout(props: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <LandingSection labelledBy="landing-wanted-now-title" testId="landing-wanted-now">
      <LandingSectionHeader
        id="landing-wanted-now-title"
        title={t("landing.wantedNowTitle")}
        subtitle={t("landing.wantedNowText")}
        actions={
          <>
            <Button
              component={Link}
              to={MARKET_PATHS.buyOrderCreate}
              variant="outlined"
              color="secondary"
            >
              {t("landing.intentWantedAction")}
            </Button>
            <Button
              component={Link}
              to={MARKET_PATHS.buyOrders}
              variant="outlined"
              color="secondary"
            >
              {t("landing.wantedNowSeeAll")}
            </Button>
          </>
        }
      />
      {/* One row of fixed-size cards, scrolling sideways. */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          height: BUY_ORDER_CARD_HEIGHT,
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {props.children}
      </Box>
    </LandingSection>
  )
}

/** One buy-order card while loading: its size, image and text placeholders. */
function BuyOrderCardSkeleton() {
  return (
    <ListingWrapper useFixedWidth>
      <Card sx={{ height: BUY_ORDER_CARD_HEIGHT, position: "relative" }}>
        <Skeleton
          variant="rectangular"
          animation="pulse"
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
          <Skeleton width="70%" sx={{ fontSize: "0.95rem" }} />
          <Skeleton width="85%" sx={{ fontSize: "0.75rem" }} />
          <Skeleton width="55%" sx={{ fontSize: "0.7rem" }} />
        </CardContent>
      </Card>
    </ListingWrapper>
  )
}

/** The section while its chunk or its buy orders load. */
export function WantedNowSkeleton() {
  return (
    <WantedNowLayout>
      <PageBusy />
      {Array.from({ length: WANTED_NOW_COUNT }, (_, i) => (
        <BuyOrderCardSkeleton key={i} />
      ))}
    </WantedNowLayout>
  )
}
