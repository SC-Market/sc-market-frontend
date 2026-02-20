import React from "react"
import { Grid, useMediaQuery } from "@mui/material"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { MemberAssignments } from "../../views/member/MemberAssignments"
import { DashNotificationArea } from "../../views/notifications/DashNotificationArea"
import { UserOrderTrend } from "../../views/orders/OrderTrend"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function MemberDashboard() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const lg = useMediaQuery(theme.breakpoints.up("lg"))
  const xxl = useMediaQuery(theme.breakpoints.up("xxl"))
  const [currentOrg] = useCurrentOrg()

  return (
    <StandardPageLayout
      title={t("dashboard.title")}
      headerTitle={t("dashboard.title")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {xxl && (
        <>
          <Grid item xs={12} lg={2.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrderMetrics />
              <DashNotificationArea />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {!currentOrg && <ReceivedOffersArea />}
              <MemberAssignments />
              <UserOrderTrend />
            </Grid>
          </Grid>
        </>
      )}
      {lg && !xxl && (
        <>
          <Grid item xs={12} lg={3}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrderMetrics />
              <DashNotificationArea />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={9}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {!currentOrg && <ReceivedOffersArea />}
              <MemberAssignments />
              <UserOrderTrend />
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
          <Grid item xs={12}>
            <MemberAssignments />
          </Grid>
          <OrderMetrics />
          <UserOrderTrend />
          <Grid item xs={12}>
            <DashNotificationArea />
          </Grid>
        </>
      )}
    </StandardPageLayout>
  )
}
