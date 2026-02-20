import React from "react"
import { Grid } from "@mui/material"
import { MemberAssignments } from "../../views/member/MemberAssignments"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageOrdersAssigned } from "../../features/contracting/hooks/usePageOrdersAssigned"

export function OrdersAssigned() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const pageData = usePageOrdersAssigned()

  return (
    <StandardPageLayout
      title={t("sidebar.orders_assigned_to_me")}
      sidebarOpen={true}
      maxWidth="lg"
      isLoading={pageData.isLoading}
      error={pageData.error}
      headerTitle={t("sidebar.orders_assigned_to_me")}
    >
      <Grid item xs={12} lg={3}>
        <OrderMetrics />
      </Grid>
      <Grid item xs={12} lg={9}>
        <MemberAssignments />
      </Grid>
    </StandardPageLayout>
  )
}
