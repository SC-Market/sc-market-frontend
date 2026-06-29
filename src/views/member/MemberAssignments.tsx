import React from "react"
import { OrdersViewPaginated } from "../orders/OrderList"
import { useTranslation } from "react-i18next"

export function MemberAssignments() {
  const { t } = useTranslation()

  return (
    <OrdersViewPaginated
      title={t("MemberAssignments.assignments")}
      assigned
    />
  )
}
