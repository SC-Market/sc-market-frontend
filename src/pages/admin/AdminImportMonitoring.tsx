import React from "react"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { AdminImportMonitoringView } from "../../views/admin/AdminImportMonitoringView"

export function AdminImportMonitoring() {
  const { t } = useTranslation()

  return (
    <Page title={t("admin.importMonitoring.title", "Import Job Monitoring")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <AdminImportMonitoringView />
      </ContainerGrid>
    </Page>
  )
}
