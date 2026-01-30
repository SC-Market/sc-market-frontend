import { FlatSection } from "../../components/paper/Section"
import {
  useGetAggregateByIdQuery,
  useGetMarketItemsByCategoryQuery,
} from "../../features/market"
import React, { useMemo, useState } from "react"
import { BuyOrderForm } from "../../features/market"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { SelectGameItemStack } from "../../components/select/SelectGameItem"
import { useTranslation } from "react-i18next"

export function CreateBuyOrder() {
  const { t } = useTranslation()
  const [itemType, setItemType] = useState<string>("Other")
  const [itemName, setItemName] = useState<string | null>(null)

  const { data: items } = useGetMarketItemsByCategoryQuery(itemType!, {
    skip: !itemType,
  })

  const item_name_value = useMemo(
    () =>
      itemName
        ? (items || []).find((o) => o.name === itemName)?.id || null
        : null,
    [items, itemName],
  )

  const { data: aggregate } = useGetAggregateByIdQuery(item_name_value!, {
    skip: !item_name_value,
  })

  return (
    <Page title={t("buyOrderActions.createBuyOrder")}>
      <ContainerGrid sidebarOpen={true}>
        <FlatSection title={t("buyOrderActions.selectMarketItem")}>
          <SelectGameItemStack
            onItemChange={(value) => setItemName(value)}
            onTypeChange={(value) => {
              setItemType(value)
              setItemName(null)
            }}
            item_type={itemType}
            item_name={itemName}
          />
        </FlatSection>

        {item_name_value && aggregate && <BuyOrderForm aggregate={aggregate} />}
      </ContainerGrid>
    </Page>
  )
}
