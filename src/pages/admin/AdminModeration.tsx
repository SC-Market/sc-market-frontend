import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminModerationView } from "../../views/admin/AdminModerationView"

export function AdminModeration() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.moderation", "Admin Moderation")}
      headerTitle={t("admin.moderation", "Admin Moderation")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminModerationView />
    </StandardPageLayout>
  )
}
