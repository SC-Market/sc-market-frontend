import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { OrgBalance } from "../../views/contractor/OrgBalance"
import { Grid } from "@mui/material"
import { OrgTransactions } from "../../views/contractor/OrgTransactions"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function OrgMoney() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
      <HeaderTitle>{t("org.moneyTitle")}</HeaderTitle>

      <Grid item xs={12} container spacing={theme.layoutSpacing.layout * 4} justifyContent={"center"}>
        <Grid item xs={12} lg={4}>
          <Grid container spacing={theme.layoutSpacing.layout * 4} direction={"column"}>
            <OrgBalance />
            <OrderMetrics />
          </Grid>
        </Grid>
        <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout * 4}>
          <OrgTransactions />
        </Grid>
      </Grid>
    </ContainerGrid>
  )
}
