import { useMemo } from "react"
import {
  useListAdminOrdersQuery,
  type AdminOrderSortMethod,
} from "../../../store/api/v2/market"
import {
  toTotalCounts,
  useOrderSearchState,
  type OrderSearchResult,
} from "../../orders/hooks/useOrderSearch"
import { isAwaitingData } from "../../../util/queryLoading"

const SORT_METHODS: readonly AdminOrderSortMethod[] = [
  "title",
  "customer_name",
  "status",
  "timestamp",
  "contractor_name",
]

/**
 * Admin › Orders: every order on the site (GET /admin/orders). Orders
 * involving a test buyer, seller, org or shop are left out, counts included,
 * unless `includeTest`; when included, each says so (is_test).
 */
export function useAdminOrderSearch({
  includeTest,
}: {
  includeTest: boolean
}): OrderSearchResult {
  const state = useOrderSearchState()
  const { statusFilter, page, pageSize, orderBy, order } = state

  const {
    data: orders,
    currentData,
    isLoading,
    isFetching,
  } = useListAdminOrdersQuery({
    status:
      statusFilter === "all"
        ? undefined
        : statusFilter === "unassigned"
          ? "active"
          : statusFilter,
    unassigned: statusFilter === "unassigned" ? true : undefined,
    page: page + 1,
    pageSize,
    sortMethod: SORT_METHODS.find((s) => s === orderBy) ?? "timestamp",
    reverseSort: order === "desc",
    buyerUsername: state.debouncedBuyerUsername || undefined,
    hasMarketListings: state.hasMarketListings,
    hasService: state.hasService,
    includeTest: includeTest || undefined,
  })

  const totalCounts = useMemo(
    () => toTotalCounts(orders?.item_counts),
    [orders],
  )

  return {
    ...state,
    orders,
    isLoading,
    isFetching,
    awaitingData: isAwaitingData({ isFetching, currentData }),
    totalCounts,
  }
}
