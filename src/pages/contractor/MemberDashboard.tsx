import React from "react"
import { Navigate } from "react-router-dom"
import { Grid, useMediaQuery } from "@mui/material"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { OrdersViewPaginated } from "../../views/orders/OrderList"
import { DashNotificationArea } from "../../views/notifications/DashNotificationArea"
import { UserOrderTrend } from "../../views/orders/OrderTrend"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { MatchingBuyOrdersArea } from "../../features/market/views/MatchingBuyOrdersArea"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useOptionalShopRouteContext } from "../../components/router/ShopContextFromRoute"
import { SHOP_PATHS } from "../../routes/paths"
import { useFeatureFlag } from "../../hooks/market"
import { CustomizableDashboard } from "../../features/dashboard/CustomizableDashboard"

export function MemberDashboard() {
  const shopCtx = useOptionalShopRouteContext()
  const { flags } = useFeatureFlag()
  const spectrumId = shopCtx?.shop.owner_contractor_spectrum_id || undefined

  // Behind the customizable_dashboard flag, the personal dashboard is replaced by
  // the widget-based CustomizableDashboard. Shop/org routes keep the legacy layout
  // until shared dashboards land (see docs/customizable-dashboard-plan.md, M4).
  if (flags.customizable_dashboard && !shopCtx) {
    return <CustomizableDashboard />
  }

  if (shopCtx && spectrumId && shopCtx.shop.permissions?.manage_orders === false) {
    return <Navigate to={SHOP_PATHS.profile(shopCtx.shop.slug)} replace />
  }

  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const lg = useMediaQuery(theme.breakpoints.up("lg"))
  const xxl = useMediaQuery(theme.breakpoints.up("xxl"))

  const pageTitle = shopCtx
    ? t("orders.title", "Orders")
    : t("dashboard.title")

  const offersSection = <ReceivedOffersArea unassigned={!!shopCtx} />

  const ordersSection = shopCtx
    ? <OrdersViewPaginated title={t("orders.title", "Orders")} shop_id={shopCtx.shop.shop_id} />
    : <OrdersViewPaginated title={t("MemberAssignments.assignments")} assigned />

  return (
    <StandardPageLayout
      title={pageTitle}
      breadcrumbs={[{ label: pageTitle }]}
      showOrgInBreadcrumbs={!shopCtx}
      headerTitle={pageTitle}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {xxl && (
        <>
          <Grid item xs={12} lg={2.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrderMetrics spectrumId={spectrumId} shopId={shopCtx?.shop.shop_id} />
              <DashNotificationArea shopId={shopCtx?.shop.shop_id} />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {offersSection}
              {ordersSection}
              <MatchingBuyOrdersArea />
              <UserOrderTrend spectrumId={spectrumId} shopId={shopCtx?.shop.shop_id} />
            </Grid>
          </Grid>
        </>
      )}
      {lg && !xxl && (
        <>
          <Grid item xs={12} lg={3}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <OrderMetrics spectrumId={spectrumId} shopId={shopCtx?.shop.shop_id} />
              <DashNotificationArea shopId={shopCtx?.shop.shop_id} />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={9}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {offersSection}
              {ordersSection}
              <MatchingBuyOrdersArea />
              <UserOrderTrend spectrumId={spectrumId} shopId={shopCtx?.shop.shop_id} />
            </Grid>
          </Grid>
        </>
      )}
      {!lg && (
        <>
          <Grid item xs={12}>
            {offersSection}
          </Grid>
          {ordersSection}
          <MatchingBuyOrdersArea />
          <OrderMetrics spectrumId={spectrumId} shopId={shopCtx?.shop.shop_id} />
          <UserOrderTrend spectrumId={spectrumId} shopId={shopCtx?.shop.shop_id} />
          <Grid item xs={12}>
            <DashNotificationArea shopId={shopCtx?.shop.shop_id} />
          </Grid>
        </>
      )}
    </StandardPageLayout>
  )
}
