import React, { useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { AllItemListings } from "../../views/market/ItemListings"
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

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

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

          <Grid
            item
            container
            xs={12}
            lg={12}
            spacing={theme.layoutSpacing.layout}
            sx={{ transition: "0.3s" }}
          >
            <AllItemListings status={"active"} />
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
            spacing={theme.layoutSpacing.layout}
            sx={{ transition: "0.3s" }}
          >
            <AllItemListings status={"inactive"} />
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
            spacing={theme.layoutSpacing.layout}
            sx={{ transition: "0.3s" }}
          >
            <AllItemListings status={"archived"} />
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
