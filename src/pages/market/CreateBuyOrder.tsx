import { FlatSection } from "../../components/paper/Section"
import React from "react"
import { BuyOrderForm } from "../../features/market"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageCreateBuyOrder } from "../../features/market/hooks/usePageCreateBuyOrder"
import { GameItemSearchAutocomplete } from "../../features/market/components/GameItemSearchAutocomplete"

export function CreateBuyOrder() {
  const { t } = useTranslation()
  const pageData = usePageCreateBuyOrder()

  const {
    itemType,
    itemName,
    itemId,
    aggregate,
    setItemType,
    setItemName,
    setItemId,
  } = pageData.data || {}

  return (
    <StandardPageLayout
      title={t("buyOrderActions.createBuyOrder")}
      headerTitle={t("buyOrderActions.createBuyOrder")}
      sidebarOpen={true}
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      <FlatSection title={t("buyOrderActions.selectMarketItem")}>
        <GameItemSearchAutocomplete
          value={itemName ?? null}
          onChange={(name, type, id) => {
            if (name) setItemName?.(name)
            if (type) setItemType?.(type)
            if (id) setItemId?.(id)
          }}
          label={t("market.selectGameItem", "Select Game Item")}
          sx={{ width: "100%" }}
        />
      </FlatSection>

      {itemId && aggregate && <BuyOrderForm aggregate={aggregate} />}
    </StandardPageLayout>
  )
}
