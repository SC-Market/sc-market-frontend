import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminGameDataImportView } from "../../views/admin/AdminGameDataImportView"

export function AdminGameDataImport() {
  const { t } = useTranslation()
  return (
    <StandardPageLayout
      title={t("nav.adminGameData")}
      headerTitle={t("nav.adminGameData")}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <AdminGameDataImportView />
    </StandardPageLayout>
  )
}
