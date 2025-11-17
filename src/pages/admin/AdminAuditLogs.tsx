import React from "react"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { AdminAuditLogsView } from "../../views/admin/AdminAuditLogsView"

export function AdminAuditLogs() {
  const { t } = useTranslation()

  return (
    <Page title={t("admin.auditLogs", "Admin Audit Logs")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <AdminAuditLogsView />
      </ContainerGrid>
    </Page>
  )
}
