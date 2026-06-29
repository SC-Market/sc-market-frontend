import React from "react"
import { OrdersViewPaginated } from "../orders/OrderList"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useOptionalShopRouteContext } from "../../components/router/ShopContextFromRoute"

export function MemberAssignments() {
  const shopCtx = useOptionalShopRouteContext()
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const spectrumId = shopCtx?.shop.owner_contractor_spectrum_id || contractor_id
  const { t } = useTranslation()

  return (
    <OrdersViewPaginated
      title={t("MemberAssignments.assignments")}
      contractor={spectrumId}
      assigned
    />
  )
}
