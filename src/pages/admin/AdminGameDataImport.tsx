import React from "react"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminGameDataImportView } from "../../views/admin/AdminGameDataImportView"

export function AdminGameDataImport() {
  return (
    <StandardPageLayout
      title="Game Data Import"
      headerTitle="Game Data Import"
      sidebarOpen={true}
      maxWidth="lg"
    >
      <AdminGameDataImportView />
    </StandardPageLayout>
  )
}
