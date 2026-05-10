import React, { useState } from "react"
import { RecentOrders } from "../../views/orders/RecentOrders"
import { OrgOrderTrend } from "../../views/orders/OrderTrend"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { useTranslation } from "react-i18next"
import { Grid, Tab, Tabs } from "@mui/material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function OrgOrders() {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)

  return (
    <StandardPageLayout
      title={t("orders.orgOrdersTitle")}
      headerTitle={t("orders.ordersTitle")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label={t("orders.unclaimed", "Unclaimed")} />
          <Tab label={t("orders.allOrders", "All Orders")} />
          <Tab label={t("orders.offers", "Offers")} />
          <Tab label={t("orders.metrics", "Metrics")} />
        </Tabs>
      </Grid>

      {tab === 0 && (
        <Grid item xs={12}>
          <RecentOrders unassigned />
        </Grid>
      )}

      {tab === 1 && (
        <Grid item xs={12}>
          <RecentOrders />
        </Grid>
      )}

      {tab === 2 && (
        <Grid item xs={12}>
          <ReceivedOffersArea unassigned />
        </Grid>
      )}

      {tab === 3 && (
        <>
          <OrderMetrics />
          <OrgOrderTrend />
        </>
      )}
    </StandardPageLayout>
  )
}
