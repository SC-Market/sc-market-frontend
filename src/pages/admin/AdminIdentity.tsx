import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminIdentityView } from "../../views/admin/AdminIdentityView"

export function AdminIdentity() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("adminIdentity.title", "Account identity")}
      headerTitle={t("adminIdentity.title", "Account identity")}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <AdminIdentityView />
    </StandardPageLayout>
  )
}
