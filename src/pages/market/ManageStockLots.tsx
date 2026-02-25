import React from "react"
import { Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ManageStockPage } from "../../features/market/components/ManageStockPage"
import { ManageListingsTabBar } from "../../features/market/components/ManageListingsTabBar"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageManageStockLots } from "../../features/market/hooks/usePageManageStockLots"

export function ManageStockLots() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const pageData = usePageManageStockLots()

  return (
    <StandardPageLayout
      title={t("sidebar.manage_stock", "Manage Stock")}
      breadcrumbs={[
        { label: t("sidebar.market_short"), href: "/market" },
        { label: t("sidebar.manage_stock", "Manage Stock") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      <Grid item xs={12} container spacing={theme.layoutSpacing?.layout ?? 1}>
        <Grid item xs={12}>
          <ManageListingsTabBar
            title={t("sidebar.manage_stock", "Manage Stock")}
          />
        </Grid>
        <Grid item xs={12}>
          <ManageStockPage />
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}
