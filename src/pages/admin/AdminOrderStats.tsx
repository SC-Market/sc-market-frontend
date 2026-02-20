import React, { lazy, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageAdminOrderStats } from "../../features/admin/hooks/usePageAdminOrderStats"
import { AdminOrderStatsSkeleton } from "../../features/admin/components/AdminOrderStatsSkeleton"
import { Grid } from "@mui/material"

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

export function AdminOrderStats() {
  const { t } = useTranslation()
  const { data: analytics, isLoading, error } = usePageAdminOrderStats()

  return (
    <StandardPageLayout
      title={t("admin.orderStats", "Admin Order Stats")}
      headerTitle={t("admin.orderStats", "Admin Order Stats")}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
      error={error}
      skeleton={<AdminOrderStatsSkeleton />}
    >
      {analytics && (
        <Suspense fallback={<AdminOrderStatsSkeleton />}>
          <OrderAnalyticsCharts analytics={analytics} />
          <TopContractorsAnalytics analytics={analytics} />
          <TopUsersAnalytics analytics={analytics} />
          <OrderSummary analytics={analytics} />
          <AdminRecentOrders />
        </Suspense>
      )}
    </StandardPageLayout>
  )
}
