import React from "react"
import { RecentOrders } from "../../views/orders/RecentOrders"
import { OrgOrderTrend } from "../../views/orders/OrderTrend"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { useTranslation } from "react-i18next"
import { Grid, useMediaQuery, useTheme } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function OrgOrders() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const xxl = useMediaQuery(theme.breakpoints.up("xxl"))
  const lg = useMediaQuery(theme.breakpoints.up("lg"))

  return (
    <StandardPageLayout
      title={t("orders.orgOrdersTitle")}
      headerTitle={t("orders.ordersTitle")}
      sidebarOpen={true}
      maxWidth="xxl"
    >
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
    </StandardPageLayout>
  )
}
