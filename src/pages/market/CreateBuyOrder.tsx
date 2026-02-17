import { FlatSection } from "../../components/paper/Section"
import React from "react"
import { BuyOrderForm } from "../../features/market"
import { SelectGameItemStack } from "../../components/select/SelectGameItem"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageCreateBuyOrder } from "../../features/market/hooks/usePageCreateBuyOrder"
import { Grid } from "@mui/material"

export function CreateBuyOrder() {
  const { t } = useTranslation()
  const pageData = usePageCreateBuyOrder()

  const {
    itemType,
    itemName,
    itemNameValue,
    aggregate,
    setItemType,
    setItemName,
  } = pageData.data || {}

  return (
    <StandardPageLayout
      title={t("buyOrderActions.createBuyOrder")}
      headerTitle={t("buyOrderActions.createBuyOrder")}
      sidebarOpen={true}
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      <Grid item xs={12}>
        <FlatSection title={t("buyOrderActions.selectMarketItem")}>
          <SelectGameItemStack
            onItemChange={(value) => setItemName?.(value)}
            onTypeChange={(value) => {
              setItemType?.(value)
              setItemName?.(null)
            }}
            item_type={itemType || "Other"}
            item_name={itemName ?? null}
          />
        </FlatSection>
      </Grid>

      {itemNameValue && aggregate && (
        <Grid item xs={12}>
          <BuyOrderForm aggregate={aggregate} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
