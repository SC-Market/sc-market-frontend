import React from "react"
import { useTranslation } from "react-i18next"
import { Grid } from "@mui/material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminPremiumManagementView } from "../../views/admin/AdminPremiumManagementView"
import { AdminStorefrontEnquiries } from "../../views/admin/AdminStorefrontEnquiries"

export function AdminPremiumManagement() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.premium.title", "Premium Management")}
      headerTitle={t("admin.premium.title", "Premium Management")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <AdminStorefrontEnquiries />
      </Grid>
      <Grid item xs={12}>
        <AdminPremiumManagementView />
      </Grid>
    </StandardPageLayout>
  )
}
