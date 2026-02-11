import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { RecentOrders } from "../../views/orders/RecentOrders"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page } from "../../components/metadata/Page"
import { OrgOrderTrend } from "../../views/orders/OrderTrend"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { useTranslation } from "react-i18next"
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
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
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

export function OrgOrders() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const xxl = useMediaQuery(theme.breakpoints.up("xxl"))
  const lg = useMediaQuery(theme.breakpoints.up("lg"))

  return (
    <Page title={t("orders.orgOrdersTitle")}>
      <ContainerGrid maxWidth={"xxl"} sidebarOpen={true}>
        <HeaderTitle>{t("orders.ordersTitle")}</HeaderTitle>

        {xxl && (
          <>
            <Grid item xs={12} lg={2.5}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <OrderMetrics />
              </Grid>
            </Grid>
            <Grid item xs={12} lg={6.5}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <ReceivedOffersArea />
                <RecentOrders />
              </Grid>
            </Grid>
            <Grid item xs={12} lg={3}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <OrgOrderTrend />
              </Grid>
            </Grid>
          </>
        )}

        {lg && !xxl && (
          <>
            <Grid item xs={12} lg={3}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <OrderMetrics />
              </Grid>
            </Grid>
            <Grid item xs={12} lg={9}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <ReceivedOffersArea />
                <RecentOrders />
                <OrgOrderTrend />
              </Grid>
            </Grid>
          </>
        )}

        {!lg && (
          <>
            <Grid item xs={12}>
              <ReceivedOffersArea />
            </Grid>
            <Grid item xs={12}>
              <RecentOrders />
            </Grid>
            <OrderMetrics />
            <OrgOrderTrend />
          </>
        )}
      </ContainerGrid>
    </Page>
  )
}
