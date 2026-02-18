import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminNotificationTestView } from "../../views/admin/AdminNotificationTestView"

export function AdminNotificationTest() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.notificationTest", "Notification Test")}
      headerTitle={t("admin.notificationTest", "Notification Test")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminNotificationTestView />
    </StandardPageLayout>
  )
}
