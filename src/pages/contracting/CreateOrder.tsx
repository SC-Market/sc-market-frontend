import React, { useRef } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { CreateOrderForm } from "../../views/orders/CreateOrderForm"
import { MyOrders } from "../../views/orders/MyOrders"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useGetServiceByIdQuery } from "../../store/services"
import { Navigate, useParams } from "react-router-dom"
import { ServiceView } from "../../views/contracts/ServiceView"
import { SentOffersArea } from "../../views/offers/ReceivedOffersArea"
import { BuyOrdersViewPaginated } from "../../features/market/views/DashBuyOrdersArea"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"
import { usePageServiceOrder } from "../../features/contracting/hooks/usePageServiceOrder"

export function CreateOrder(props: {}) {
  const { t } = useTranslation()
  return (
    <StandardPageLayout
      title={t("orders.ordersTitle")}
      headerTitle={t("orders.ordersTitle")}
      maxWidth="md"
      sidebarOpen={true}
    >
      <SentOffersArea />
      <MyOrders />
      <BuyOrdersViewPaginated />
    </StandardPageLayout>
  )
}

export function ServiceCreateOrder() {
  const { t } = useTranslation()
  const { service_id } = useParams<{ service_id: string }>()
  const { service, isLoading, error } = usePageServiceOrder(service_id!)
  const orderHeaderRef = useRef<HTMLDivElement>(null)

  return (
    <StandardPageLayout
      title={t("orders.createOrderTitle")}
      maxWidth="lg"
      sidebarOpen={true}
      isLoading={isLoading}
      error={error}
    >
      {service && (
        <>
          <ServiceView service={service} orderFormRef={orderHeaderRef} />

          <HeaderTitle ref={orderHeaderRef} center>
            {t("serviceView.placeOrder", "Place Order")}
          </HeaderTitle>

          <CreateOrderForm
            key={service.service_id}
            service={service}
            contractor_id={service.contractor?.spectrum_id}
            assigned_to={service.user?.username}
          />
        </>
      )}
    </StandardPageLayout>
  )
}
