import React, { useEffect, useState } from "react"
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
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GridRowSelectionModel } from "@mui/x-data-grid"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../../components/mobile/BottomSheet"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import useTheme1 from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import MaterialLink from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Grid2 from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded';
import AccountBoxRounded from '@mui/icons-material/AccountBoxRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import Block from '@mui/icons-material/Block';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import HowToRegRounded from '@mui/icons-material/HowToRegRounded';

export function ManageStock() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [open, setOpen] = useState(!isMobile)
  const [searchState, setSearchState] = useMarketSearch()
  const navigate = useNavigate()
  const location = useLocation()

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
    <Page title={t("sidebar.manage_listings")}>
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

          <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
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
          </ContainerGrid>
        </MarketSidebarContext.Provider>
      </ItemStockContext.Provider>
    </Page>
  )
}
