import {
  useGetMarketCategoriesQuery,
  useGetMarketItemsByCategoryQuery,
} from "../api/marketApi"

export function useGameItemData(itemType?: string) {
  const { data: categories } = useGetMarketCategoriesQuery()
  const { data: items, isLoading: itemsLoading } = useGetMarketItemsByCategoryQuery(itemType!, {
    skip: !itemType,
  })
  return { categories, items, itemsLoading }
}
