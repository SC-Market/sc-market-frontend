import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminNotificationTestView } from "../../views/admin/AdminNotificationTestView"

export function AdminNotificationTest() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("nav.adminNotificationTest", "Notification Test")}
      headerTitle={t("nav.adminNotificationTest", "Notification Test")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminNotificationTestView />
    </StandardPageLayout>
  )
}
