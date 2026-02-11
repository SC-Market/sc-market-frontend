import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { MemberAssignments } from "../../views/member/MemberAssignments"
import { Page } from "../../components/metadata/Page"
import { DashNotificationArea } from "../../views/notifications/DashNotificationArea"
import { UserOrderTrend } from "../../views/orders/OrderTrend"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
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
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';

export function MemberDashboard() {
  // TODO: Add a notifications section here, and maybe some other content

  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const lg = useMediaQuery(theme.breakpoints.up("lg"))
  const xxl = useMediaQuery(theme.breakpoints.up("xxl"))
  const [currentOrg] = useCurrentOrg()

  return (
    <Page title={t("dashboard.title")}>
      <ContainerGrid maxWidth={"xxl"} sidebarOpen={true}>
        <HeaderTitle>{t("dashboard.title")}</HeaderTitle>
        {xxl && (
          <>
            <Grid item xs={12} lg={2.5}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                {/*<MemberBalance/>*/}
                <OrderMetrics />
                <DashNotificationArea />
              </Grid>
            </Grid>
            <Grid item xs={12} lg={6.5}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                {!currentOrg && <ReceivedOffersArea />}
                <MemberAssignments />
                <UserOrderTrend />
                {/*<UserTransactions/>*/}
              </Grid>
            </Grid>
            {/*<Grid item xs={12} lg={3}>*/}
            {/*    <DashNotificationArea/>*/}
            {/*</Grid>*/}
          </>
        )}
        {lg && !xxl && (
          <>
            <Grid item xs={12} lg={3}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                {/*<MemberBalance/>*/}
                <OrderMetrics />
                <DashNotificationArea />
              </Grid>
            </Grid>
            <Grid item xs={12} lg={9}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                {!currentOrg && <ReceivedOffersArea />}
                <MemberAssignments />
                <UserOrderTrend />
                {/*<UserTransactions/>*/}
              </Grid>
            </Grid>
          </>
        )}
        {!lg && (
          <>
            {!currentOrg && (
              <Grid item xs={12}>
                <ReceivedOffersArea />
              </Grid>
            )}
            {/*<MemberBalance/>*/}
            <Grid item xs={12}>
              <MemberAssignments />
            </Grid>
            {/*<UserTransactions/>*/}
            <OrderMetrics />
            <UserOrderTrend />
            <Grid item xs={12}>
              <DashNotificationArea />
            </Grid>
          </>
        )}
      </ContainerGrid>
    </Page>
  )
}
