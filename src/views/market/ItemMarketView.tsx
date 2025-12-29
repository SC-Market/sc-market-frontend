import { MarketSidebar } from "./MarketSidebar"
import {
  Container,
  Divider,
  Grid,
  IconButton,
  useMediaQuery,
} from "@mui/material"
import {
  HideOnScroll,
  MarketNavArea,
} from "../../components/navbar/MarketNavArea"
import { ItemListings } from "./ItemListings"
import { MarketSidebarContext } from "../../hooks/market/MarketSidebar"
import React, { useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { useTranslation } from "react-i18next"

export function ItemMarketView() {
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const drawerOpen = useDrawerOpen()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <IconButton
        color="secondary"
        aria-label={t("market.toggleSidebar")}
        sx={{
          position: "absolute",
          zIndex: 50,
          left: 16,
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

        <Container maxWidth={"lg"}>
          <Grid container spacing={theme.layoutSpacing.layout} justifyContent={"center"}>
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
              spacing={theme.layoutSpacing.layout}
              sx={{ transition: "0.3s" }}
            >
              <ItemListings />
            </Grid>
          </Grid>
        </Container>
      </MarketSidebarContext.Provider>
    </>
  )
}
