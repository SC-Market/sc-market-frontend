import React, { useEffect, useState, Suspense } from "react"
import { HeaderTitle } from "../../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Page } from "../../../components/metadata/Page"
import {
  MarketActions,
  HideOnScroll,
  MarketNavArea,
} from "../../../features/market"
import { MarketSidebarContext, useMarketSearch } from "../../market"
import { useTranslation } from "react-i18next"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';

const BulkListingsRefactor = React.lazy(() =>
  import("../../../views/market/ItemListings").then((module) => ({
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

          <Grid
            item
            container
            xs={12}
            lg={12}
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <Suspense fallback={<MarketTabLoader />}>
              <BulkListingsRefactor />
            </Suspense>
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
