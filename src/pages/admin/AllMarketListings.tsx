import React, { lazy, Suspense, useState } from "react"
import { Box, Divider, Grid, IconButton, Skeleton } from "@mui/material"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { MarketSidebarContext } from "../../features/market/hooks/MarketSidebar"
import { MarketActions } from "../../features/market/components/MarketActions"
import { HideOnScroll } from "../../features/market/components/MarketNavArea"
import { MarketNavArea } from "../../features/market/components/MarketNavArea"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

const AllItemListings = lazy(() =>
  import("../../features/market/views/ItemListings").then((m) => ({
    default: m.AllItemListings,
  })),
)

function ListingsSkeleton() {
  return (
    <Grid item xs={12}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" width={280} height={200} />
        ))}
      </Box>
    </Grid>
  )
}

export function AllMarketListings() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()

  return (
    <StandardPageLayout
      title={t("market.allListingsTitle")}
      headerTitle={t("market.activeListings")}
      headerActions={<MarketActions />}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <IconButton
        color="secondary"
        aria-label={t("market.toggleSidebar")}
        sx={{
          position: "absolute",
          zIndex: 50,
          left: (drawerOpen ? sidebarDrawerWidth : 0) + 24,
          top: 64 + 24,
        }}
        onClick={() => {
          setOpen(true)
        }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <MarketSidebarContext.Provider value={[open, setOpen]}>
        <Grid item xs={12}>
          <HideOnScroll>
            <MarketNavArea />
          </HideOnScroll>
        </Grid>

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pb: 3 }}>
            <Suspense fallback={<ListingsSkeleton />}>
              <AllItemListings status={"active"} />
            </Suspense>
          </Box>
        </Grid>

        <Grid
          item
          container
          justifyContent={"space-between"}
          spacing={theme.layoutSpacing.layout}
          xs={12}
        >
          <HeaderTitle lg={12} xl={12}>
            {t("market.inactiveListings")}
          </HeaderTitle>
        </Grid>

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pb: 3 }}>
            <Suspense fallback={<ListingsSkeleton />}>
              <AllItemListings status={"inactive"} />
            </Suspense>
          </Box>
        </Grid>

        <Grid
          item
          container
          justifyContent={"space-between"}
          spacing={theme.layoutSpacing.layout}
          xs={12}
        >
          <HeaderTitle lg={12} xl={12}>
            {t("market.archivedListings")}
          </HeaderTitle>
        </Grid>

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pb: 3 }}>
            <Suspense fallback={<ListingsSkeleton />}>
              <AllItemListings status={"archived"} />
            </Suspense>
          </Box>
        </Grid>
      </MarketSidebarContext.Provider>
    </StandardPageLayout>
  )
}
