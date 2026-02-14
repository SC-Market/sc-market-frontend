import React, { useEffect, useState, Suspense } from "react"
import { HeaderTitle } from "../../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { Box, IconButton, Grid, Divider } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Page } from "../../../components/metadata/Page"
import {
  MarketActions,
} from "../../market/components/MarketActions"
import { HideOnScroll } from "../../market/components/MarketNavArea"
import { MarketNavArea } from "../../market/components/MarketNavArea"
import { MarketSidebarContext, useMarketSearch } from "../../market"
import { useTranslation } from "react-i18next"

const BulkListingsRefactor = React.lazy(() =>
  import("../../market/views/ItemListings").then((module) => ({
    default: module.BulkListingsRefactor,
  })),
)

function MarketTabLoader() {
  return null
}

export function BulkItemsPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()
  const theme = useTheme<ExtendedTheme>()

  const [marketSearch, setMarketSearch] = useMarketSearch()
  useEffect(() => {
    setMarketSearch({
      ...marketSearch,
      quantityAvailable: marketSearch.quantityAvailable || 1,
      sort: marketSearch.sort || "activity",
    })
  }, [])

  return (
    <Page title={t("market.bulkItems")}>
      <IconButton
        color="secondary"
        aria-label={t("toggle_market_sidebar")}
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
        <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
          <Grid item xs={12}>
            <Grid
              container
              justifyContent={"space-between"}
              spacing={theme.layoutSpacing.compact}
            >
              <HeaderTitle lg={7} xl={7}>
                {t("market.bulkListings")}
              </HeaderTitle>

              <MarketActions />

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

          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                pb: 3,
              }}
            >
              <Suspense fallback={<MarketTabLoader />}>
                <BulkListingsRefactor />
              </Suspense>
            </Box>
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
