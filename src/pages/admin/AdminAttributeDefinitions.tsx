import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminAttributeDefinitionsView } from "../../views/admin/AdminAttributeDefinitionsView"

export function AdminAttributeDefinitions() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.attributes.title", "Attribute Definitions")}
      headerTitle={t("admin.attributes.title", "Attribute Definitions")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminAttributeDefinitionsView />
    </StandardPageLayout>
  )
}
