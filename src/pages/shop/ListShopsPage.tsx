import React, { useState } from "react"
import { Divider, Grid, IconButton, useMediaQuery } from "@mui/material"
import { Page } from "../../components/metadata/Page"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MarketSidebarContext } from "../../hooks/market/MarketSidebar"
import { HideOnScroll, MarketNavArea } from "../../components/navbar/MarketNavArea"
import { MarketSidebar } from "../../views/market/MarketSidebar"
import { ShopListings } from '../../views/shops/ShopListings'

export function ListShopsPage() {
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Page title={"Player Shops"}>
      <IconButton
        color="secondary"
        aria-label="toggle market sidebar"
        sx={{
          position: "absolute",
          zIndex: 50,
          [theme.breakpoints.up("sm")]: {
            left: (drawerOpen ? sidebarDrawerWidth : 0) + 16,
          },
          [theme.breakpoints.down("sm")]: {
            left: (drawerOpen ? sidebarDrawerWidth : 0) + 16,
          },
          [theme.breakpoints.up("md")]: {
            display: "none",
          },
          top: 64 + 24,
        }}
        onClick={() => {
          setOpen(true)
        }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <MarketSidebarContext.Provider value={[open, setOpen]}>
        {xs && <MarketSidebar />}

        <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
          <Grid item xs={12}>
            <Grid container justifyContent={"space-between"} spacing={1}>
              <HeaderTitle lg={7} xl={7}>
                Player Shops
              </HeaderTitle>

              {/* Add shop search/filter controls here if needed */}
              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            container
            xs={12}
            lg={12}
            spacing={1.5}
            sx={{ transition: "0.3s" }}
          >
            <ShopListings />
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
