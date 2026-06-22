import React from "react"
import { useParams } from "react-router-dom"
import { Grid, useMediaQuery } from "@mui/material"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { MemberAssignments } from "../../views/member/MemberAssignments"
import { DashNotificationArea } from "../../views/notifications/DashNotificationArea"
import { UserOrderTrend } from "../../views/orders/OrderTrend"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { MatchingBuyOrdersArea } from "../../features/market/views/MatchingBuyOrdersArea"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function MemberDashboard() {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const lg = useMediaQuery(theme.breakpoints.up("lg"))
  const xxl = useMediaQuery(theme.breakpoints.up("xxl"))

  return (
    <StandardPageLayout
      title={t("dashboard.title")}
      breadcrumbs={[{ label: t("dashboard.title") }]}
      showOrgInBreadcrumbs={true}
      headerTitle={t("dashboard.title")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {xxl && (
        <>
          <Grid item xs={12} lg={2.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrderMetrics spectrumId={contractor_id} />
              <DashNotificationArea />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {!contractor_id && <ReceivedOffersArea />}
              <MatchingBuyOrdersArea />
              <MemberAssignments />
              <UserOrderTrend spectrumId={contractor_id} />
            </Grid>
          </Grid>
        </>
      )}
      {lg && !xxl && (
        <>
          <Grid item xs={12} lg={3}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrderMetrics spectrumId={contractor_id} />
              <DashNotificationArea />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={9}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {!contractor_id && <ReceivedOffersArea />}
              <MatchingBuyOrdersArea />
              <MemberAssignments />
              <UserOrderTrend spectrumId={contractor_id} />
            </Grid>
          </Grid>
        </>
      )}
      {!lg && (
        <>
          {!contractor_id && (
            <Grid item xs={12}>
              <ReceivedOffersArea />
            </Grid>
          )}
          <MatchingBuyOrdersArea />
          <Grid item xs={12}>
            <MemberAssignments />
          </Grid>
          <OrderMetrics spectrumId={contractor_id} />
          <UserOrderTrend spectrumId={contractor_id} />
          <Grid item xs={12}>
            <DashNotificationArea />
          </Grid>
        </>
      )}
    </StandardPageLayout>
  )
}
