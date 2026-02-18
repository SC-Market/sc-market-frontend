import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminImportMonitoringView } from "../../views/admin/AdminImportMonitoringView"

export function AdminImportMonitoring() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.importMonitoring.title", "Import Job Monitoring")}
      headerTitle={t("admin.importMonitoring.title", "Import Job Monitoring")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminImportMonitoringView />
    </StandardPageLayout>
  )
}
