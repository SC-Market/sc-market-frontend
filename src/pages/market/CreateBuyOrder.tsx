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
      <FlatSection title={t("buyOrderActions.selectMarketItem")}>
        <GameItemSearchAutocomplete
          value={itemName ?? null}
          onChange={(name, type) => {
            if (name) setItemName?.(name)
            if (type) setItemType?.(type)
          }}
          label={t("market.search_query")}
        />
      </FlatSection>

      {itemNameValue && aggregate && <BuyOrderForm aggregate={aggregate} />}
    </StandardPageLayout>
  )
}
