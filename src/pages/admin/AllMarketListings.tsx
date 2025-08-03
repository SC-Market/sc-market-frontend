import React, { useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { Divider, Grid, IconButton } from "@mui/material"
import { AllItemListings } from "../../views/market/ItemListings"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { MarketSidebarContext } from "../../hooks/market/MarketSidebar"
import { Page } from "../../components/metadata/Page"
import { MarketActions } from "../../components/button/MarketActions"
import {
  HideOnScroll,
  MarketNavArea,
} from "../../components/navbar/MarketNavArea"
import { useTranslation } from "react-i18next"

export function AllMarketListings(props: {}) {
  const { t } = useTranslation()
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
            spacing={2}
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
            spacing={3}
            sx={{ transition: "0.3s" }}
          >
            <AllItemListings status={"active"} />
          </Grid>

          <Grid
            item
            container
            justifyContent={"space-between"}
            spacing={2}
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
            spacing={3}
            sx={{ transition: "0.3s" }}
          >
            <AllItemListings status={"inactive"} />
          </Grid>

          <Grid
            item
            container
            justifyContent={"space-between"}
            spacing={2}
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
            spacing={3}
            sx={{ transition: "0.3s" }}
          >
            <AllItemListings status={"archived"} />
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
