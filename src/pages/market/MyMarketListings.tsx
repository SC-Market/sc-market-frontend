import React, { useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { PageBreadcrumbs } from "../../components/navigation"
import { MyItemListings } from "../../views/market/ItemListings"
import { MarketSidebar } from "../../features/market/components/MarketSidebar"
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
import AddRounded from '@mui/icons-material/AddRounded';
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded';
import AccountBoxRounded from '@mui/icons-material/AccountBoxRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import Block from '@mui/icons-material/Block';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import HowToRegRounded from '@mui/icons-material/HowToRegRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ArrowBack from '@mui/icons-material/ArrowBack';

export function MyMarketListings(props: {}) {
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Page title={t("sidebar.my_market_listings")}>
      <IconButton
        color="secondary"
        aria-label={t("toggle_market_sidebar")}
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
          <Grid item xs={12}>
            <PageBreadcrumbs
              items={[
                { label: t("market.title", "Market"), href: "/market" },
                { label: t("sidebar.my_market_listings") },
              ]}
            />
          </Grid>
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
          </Grid>

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
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <MyItemListings status={"active"} />
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
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <MyItemListings status={"inactive"} />
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
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <MyItemListings status={"archived"} />
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
