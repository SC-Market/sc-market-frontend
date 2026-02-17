import React, { useEffect, useState } from "react"
import {
  Button,
  Grid,
  Paper,
  useMediaQuery,
  Box,
  Tabs,
  Tab,
} from "@mui/material"
import AddRounded from "@mui/icons-material/AddRounded"
import FilterListIcon from "@mui/icons-material/FilterList"
import { MarketSearchArea } from "../../features/market/components/MarketSidebar"
import { MarketSidebarContext } from "../../features/market"
import {
  ItemStockContext,
  MyItemStock,
} from "../../features/market/components/ItemStock"
import { useMarketSearch } from "../../features/market"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GridRowSelectionModel } from "@mui/x-data-grid"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../../components/mobile/BottomSheet"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageManageStock } from "../../features/market/hooks/usePageManageStock"

export function ManageStock() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [open, setOpen] = useState(!isMobile)
  const [searchState, setSearchState] = useMarketSearch()
  const navigate = useNavigate()
  const location = useLocation()
  const pageData = usePageManageStock()

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

  const currentTab = location.pathname === "/market/manage" ? 0 : 1

  const handleTabChange = (_: any, newValue: number) => {
    if (newValue === 0) {
      navigate("/market/manage")
    } else {
      navigate("/market/manage-stock")
    }
  }

  return (
    <StandardPageLayout
      title={t("sidebar.manage_listings")}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      <ItemStockContext.Provider value={[selectionModel, setSelectionModel]}>
        <MarketSidebarContext.Provider value={[open, setOpen]}>
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

          <Grid item xs={12}>
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
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab
                  label={t("sidebar.manage_listings", "Manage Listings")}
                />
                <Tab label={t("sidebar.manage_stock", "Manage Stock")} />
              </Tabs>
              <Box sx={{ flexGrow: 1 }} />
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
            </Box>
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
        </MarketSidebarContext.Provider>
      </ItemStockContext.Provider>
    </StandardPageLayout>
  )
}
