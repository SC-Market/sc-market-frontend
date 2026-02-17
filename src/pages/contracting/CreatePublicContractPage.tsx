import React from "react"
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { CreatePublicContract } from "../../views/contracts/CreatePublicContract"
import { useTranslation } from "react-i18next"

export function CreatePublicContractPage() {
  const { t } = useTranslation()

  return (
    <FormPageLayout
      title={t("contracts.createOpenContract")}
      formTitle={t("contracts.createOpenContract")}
      maxWidth="md"
      sidebarOpen={true}
      backButton={true}
      breadcrumbs={[
        { label: t("contracts.openContracts", "Open Contracts"), href: "/contracts" },
        { label: t("contracts.createOpenContract") },
      ]}
    >
      <CreatePublicContract />
    </FormPageLayout>
  )
}
