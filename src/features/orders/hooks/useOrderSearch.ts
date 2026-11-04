import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchOrdersQuery } from "../api/ordersApi"
import { useDebounce } from "../../../hooks/useDebounce"
import type {
  OrderSearchSortMethod,
  OrderStatusFilter,
  OrderTotalCounts,
  OrderStub,
} from "../domain/types"
import { isAwaitingData } from "../../../util/queryLoading"

export interface UseOrderSearchParams {
  mine?: boolean
  assigned?: boolean
  unassigned?: boolean
  contractor?: string
  shop_id?: string
  username?: string
}

/** Per-status counts as the order search endpoints return them. */
export interface OrderItemCounts {
  fulfilled?: number
  "in-progress"?: number
  "not-started"?: number
  cancelled?: number
  unassigned?: number
}

/** The status tabs' counts, from the per-status counts. */
export function toTotalCounts(
  counts: OrderItemCounts | undefined,
): OrderTotalCounts {
  const c = counts ?? {}
  const fulfilled = c.fulfilled || 0
  const inProgress = c["in-progress"] || 0
  const notStarted = c["not-started"] || 0
  const cancelled = c.cancelled || 0
  return {
    fulfilled,
    "in-progress": inProgress,
    "not-started": notStarted,
    cancelled,
    all: fulfilled + inProgress + notStarted + cancelled,
    active: notStarted + inProgress,
    past: cancelled + fulfilled,
    unassigned: c.unassigned || 0,
  }
}

/**
 * The order list's filter, sort and page state, shared by the order search
 * (useOrderSearch) and the admin orders list (useAdminOrderSearch).
 */
export function useOrderSearchState(unassigned?: boolean) {
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>(
    unassigned ? "unassigned" : "active",
  )
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(0)
  const [orderBy, setOrderBy] = useState("timestamp")
  const [order, setOrder] = useState<"asc" | "desc">("desc")

  // Filter state
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [buyerUsername, setBuyerUsername] = useState("")
  const [sellerUsername, setSellerUsername] = useState("")
  const [hasMarketListings, setHasMarketListings] = useState<
    boolean | undefined
  >(undefined)
  const [hasService, setHasService] = useState<boolean | undefined>(undefined)

  const debouncedBuyerUsername = useDebounce(buyerUsername, 500)
  const debouncedSellerUsername = useDebounce(sellerUsername, 500)

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [
    debouncedBuyerUsername,
    debouncedSellerUsername,
    hasMarketListings,
    hasService,
  ])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (debouncedBuyerUsername) count++
    if (debouncedSellerUsername) count++
    if (hasMarketListings !== undefined) count++
    if (hasService !== undefined) count++
    return count
  }, [
    debouncedBuyerUsername,
    debouncedSellerUsername,
    hasMarketListings,
    hasService,
  ])

  const clearFilters = () => {
    setBuyerUsername("")
    setSellerUsername("")
    setHasMarketListings(undefined)
    setHasService(undefined)
  }

  return {
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,
    order,
    setOrder,
    orderBy,
    setOrderBy,
    // Status filter
    statusFilter,
    setStatusFilter,
    // Advanced filters
    filtersOpen,
    setFiltersOpen,
    buyerUsername,
    setBuyerUsername,
    sellerUsername,
    setSellerUsername,
    hasMarketListings,
    setHasMarketListings,
    hasService,
    setHasService,
    debouncedBuyerUsername,
    debouncedSellerUsername,
    activeFiltersCount,
    clearFilters,
  }
}

export type OrderSearchState = ReturnType<typeof useOrderSearchState>

/** What the order list view renders: the state plus a page of orders. */
export interface OrderSearchResult extends OrderSearchState {
  orders?: { items: Array<OrderStub & { is_test?: boolean }> }
  isLoading: boolean
  isFetching: boolean
  /** No result for the current filters / page yet; false during background refetches. */
  awaitingData: boolean
  totalCounts: OrderTotalCounts
}

export function useOrderSearch(
  params: UseOrderSearchParams,
): OrderSearchResult {
  const { mine, assigned, unassigned, contractor, shop_id, username } = params
  const state = useOrderSearchState(unassigned)
  const { statusFilter, setStatusFilter, page, pageSize, orderBy, order } =
    state

  const {
    data: orders,
    currentData,
    isLoading,
    isFetching,
  } = useSearchOrdersQuery({
    status:
      statusFilter === "all"
        ? undefined
        : statusFilter === "unassigned"
          ? "active"
          : statusFilter,
    index: page,
    page_size: pageSize,
    customer: mine ? username : undefined,
    assigned: assigned ? username : undefined,
    unassigned: statusFilter === "unassigned" ? "true" : undefined,
    contractor,
    shop_id,
    sort_method: orderBy as OrderSearchSortMethod,
    reverse_sort: order === "desc",
    buyer_username:
      !mine && state.debouncedBuyerUsername
        ? state.debouncedBuyerUsername
        : undefined,
    seller_username:
      mine && state.debouncedSellerUsername
        ? state.debouncedSellerUsername
        : undefined,
    has_market_listings: state.hasMarketListings,
    has_service: state.hasService,
  })

  const totalCounts = useMemo(
    () => toTotalCounts(orders?.item_counts),
    [orders],
  )

  // Auto-switch from "unassigned" to "active" on first load if there are 0 unclaimed items
  const hasAutoSwitched = useRef(false)
  useEffect(() => {
    if (
      unassigned &&
      !hasAutoSwitched.current &&
      !isLoading &&
      totalCounts.unassigned === 0 &&
      statusFilter === "unassigned"
    ) {
      hasAutoSwitched.current = true
      setStatusFilter("active")
    }
  }, [
    unassigned,
    isLoading,
    totalCounts.unassigned,
    statusFilter,
    setStatusFilter,
  ])

  return {
    ...state,
    orders,
    isLoading,
    isFetching,
    awaitingData: isAwaitingData({ isFetching, currentData }),
    totalCounts,
  }
}
