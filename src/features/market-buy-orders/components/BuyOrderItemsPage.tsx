import React, { useEffect, useState, Suspense } from "react"
import { HeaderTitle } from "../../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Page } from "../../../components/metadata/Page"
import { BuyOrderActions } from "../../market/components/MarketActions"
import { HideOnScroll, MarketNavArea } from "../../market/components/MarketNavArea"
import { MarketSidebar, MarketSideBarToggleButton, MarketSearchArea } from "../../market/components/MarketSidebar"
import { MarketSidebarContext } from "../../market/hooks/MarketSidebar"
import { useMarketSearch } from "../../market/hooks/MarketSearch"
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
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import EditRounded from '@mui/icons-material/EditRounded';

const BuyOrders = React.lazy(() =>
  import("../../../views/market/ItemListings").then((module) => ({
    default: module.BuyOrders,
  })),
)

function MarketTabLoader() {
  return null
}

export function BuyOrderItemsPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))

  const [marketSearch, setMarketSearch] = useMarketSearch()
  useEffect(() => {
    setMarketSearch({
      ...marketSearch,
      quantityAvailable: 0,
      sort: marketSearch.sort || "activity",
    })
  }, [])

  return (
    <Page title={t("market.buyOrders")}>
      <MarketSidebarContext.Provider value={[open, setOpen]}>
        {xs && <MarketSidebar />}
        {xs && <MarketSideBarToggleButton />}
        <ContainerGrid maxWidth={"xl"} sidebarOpen={false}>
          <Grid item xs={12}>
            <Grid
              container
              justifyContent={"space-between"}
              spacing={theme.layoutSpacing.compact}
            >
              <HeaderTitle lg={7} xl={7}>
                {t("market.buyOrders")}
              </HeaderTitle>

              <BuyOrderActions />

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
            xs={0}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Paper sx={{ padding: 1 }}>
              <MarketSearchArea />
            </Paper>
          </Grid>

          <Grid
            item
            container
            xs={12}
            md={9}
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <Suspense fallback={<MarketTabLoader />}>
              <BuyOrders />
            </Suspense>
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
