import React, { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageAdminOrderStats } from "../../features/admin/hooks/usePageAdminOrderStats"
import { useShowTestOrders } from "../../features/admin/hooks/useShowTestOrders"
import {
  AdminOrderStatsSkeleton,
  OrderAnalyticsSkeleton,
  OfferAnalyticsSkeleton,
} from "../../features/admin/components/AdminOrderStatsSkeleton"
import { useGetOfferAnalyticsQuery } from "../../features/admin/api/adminApi"
import { Divider, Grid, Typography } from "@mui/material"
import { LabeledSwitch } from "../../components/buttons/LabeledSwitch"
import { lazyWithRetry } from "../../util/lazyWithRetry"

const OrderAnalyticsCharts = lazyWithRetry(() =>
  import("../../views/orders/OrderAnalytics").then((m) => ({
    default: m.OrderAnalyticsCharts,
  })),
)

const TopShopsAnalytics = lazyWithRetry(() =>
  import("../../views/orders/OrderAnalytics").then((m) => ({
    default: m.TopShopsAnalytics,
  })),
)

const TopUsersAnalytics = lazyWithRetry(() =>
  import("../../views/orders/OrderAnalytics").then((m) => ({
    default: m.TopUsersAnalytics,
  })),
)

const OrderSummary = lazyWithRetry(() =>
  import("../../views/orders/OrderAnalytics").then((m) => ({
    default: m.OrderSummary,
  })),
)

const AdminRecentOrders = lazyWithRetry(() =>
  import("../../views/orders/RecentOrders").then((m) => ({
    default: m.AdminRecentOrders,
  })),
)

const OfferAnalyticsCharts = lazyWithRetry(() =>
  import("../../views/offers/OfferAnalytics").then((m) => ({
    default: m.OfferAnalyticsCharts,
  })),
)

const OfferTopShopsAnalytics = lazyWithRetry(() =>
  import("../../views/offers/OfferAnalytics").then((m) => ({
    default: m.OfferTopShopsAnalytics,
  })),
)

const OfferTopUsersAnalytics = lazyWithRetry(() =>
  import("../../views/offers/OfferAnalytics").then((m) => ({
    default: m.OfferTopUsersAnalytics,
  })),
)

const OfferSummary = lazyWithRetry(() =>
  import("../../views/offers/OfferAnalytics").then((m) => ({
    default: m.OfferSummary,
  })),
)

export function AdminOrderStats() {
  const { t } = useTranslation()
  // Orders involving test accounts, orgs or shops are left out of the stats
  // and the list unless shown (?include_test=true).
  const [showTestOrders, setShowTestOrders] = useShowTestOrders()
  const {
    data: orderAnalytics,
    isLoading: ordersLoading,
    error: ordersError,
  } = usePageAdminOrderStats({
    includeTest: showTestOrders,
  })
  const { data: offerAnalytics, isLoading: offersLoading } =
    useGetOfferAnalyticsQuery()

  const isLoading = ordersLoading && offersLoading

  return (
    <StandardPageLayout
      title={t("admin.orderStats", "Admin Order Stats")}
      headerTitle={t("admin.orderStats", "Admin Order Stats")}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
      error={ordersError}
      skeleton={<AdminOrderStatsSkeleton />}
    >
      <Grid item xs={12}>
        <LabeledSwitch
          label={t("admin.showTestOrders", "Show test orders")}
          checked={showTestOrders}
          onChange={setShowTestOrders}
        />
      </Grid>
      <Suspense fallback={<AdminOrderStatsSkeleton />}>
        {ordersLoading ? (
          <OrderAnalyticsSkeleton />
        ) : orderAnalytics ? (
          <>
            <OrderAnalyticsCharts analytics={orderAnalytics} />
            <TopShopsAnalytics analytics={orderAnalytics} />
            <TopUsersAnalytics analytics={orderAnalytics} />
            <OrderSummary analytics={orderAnalytics} />
            <AdminRecentOrders includeTest={showTestOrders} />
          </>
        ) : null}

        {offersLoading ? (
          <OfferAnalyticsSkeleton />
        ) : offerAnalytics ? (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" sx={{ mb: 2 }}>
                {t("admin.offerAnalytics", "Offer Analytics")}
              </Typography>
            </Grid>
            <OfferAnalyticsCharts analytics={offerAnalytics} />
            <OfferTopShopsAnalytics analytics={offerAnalytics} />
            <OfferTopUsersAnalytics analytics={offerAnalytics} />
            <OfferSummary analytics={offerAnalytics} />
          </>
        ) : null}
      </Suspense>
    </StandardPageLayout>
  )
}
