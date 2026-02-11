import React, { useRef } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { CreateOrderForm } from "../../views/orders/CreateOrderForm"
import { MyOrders } from "../../views/orders/MyOrders"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page } from "../../components/metadata/Page"
import { useGetServiceByIdQuery } from "../../store/services"
import { Navigate, useParams } from "react-router-dom"
import { ServiceView } from "../../views/contracts/ServiceView"
import { SentOffersArea } from "../../views/offers/ReceivedOffersArea"
import { BuyOrdersViewPaginated } from "../../views/market/DashBuyOrdersArea"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';

export function CreateOrder(props: {}) {
  const { t } = useTranslation()
  return (
    <Page title={t("orders.ordersTitle")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <HeaderTitle lg={12} xl={12}>
          {t("orders.ordersTitle")}
        </HeaderTitle>

        <SentOffersArea />
        <MyOrders />
        <BuyOrdersViewPaginated />
      </ContainerGrid>
    </Page>
  )
}

export function ServiceCreateOrder() {
  const { t } = useTranslation()
  const { service_id } = useParams<{ service_id: string }>()
  const { data: service, error, isError } = useGetServiceByIdQuery(service_id!)
  const orderHeaderRef = useRef<HTMLDivElement>(null)

  return (
    <Page title={t("orders.createOrderTitle")}>
      <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
        {/*<HeaderTitle lg={12} xl={12}>*/}
        {/*    Orders*/}
        {/*</HeaderTitle>*/}

        {shouldRedirectTo404(error) && <Navigate to={"/404"} />}
        {shouldShowErrorPage(error) && <ErrorPage />}

        {service && (
          <ServiceView service={service} orderFormRef={orderHeaderRef} />
        )}

        {service && (
          <HeaderTitle ref={orderHeaderRef} center>
            {t("serviceView.placeOrder", "Place Order")}
          </HeaderTitle>
        )}

        {service && (
          <CreateOrderForm
            key={service.service_id}
            service={service}
            contractor_id={service.contractor?.spectrum_id}
            assigned_to={service.user?.username}
          />
        )}
      </ContainerGrid>
    </Page>
  )
}
