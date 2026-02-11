import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { MemberAssignments } from "../../views/member/MemberAssignments"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { Page } from "../../components/metadata/Page"
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
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';

export function OrdersAssigned() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Page title={t("sidebar.orders_assigned_to_me")}>
      <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
        <HeaderTitle>{t("sidebar.orders_assigned_to_me")}</HeaderTitle>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12} lg={3}>
            <OrderMetrics />
          </Grid>
          <Grid item xs={12} lg={9}>
            <MemberAssignments />
          </Grid>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
