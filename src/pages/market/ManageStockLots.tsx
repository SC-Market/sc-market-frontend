import React from "react"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"
import { ManageStockPage } from "../../features/market/components/ManageStockPage"

export function ManageStockLots() {
  const { t } = useTranslation()

  return (
    <Page title={t("sidebar.manage_stock", "Manage Stock")}>
      <ManageStockPage />
    </Page>
  )
}
