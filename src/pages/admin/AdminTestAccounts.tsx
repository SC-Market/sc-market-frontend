import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminTestAccountsView } from "../../views/admin/AdminTestAccountsView"

export function AdminTestAccounts() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.testAccounts.title", "Test accounts")}
      headerTitle={t("admin.testAccounts.title", "Test accounts")}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <AdminTestAccountsView />
    </StandardPageLayout>
  )
}
