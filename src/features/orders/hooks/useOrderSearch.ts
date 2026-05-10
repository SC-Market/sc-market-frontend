import { useEffect, useMemo, useState } from "react"
import { useSearchOrdersQuery } from "../api/ordersApi"
import { useDebounce } from "../../../hooks/useDebounce"
import type { OrderSearchSortMethod, OrderSearchStatus, OrderStub } from "../domain/types"

export interface UseOrderSearchParams {
  mine?: boolean
  assigned?: boolean
  unassigned?: boolean
  contractor?: string
  username?: string
}

export function useOrderSearch(params: UseOrderSearchParams) {
  const { mine, assigned, unassigned, contractor, username } = params

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "past" | "unassigned" | OrderSearchStatus
  >(unassigned ? "unassigned" : "active")
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(0)
  const [orderBy, setOrderBy] = useState("timestamp")
  const [order, setOrder] = useState<"asc" | "desc">("desc")

  // Filter state
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [buyerUsername, setBuyerUsername] = useState("")
  const [sellerUsername, setSellerUsername] = useState("")
  const [hasMarketListings, setHasMarketListings] = useState<boolean | undefined>(undefined)
  const [hasService, setHasService] = useState<boolean | undefined>(undefined)

  const debouncedBuyerUsername = useDebounce(buyerUsername, 500)
  const debouncedSellerUsername = useDebounce(sellerUsername, 500)

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [debouncedBuyerUsername, debouncedSellerUsername, hasMarketListings, hasService])

  const { data: orders, isLoading, isFetching } = useSearchOrdersQuery({
    status: statusFilter === "all" || statusFilter === "unassigned" ? undefined : statusFilter,
    index: page,
    page_size: pageSize,
    customer: mine ? username : undefined,
    assigned: assigned ? username : undefined,
    unassigned: statusFilter === "unassigned" ? "true" : undefined,
    contractor,
    sort_method: orderBy as OrderSearchSortMethod,
    reverse_sort: order === "desc",
    buyer_username: !mine && debouncedBuyerUsername ? debouncedBuyerUsername : undefined,
    seller_username: mine && debouncedSellerUsername ? debouncedSellerUsername : undefined,
    has_market_listings: hasMarketListings,
    has_service: hasService,
  })

  const totalCounts = useMemo(() => {
    if (!orders?.item_counts) {
      return { all: 0, unassigned: 0, active: 0, past: 0, fulfilled: 0, "in-progress": 0, "not-started": 0, cancelled: 0 }
    }
    return {
      all: Object.values(orders.item_counts).reduce((x, y) => x + y, 0),
      unassigned: 0, // Count not available from API, tab still works
      active: (orders.item_counts["not-started"] || 0) + (orders.item_counts["in-progress"] || 0),
      past: (orders.item_counts["cancelled"] || 0) + (orders.item_counts["fulfilled"] || 0),
      ...orders.item_counts,
    }
  }, [orders])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (debouncedBuyerUsername) count++
    if (debouncedSellerUsername) count++
    if (hasMarketListings !== undefined) count++
    if (hasService !== undefined) count++
    return count
  }, [debouncedBuyerUsername, debouncedSellerUsername, hasMarketListings, hasService])

  const clearFilters = () => {
    setBuyerUsername("")
    setSellerUsername("")
    setHasMarketListings(undefined)
    setHasService(undefined)
  }

  return {
    // Query results
    orders,
    isLoading,
    isFetching,
    // Pagination
    page, setPage,
    pageSize, setPageSize,
    order, setOrder,
    orderBy, setOrderBy,
    // Status filter
    statusFilter, setStatusFilter,
    totalCounts,
    // Advanced filters
    filtersOpen, setFiltersOpen,
    buyerUsername, setBuyerUsername,
    sellerUsername, setSellerUsername,
    hasMarketListings, setHasMarketListings,
    hasService, setHasService,
    debouncedBuyerUsername,
    debouncedSellerUsername,
    activeFiltersCount,
    clearFilters,
  }
}
