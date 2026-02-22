import { useState } from "react"
import {
  useGetOrCreateAggregateQuery,
  useGetMarketItemsByCategoryQuery,
} from "../api/marketApi"

/**
 * Page hook interface for consistent data fetching patterns.
 */
export interface UsePageResult<T> {
  data: T | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page data structure for create buy order page.
 */
export interface CreateBuyOrderPageData {
  items: any[] | undefined
  aggregate: any | undefined
  itemType: string
  itemName: string | null
  itemId: string | null
  setItemType: (value: string) => void
  setItemName: (value: string | null) => void
  setItemId: (value: string | null) => void
}

/**
 * Page hook for CreateBuyOrder page.
 * Encapsulates all data fetching logic and state management for the buy order creation page.
 *
 * @returns Page data with loading states, errors, and refetch function
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function usePageCreateBuyOrder(): UsePageResult<CreateBuyOrderPageData> {
  const [itemType, setItemType] = useState<string>("Other")
  const [itemName, setItemName] = useState<string | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)

  const itemsQuery = useGetMarketItemsByCategoryQuery(itemType!, {
    skip: !itemType,
  })

  const aggregateQuery = useGetOrCreateAggregateQuery(itemId!, {
    skip: !itemId,
  })

  return {
    data: {
      items: itemsQuery.data,
      aggregate: aggregateQuery.data,
      itemType,
      itemName,
      itemId,
      setItemType,
      setItemName,
      setItemId,
    },
    isLoading: itemsQuery.isLoading || aggregateQuery.isLoading,
    isFetching: itemsQuery.isFetching || aggregateQuery.isFetching,
    error: itemsQuery.error || aggregateQuery.error,
    refetch: () => {
      itemsQuery.refetch()
      aggregateQuery.refetch()
    },
  }
}
