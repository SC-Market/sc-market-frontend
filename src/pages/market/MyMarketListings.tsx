import React, { useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { PageBreadcrumbs } from "../../components/navigation"
import { Divider, Grid, IconButton } from "@mui/material"
import { MyItemListings } from "../../features/market/views/ItemListings"
import { MarketSidebar } from "../../features/market/components/MarketSidebar"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { MarketSidebarContext } from "../../features/market/hooks/MarketSidebar"
import { Page } from "../../components/metadata/Page"
import { MarketActions } from "../../features/market/components/MarketActions"
import { HideOnScroll, MarketNavArea } from "../../features/market/components/MarketNavArea"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function MyMarketListings(props: {}) {
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Page title={t("sidebar.my_market_listings")}>
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
        {/*<MarketSidebar/>*/}
        <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
          <Grid item xs={12}>
            <PageBreadcrumbs
              items={[
                { label: t("market.title", "Market"), href: "/market" },
                { label: t("sidebar.my_market_listings") },
              ]}
            />
          </Grid>
          <Grid
            item
            container
            justifyContent={"space-between"}
            spacing={theme.layoutSpacing.layout}
            xs={12}
          >
            <HeaderTitle lg={7} xl={7}>
              {t("market.activeListings")}
            </HeaderTitle>

            <MarketActions />
          </Grid>

          <Grid item xs={12}>
            <HideOnScroll>
              <MarketNavArea />
            </HideOnScroll>
          </Grid>

          <Grid item xs={12}>
            <Divider light />
          </Grid>

          <Grid
            item
            container
            xs={12}
            lg={12}
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <MyItemListings status={"active"} />
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

          <Grid
            item
            container
            xs={12}
            lg={12}
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <MyItemListings status={"inactive"} />
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

          <Grid
            item
            container
            xs={12}
            lg={12}
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <MyItemListings status={"archived"} />
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
