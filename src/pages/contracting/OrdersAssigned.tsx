import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Grid } from "@mui/material"
import { MemberAssignments } from "../../views/member/MemberAssignments"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function OrdersAssigned() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Page title={t("sidebar.orders_assigned_to_me")}>
      <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
        <HeaderTitle>{t("sidebar.orders_assigned_to_me")}</HeaderTitle>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12} lg={3}>
            <OrderMetrics />
          </Grid>
          <Grid item xs={12} lg={9}>
            <MemberAssignments />
          </Grid>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
