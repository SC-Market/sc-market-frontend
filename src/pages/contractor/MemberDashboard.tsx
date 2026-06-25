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
import { useOptionalShopRouteContext } from "../../components/router/ShopContextFromRoute"


export function MemberDashboard() {
  // When under /shop/:shopSlug/orders, derive contractor spectrum_id from shop
  const shopCtx = useOptionalShopRouteContext()
  const shopSpectrumId = shopCtx?.shop.owner_contractor_spectrum_id || undefined

  // Legacy: when mounted under /org/:contractor_id/dashboard
  const { contractor_id: routeContractorId } = useParams<{ contractor_id: string }>()

  // Use shop's owner org spectrum_id when under shop route, else route param
  const orgSpectrumId = shopCtx ? shopSpectrumId : routeContractorId

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
              <OrderMetrics spectrumId={orgSpectrumId} />
              <DashNotificationArea />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {!orgSpectrumId && <ReceivedOffersArea />}
              <MatchingBuyOrdersArea />
              <MemberAssignments />
              <UserOrderTrend spectrumId={orgSpectrumId} />
            </Grid>
          </Grid>
        </>
      )}
      {lg && !xxl && (
        <>
          <Grid item xs={12} lg={3}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrderMetrics spectrumId={orgSpectrumId} />
              <DashNotificationArea />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={9}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {!orgSpectrumId && <ReceivedOffersArea />}
              <MatchingBuyOrdersArea />
              <MemberAssignments />
              <UserOrderTrend spectrumId={orgSpectrumId} />
            </Grid>
          </Grid>
        </>
      )}
      {!lg && (
        <>
          {!orgSpectrumId && (
            <Grid item xs={12}>
              <ReceivedOffersArea />
            </Grid>
          )}
          <MatchingBuyOrdersArea />
          <Grid item xs={12}>
            <MemberAssignments />
          </Grid>
          <OrderMetrics spectrumId={orgSpectrumId} />
          <UserOrderTrend spectrumId={orgSpectrumId} />
          <Grid item xs={12}>
            <DashNotificationArea />
          </Grid>
        </>
      )}
    </StandardPageLayout>
  )
}
