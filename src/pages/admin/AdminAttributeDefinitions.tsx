import React from "react"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { AdminAttributeDefinitionsView } from "../../views/admin/AdminAttributeDefinitionsView"

export function AdminAttributeDefinitions() {
  const { t } = useTranslation()

  return (
    <Page title={t("admin.attributes.title", "Attribute Definitions")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <AdminAttributeDefinitionsView />
      </ContainerGrid>
    </Page>
  )
}
