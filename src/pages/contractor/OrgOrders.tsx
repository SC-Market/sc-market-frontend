import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { RecentOrders } from "../../views/orders/RecentOrders"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page } from "../../components/metadata/Page"
import { OrgOrderTrend } from "../../views/orders/OrderTrend"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { useTranslation } from "react-i18next"
import { Grid, useMediaQuery, useTheme } from "@mui/material"

export function OrgOrders() {
  const { t } = useTranslation()
  const theme = useTheme()
  const xxl = useMediaQuery(theme.breakpoints.up("xxl"))
  const lg = useMediaQuery(theme.breakpoints.up("lg"))

  return (
    <Page title={t("orders.orgOrdersTitle")}>
      <ContainerGrid maxWidth={"xxl"} sidebarOpen={true}>
        <HeaderTitle>{t("orders.ordersTitle")}</HeaderTitle>
        
        {xxl && (
          <>
            <Grid item xs={12} lg={2.5}>
              <Grid container spacing={3}>
                <OrderMetrics />
              </Grid>
            </Grid>
            <Grid item xs={12} lg={6.5}>
              <Grid container spacing={3}>
                <ReceivedOffersArea />
                <RecentOrders />
              </Grid>
            </Grid>
            <Grid item xs={12} lg={3}>
              <Grid container spacing={3}>
                <OrgOrderTrend />
              </Grid>
            </Grid>
          </>
        )}
        
        {lg && !xxl && (
          <>
            <Grid item xs={12} lg={3}>
              <Grid container spacing={3}>
                <OrderMetrics />
              </Grid>
            </Grid>
            <Grid item xs={12} lg={9}>
              <Grid container spacing={3}>
                <ReceivedOffersArea />
                <RecentOrders />
                <OrgOrderTrend />
              </Grid>
            </Grid>
          </>
        )}
        
        {!lg && (
          <>
            <ReceivedOffersArea />
            <RecentOrders />
            <OrderMetrics />
            <OrgOrderTrend />
          </>
        )}
      </ContainerGrid>
    </Page>
  )
}
