import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminAlertsView } from "../../views/admin/AdminAlertsView"

export function AdminAlerts() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.alerts.pageTitle", "Admin Alerts")}
      headerTitle={t("admin.alerts.pageTitle", "Admin Alerts")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminAlertsView />
    </StandardPageLayout>
  )
}
