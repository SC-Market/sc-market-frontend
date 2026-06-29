import React from "react"
import { useParams, Navigate } from "react-router-dom"
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

  // When viewing org shop orders: show unclaimed offers (like old org orders page)
  // When viewing personal dashboard: show offers assigned to me
  const isOrgContext = !!orgSpectrumId

  // Permission guard: org shop orders require manage_orders permission
  // (matches the old OrgAdminRoute permission="manage_orders" guard)
  if (shopCtx && isOrgContext && shopCtx.shop.permissions?.manage_orders === false) {
    return <Navigate to={`/shops/${shopCtx.shop.slug}`} replace />
  }

  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const lg = useMediaQuery(theme.breakpoints.up("lg"))
  const xxl = useMediaQuery(theme.breakpoints.up("xxl"))

  // Title: "Orders" when viewing org shop, "Dashboard" when personal
  const pageTitle = isOrgContext ? t("orders.title", "Orders") : t("dashboard.title")

  const offersSection = <ReceivedOffersArea unassigned={isOrgContext} />

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
              <OrderMetrics spectrumId={orgSpectrumId} />
              <DashNotificationArea shopId={shopCtx?.shop.shop_id} />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6.5}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {offersSection}
              <MatchingBuyOrdersArea />
              {!isOrgContext && <MemberAssignments />}
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
              <DashNotificationArea shopId={shopCtx?.shop.shop_id} />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={9}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {offersSection}
              <MatchingBuyOrdersArea />
              {!isOrgContext && <MemberAssignments />}
              <UserOrderTrend spectrumId={orgSpectrumId} />
            </Grid>
          </Grid>
        </>
      )}
      {!lg && (
        <>
          <Grid item xs={12}>
            {offersSection}
          </Grid>
          <MatchingBuyOrdersArea />
          {!isOrgContext && (
            <Grid item xs={12}>
              <MemberAssignments />
            </Grid>
          )}
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
