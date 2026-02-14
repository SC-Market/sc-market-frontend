import React, { useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { Box, Divider, Grid, IconButton } from "@mui/material"
import { AllItemListings } from "../../features/market/views/ItemListings"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { MarketSidebarContext } from "../../features/market/hooks/MarketSidebar"
import { Page } from "../../components/metadata/Page"
import { MarketActions } from "../../features/market/components/MarketActions"
import { HideOnScroll } from "../../features/market/components/MarketNavArea"
import { MarketNavArea } from "../../features/market/components/MarketNavArea"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function AllMarketListings(props: {}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()

  return (
    <Page title={t("market.allListingsTitle")}>
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
        {/*<MarketSidebar/>*/}
        <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
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

            <Grid item xs={12}>
              <HideOnScroll>
                <MarketNavArea />
              </HideOnScroll>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider light />
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                pb: 3,
              }}
            >
              <AllItemListings status={"active"} />
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
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                pb: 3,
              }}
            >
              <AllItemListings status={"inactive"} />
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
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                pb: 3,
              }}
            >
              <AllItemListings status={"archived"} />
            </Box>
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
