import React from "react"
import { OrdersViewPaginated } from "./OrderList"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

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

export function AdminRecentOrders() {
  const { t } = useTranslation()

  return <OrdersViewPaginated title={t("recentOrders.title")} />
}
