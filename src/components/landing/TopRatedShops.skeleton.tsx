import React, { ReactNode } from "react"
import { Box, Button } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { MARKET_PATHS } from "../../routes/paths"
import { ShopCardSkeleton } from "../skeletons/ShopCardSkeleton"
import { PageBusy } from "../metadata/PageReady"
import { LandingSection, LandingSectionHeader } from "./LandingSection"

/** Shops in the section: the top rated ones. */
export const TOP_RATED_SHOPS_COUNT = 4

/**
 * Every shop cell's height (px). A compact ShopCard (logo + name/owner,
 * rating, stats, two description lines) fits it whatever the shop, and the
 * card fills it, so loaded and loading cells are the same size.
 */
export const TOP_SHOP_CELL_HEIGHT = 186

/** One shop cell: fixed height, the card fills it. */
export function TopShopCell(props: {
  children: ReactNode
  slug?: string
}) {
  return (
    <Box
      data-testid={props.slug ? "shop-card" : undefined}
      data-id={props.slug}
      sx={{ height: TOP_SHOP_CELL_HEIGHT, minWidth: 0 }}
    >
      {props.children}
    </Box>
  )
}

/** "Top rated shops": the section and its static header; `children` are the cells. */
export function TopRatedShopsLayout(props: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <LandingSection labelledBy="landing-top-shops-title" testId="landing-top-shops">
      <LandingSectionHeader
        id="landing-top-shops-title"
        title={t("landing.topShopsTitle")}
        subtitle={t("landing.topShopsText")}
        actions={
          <Button
            component={Link}
            to={MARKET_PATHS.shops}
            variant="outlined"
            color="secondary"
          >
            {t("landing.topShopsBrowse")}
          </Button>
        }
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1, sm: 2 },
        }}
      >
        {props.children}
      </Box>
    </LandingSection>
  )
}

/** The section while its chunk or the shops load. */
export function TopRatedShopsSkeleton() {
  return (
    <TopRatedShopsLayout>
      <PageBusy />
      {Array.from({ length: TOP_RATED_SHOPS_COUNT }, (_, i) => (
        <TopShopCell key={i}>
          <ShopCardSkeleton index={i} />
        </TopShopCell>
      ))}
    </TopRatedShopsLayout>
  )
}
