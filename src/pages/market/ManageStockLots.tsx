import React from "react"
import { useTranslation } from "react-i18next"
import { ManageStockPage } from "../../features/market/components/ManageStockPage"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageManageStockLots } from "../../features/market/hooks/usePageManageStockLots"

export function ManageStockLots() {
  const { t } = useTranslation()
  const pageData = usePageManageStockLots()

  return (
    <StandardPageLayout
      title={t("sidebar.manage_stock", "Manage Stock")}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      <ManageStockPage />
    </StandardPageLayout>
  )
}
