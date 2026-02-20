import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminAuditLogsView } from "../../views/admin/AdminAuditLogsView"

export function AdminAuditLogs() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.auditLogs", "Admin Audit Logs")}
      headerTitle={t("admin.auditLogs", "Admin Audit Logs")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminAuditLogsView />
    </StandardPageLayout>
  )
}
