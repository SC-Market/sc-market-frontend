import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminPremiumManagementView } from "../../views/admin/AdminPremiumManagementView"

export function AdminPremiumManagement() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.premium.title", "Premium Management")}
      headerTitle={t("admin.premium.title", "Premium Management")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminPremiumManagementView />
    </StandardPageLayout>
  )
}
