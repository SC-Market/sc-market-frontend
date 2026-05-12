import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  useSearchOfferSessionsQuery,
  useMergeOfferSessionsMutation,
} from "../api/offerApi"
import type { OfferSearchStatus, OfferSessionStub } from "../domain/types"
import type { OrderSearchSortMethod } from "../../orders/domain/types"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useDebounce } from "../../../hooks/useDebounce"

export interface UseOfferSearchParams {
  mine?: boolean
  assigned?: boolean
  unassigned?: boolean
  contractor?: string
}

export function useOfferSearch(params: UseOfferSearchParams) {
  const { mine, assigned, unassigned, contractor } = params
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState<null | "unclaimed" | OfferSearchStatus>(
    unassigned ? "unclaimed" : mine ? "to-customer" : "to-seller",
  )
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(0)
  const [orderBy, setOrderBy] = useState("timestamp")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([])
  const [mergeModalOpen, setMergeModalOpen] = useState(false)
  const [mergeOffers, { isLoading: isMerging }] = useMergeOfferSessionsMutation()

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [buyerUsername, setBuyerUsername] = useState("")
  const [sellerUsername, setSellerUsername] = useState("")
  const [hasMarketListings, setHasMarketListings] = useState<boolean | undefined>(undefined)
  const [hasService, setHasService] = useState<boolean | undefined>(undefined)
  const debouncedBuyerUsername = useDebounce(buyerUsername, 500)
  const debouncedSellerUsername = useDebounce(sellerUsername, 500)

  useEffect(() => { setPage(0) }, [debouncedBuyerUsername, debouncedSellerUsername, hasMarketListings, hasService])

  const handleSelectChange = (selected: readonly any[]) => {
    setSelectedOfferIds(selected.map(String))
  }

  const { data, isLoading, isFetching } = useSearchOfferSessionsQuery({
    status: statusFilter === "unclaimed" ? undefined : (statusFilter || undefined),
    index: page,
    page_size: pageSize,
    customer: mine ? profile?.username : undefined,
    assigned: assigned ? profile?.username : undefined,
    unassigned: statusFilter === "unclaimed" ? "true" : undefined,
    contractor,
    sort_method: orderBy as OrderSearchSortMethod,
    reverse_sort: order === "desc",
    buyer_username: !mine && debouncedBuyerUsername ? debouncedBuyerUsername : undefined,
    seller_username: mine && debouncedSellerUsername ? debouncedSellerUsername : undefined,
    has_market_listings: hasMarketListings,
    has_service: hasService,
  })

  const totalCount = useMemo(
    () => Object.values(data?.item_counts || {}).reduce((x, y) => x + y, 0),
    [data],
  )
  const totals = useMemo(() => new Map(Object.entries(data?.item_counts || [])), [data])

  // Auto-switch from "unclaimed" to "to-seller" on first load if there are 0 unclaimed items
  const hasAutoSwitched = useRef(false)
  useEffect(() => {
    if (unassigned && !hasAutoSwitched.current && !isLoading && statusFilter === "unclaimed") {
      const unclaimedCount = data?.item_counts?.unclaimed || 0
      if (unclaimedCount === 0) {
        hasAutoSwitched.current = true
        setStatusFilter("to-seller")
      }
    }
  }, [unassigned, isLoading, data?.item_counts, statusFilter])

  const handleMergeOffers = useCallback(() => {
    if (selectedOfferIds.length < 2) return
    mergeOffers({ offer_session_ids: selectedOfferIds })
      .unwrap()
      .then((result) => {
        issueAlert({ message: (result as any).message || t("OffersViewPaginated.merge_success"), severity: "success" })
        setSelectedOfferIds([])
        setMergeModalOpen(false)
        if ((result as any).merged_offer_session?.id) {
          window.open(`/offer/${(result as any).merged_offer_session.id}`, "_blank")
        }
      })
      .catch(issueAlert)
  }, [selectedOfferIds, mergeOffers, issueAlert, t])

  const selectedOffers = useMemo(
    () => (data?.items || []).filter((offer) => selectedOfferIds.includes(offer.id)),
    [data?.items, selectedOfferIds],
  )
  const totalCost = useMemo(
    () => selectedOffers.reduce((sum, offer) => sum + Number(offer.most_recent_offer.cost), 0),
    [selectedOffers],
  )

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (debouncedBuyerUsername) count++
    if (debouncedSellerUsername) count++
    if (hasMarketListings !== undefined) count++
    if (hasService !== undefined) count++
    return count
  }, [debouncedBuyerUsername, debouncedSellerUsername, hasMarketListings, hasService])

  const clearFilters = () => {
    setBuyerUsername(""); setSellerUsername("")
    setHasMarketListings(undefined); setHasService(undefined)
  }

  return {
    data, isLoading, isFetching,
    page, setPage, pageSize, setPageSize,
    order, setOrder, orderBy, setOrderBy,
    statusFilter, setStatusFilter,
    totalCount, totals,
    // Selection & merge
    selectedOfferIds, handleSelectChange,
    mergeModalOpen, setMergeModalOpen,
    isMerging, handleMergeOffers,
    selectedOffers, totalCost,
    // Filters
    filtersOpen, setFiltersOpen,
    buyerUsername, setBuyerUsername,
    sellerUsername, setSellerUsername,
    hasMarketListings, setHasMarketListings,
    hasService, setHasService,
    debouncedBuyerUsername, debouncedSellerUsername,
    activeFiltersCount, clearFilters,
    // Misc
    profile, issueAlert,
  }
}
