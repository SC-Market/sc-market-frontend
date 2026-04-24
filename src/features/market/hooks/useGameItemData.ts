import {
  useGetMarketCategoriesQuery,
  useGetMarketItemsByCategoryQuery,
} from "../../../store/api/v2/market"

export function useGameItemData(itemType?: string) {
  const { data: categories } = useGetMarketCategoriesQuery()
  const { data: items, isLoading: itemsLoading } = useGetMarketItemsByCategoryQuery(itemType!, {
    skip: !itemType,
  })
  return { categories, items, itemsLoading }
}
