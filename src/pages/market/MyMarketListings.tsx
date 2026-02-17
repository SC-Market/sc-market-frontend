import React, { lazy, useState } from "react"
import { Divider, Grid, IconButton } from "@mui/material"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { MarketSidebarContext } from "../../features/market/hooks/MarketSidebar"
import { MarketActions } from "../../features/market/components/MarketActions"
import { HideOnScroll, MarketNavArea } from "../../features/market/components/MarketNavArea"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageMyMarketListings } from "../../features/market/hooks/usePageMyMarketListings"
import { LazySection } from "../../components/layout/LazySection"
import { HeaderTitle } from "../../components/typography/HeaderTitle"

// Lazy load listing sections
const ActiveListings = lazy(() =>
  import("../../features/market/views/ItemListings").then((module) => ({
    default: () => <module.MyItemListings status="active" />,
  })),
)

const InactiveListings = lazy(() =>
  import("../../features/market/views/ItemListings").then((module) => ({
    default: () => <module.MyItemListings status="inactive" />,
  })),
)

const ArchivedListings = lazy(() =>
  import("../../features/market/views/ItemListings").then((module) => ({
    default: () => <module.MyItemListings status="archived" />,
  })),
)

// Simple skeleton for listing sections
function ListingsSkeleton() {
  return (
    <Grid item xs={12}>
      <div>Loading...</div>
    </Grid>
  )
}

export function MyMarketListings() {
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const pageData = usePageMyMarketListings()

  return (
    <StandardPageLayout
      title={t("sidebar.my_market_listings")}
      breadcrumbs={[
        { label: t("market.title", "Market"), href: "/market" },
        { label: t("sidebar.my_market_listings") },
      ]}
      headerTitle={t("market.activeListings")}
      headerActions={<MarketActions />}
      sidebarOpen={true}
      maxWidth="lg"
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      <IconButton
        color="secondary"
        aria-label={t("toggle_market_sidebar")}
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

        <LazySection
          component={ActiveListings}
          skeleton={ListingsSkeleton}
          gridProps={{
            item: true,
            container: true,
            xs: 12,
            lg: 12,
            spacing: theme.layoutSpacing.component,
            sx: { transition: "0.3s" },
          }}
        />

        <Grid
          item
          container
          justifyContent="space-between"
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

        <LazySection
          component={InactiveListings}
          skeleton={ListingsSkeleton}
          gridProps={{
            item: true,
            container: true,
            xs: 12,
            lg: 12,
            spacing: theme.layoutSpacing.component,
            sx: { transition: "0.3s" },
          }}
        />

        <Grid
          item
          container
          justifyContent="space-between"
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

        <LazySection
          component={ArchivedListings}
          skeleton={ListingsSkeleton}
          gridProps={{
            item: true,
            container: true,
            xs: 12,
            lg: 12,
            spacing: theme.layoutSpacing.component,
            sx: { transition: "0.3s" },
          }}
        />
      </MarketSidebarContext.Provider>
    </StandardPageLayout>
  )
}
