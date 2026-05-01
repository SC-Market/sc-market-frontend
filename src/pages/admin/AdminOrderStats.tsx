import React, { lazy, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageAdminOrderStats } from "../../features/admin/hooks/usePageAdminOrderStats"
import { AdminOrderStatsSkeleton } from "../../features/admin/components/AdminOrderStatsSkeleton"
import { useGetOfferAnalyticsQuery } from "../../features/admin/api/adminApi"
import { Divider, Grid, Typography } from "@mui/material"

const OrderAnalyticsCharts = lazy(() =>
  import("../../views/orders/OrderAnalytics").then((m) => ({
    default: m.OrderAnalyticsCharts,
  })),
)

const TopContractorsAnalytics = lazy(() =>
  import("../../views/orders/OrderAnalytics").then((m) => ({
    default: m.TopContractorsAnalytics,
  })),
)

const TopUsersAnalytics = lazy(() =>
  import("../../views/orders/OrderAnalytics").then((m) => ({
    default: m.TopUsersAnalytics,
  })),
)

const OrderSummary = lazy(() =>
  import("../../views/orders/OrderAnalytics").then((m) => ({
    default: m.OrderSummary,
  })),
)

const AdminRecentOrders = lazy(() =>
  import("../../views/orders/RecentOrders").then((m) => ({
    default: m.AdminRecentOrders,
  })),
)

const OfferAnalyticsCharts = lazy(() =>
  import("../../views/offers/OfferAnalytics").then((m) => ({
    default: m.OfferAnalyticsCharts,
  })),
)

const OfferTopContractorsAnalytics = lazy(() =>
  import("../../views/offers/OfferAnalytics").then((m) => ({
    default: m.OfferTopContractorsAnalytics,
  })),
)

const OfferTopUsersAnalytics = lazy(() =>
  import("../../views/offers/OfferAnalytics").then((m) => ({
    default: m.OfferTopUsersAnalytics,
  })),
)

const OfferSummary = lazy(() =>
  import("../../views/offers/OfferAnalytics").then((m) => ({
    default: m.OfferSummary,
  })),
)

export function AdminOrderStats() {
  const { t } = useTranslation()
  const { data: orderAnalytics, isLoading: ordersLoading, error: ordersError } = usePageAdminOrderStats()
  const { data: offerAnalytics, isLoading: offersLoading } = useGetOfferAnalyticsQuery()

  const isLoading = ordersLoading || offersLoading

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
      <Suspense fallback={<AdminOrderStatsSkeleton />}>
        {orderAnalytics && (
          <>
            <OrderAnalyticsCharts analytics={orderAnalytics} />
            <TopContractorsAnalytics analytics={orderAnalytics} />
            <TopUsersAnalytics analytics={orderAnalytics} />
            <OrderSummary analytics={orderAnalytics} />
            <AdminRecentOrders />
          </>
        )}

        {offerAnalytics && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" sx={{ mb: 2 }}>
                {t("admin.offerAnalytics", "Offer Analytics")}
              </Typography>
            </Grid>
            <OfferAnalyticsCharts analytics={offerAnalytics} />
            <OfferTopContractorsAnalytics analytics={offerAnalytics} />
            <OfferTopUsersAnalytics analytics={offerAnalytics} />
            <OfferSummary analytics={offerAnalytics} />
          </>
        )}
      </Suspense>
    </StandardPageLayout>
  )
}
