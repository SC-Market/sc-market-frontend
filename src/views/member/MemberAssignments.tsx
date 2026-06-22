import React from "react"
import { OrdersViewPaginated } from "../orders/OrderList"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function MemberAssignments() {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const { t } = useTranslation()

  return (
    <OrdersViewPaginated
      title={t("MemberAssignments.assignments")}
      contractor={contractor_id}
      assigned
    />
  )
}
