import React, { useEffect, useState } from "react"
import { Button, Grid, Paper, useMediaQuery, Box } from "@mui/material"
import AddRounded from "@mui/icons-material/AddRounded"
import FilterListIcon from "@mui/icons-material/FilterList"
import { MarketSearchArea } from "../../features/market/components/MarketSidebar"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { MarketSidebarContext } from "../../features/market"
import { Page } from "../../components/metadata/Page"
import {
  ItemStockContext,
  MyItemStock,
} from "../../features/market/components/ItemStock"
import { useMarketSearch } from "../../features/market"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GridRowSelectionModel } from "@mui/x-data-grid"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../../components/mobile/BottomSheet"
import { AllStockLotsGrid } from "../../features/market/components/stock/AllStockLotsGrid"

export function ManageStock() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [open, setOpen] = useState(!isMobile) // Start closed on mobile
  const [searchState, setSearchState] = useMarketSearch()

  useEffect(() => {
    setSearchState({
      query: "",
      quantityAvailable: 0,
      sort: searchState.sort || "activity",
      statuses: "active,inactive",
    })
  }, [])

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  })

  return (
    <Page title={t("sidebar.my_market_listings")}>
      <ItemStockContext.Provider value={[selectionModel, setSelectionModel]}>
        <MarketSidebarContext.Provider value={[open, setOpen]}>
          {/* Mobile filter bottom sheet */}
          {isMobile && (
            <BottomSheet
              open={open}
              onClose={() => setOpen(false)}
              title={t("market.filters", "Filters")}
              maxHeight="90vh"
            >
              <Box sx={{ overflowY: "auto", overflowX: "hidden", pb: 2 }}>
                <MarketSearchArea status />
              </Box>
            </BottomSheet>
          )}

          <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
            <Grid item xs={12}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                spacing={theme.layoutSpacing.layout}
              >
                <Grid item>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {isMobile && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<FilterListIcon />}
                        onClick={() => setOpen((prev) => !prev)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                        }}
                      >
                        {t("market.filters", "Filters")}
                      </Button>
                    )}
                    <HeaderTitle>{t("sidebar.manage_listings")}</HeaderTitle>
                  </Box>
                </Grid>
                <Grid item>
                  <Link to="/market/create" style={{ textDecoration: "none" }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<AddRounded />}
                      size="large"
                    >
                      {t("market.createListing", "Create Listing")}
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            </Grid>

            {!isMobile && (
              <Grid item xs={12} md={3}>
                <Paper>
                  <MarketSearchArea status />
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} md={isMobile ? 12 : 9}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <Grid item xs={12}>
                  <MyItemStock />
                </Grid>

                <Grid item xs={12}>
                  <AllStockLotsGrid />
                </Grid>
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Link to={"/market/me"} style={{ color: "inherit" }}>
                <UnderlineLink>{t("sidebar.archived_listings")}</UnderlineLink>
              </Link>
            </Grid>
          </ContainerGrid>
        </MarketSidebarContext.Provider>
      </ItemStockContext.Provider>
    </Page>
  )
}
