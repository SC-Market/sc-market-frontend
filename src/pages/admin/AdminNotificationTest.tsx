import React from "react"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { AdminNotificationTestView } from "../../views/admin/AdminNotificationTestView"

export function AdminNotificationTest() {
  const { t } = useTranslation()

  return (
    <Page title={t("admin.notificationTest", "Notification Test")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <AdminNotificationTestView />
      </ContainerGrid>
    </Page>
  )
}
