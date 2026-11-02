import React from "react"
import { OrdersTableView, OrdersViewPaginated } from "./OrderList"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAdminOrderSearch } from "../../features/admin/hooks/useAdminOrderSearch"

export function RecentOrders({ unassigned }: { unassigned?: boolean } = {}) {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const { t } = useTranslation()

  return (
    <OrdersViewPaginated
      title={t("recentOrders.title")}
      contractor={contractor_id}
      unassigned={unassigned}
    />
  )
}

/** Admin › Orders: every order on the site; test orders only with `includeTest`. */
export function AdminRecentOrders({ includeTest }: { includeTest: boolean }) {
  const { t } = useTranslation()
  const search = useAdminOrderSearch({ includeTest })

  return <OrdersTableView title={t("recentOrders.title")} search={search} />
}
