import React from "react"
import { useParams } from "react-router-dom"
import { RecentOrders } from "../../views/orders/RecentOrders"
import { OrgOrderTrend } from "../../views/orders/OrderTrend"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { useTranslation } from "react-i18next"
import { Grid, useMediaQuery, useTheme } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function OrgOrders() {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const xxl = useMediaQuery(theme.breakpoints.up("xxl"))
  const lg = useMediaQuery(theme.breakpoints.up("lg"))

  return (
    <StandardPageLayout
      title={t("orders.orgOrdersTitle")}
      headerTitle={t("orders.ordersTitle")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {xxl && (
        <>
          <Grid item xs={12} lg={2.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrderMetrics spectrumId={contractor_id} />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <ReceivedOffersArea unassigned />
              <RecentOrders unassigned />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={3}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrgOrderTrend spectrumId={contractor_id} />
            </Grid>
          </Grid>
        </>
      )}

      {lg && !xxl && (
        <>
          <Grid item xs={12} lg={3}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrderMetrics spectrumId={contractor_id} />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={9}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <ReceivedOffersArea unassigned />
              <RecentOrders unassigned />
              <OrgOrderTrend spectrumId={contractor_id} />
            </Grid>
          </Grid>
        </>
      )}

      {!lg && (
        <>
          <Grid item xs={12}>
            <ReceivedOffersArea unassigned />
          </Grid>
          <Grid item xs={12}>
            <RecentOrders unassigned />
          </Grid>
          <OrderMetrics spectrumId={contractor_id} />
          <OrgOrderTrend spectrumId={contractor_id} />
        </>
      )}
    </StandardPageLayout>
  )
}
