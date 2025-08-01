import React from "react"
import { Page } from "../../components/metadata/Page"
import { useGetAllOrdersQuery } from "../../store/orders"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import {
  OrderTrend,
  TopContractors,
  TopUsers,
  TopUsersThisMonth,
  TopUsersThisWeek,
} from "../../views/orders/OrderTrend"
import { AdminRecentOrders } from "../../views/orders/RecentOrders"
import { useTranslation } from "react-i18next" // added

export function AdminOrderStats() {
  const { t } = useTranslation() // added
  const { data: orders } = useGetAllOrdersQuery()

  return (
    <Page title={t("admin.orderStats", "Admin Order Stats")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <OrderTrend orders={orders || []} />
        <TopContractors orders={orders || []} />
        <TopUsers orders={orders || []} />
        <TopUsersThisWeek orders={orders || []} />
        <TopUsersThisMonth orders={orders || []} />
        <AdminRecentOrders />
      </ContainerGrid>
    </Page>
  )
}
