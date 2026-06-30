import React, { useState, useMemo, useCallback } from "react"
import { useOptionalShopRouteContext } from "../../../../components/router/ShopContextFromRoute"
import { useGetUserProfileQuery } from "../../../profile/api/profileApi"
import { useGetMyListingsQuery } from "../../api/marketApi"
import { useMarketSearch } from "../../index"
import { DisplayStock } from "../../components/ItemStock"

/** Manage listings excludes archived; archived-only lives under My Listings. */
function statusesForManageStock(raw: string | undefined): string {
  const parts = (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s !== "archived")
  return parts.length ? parts.join(",") : "active,inactive"
}

export function MyItemStock() {
  const shopCtx = useOptionalShopRouteContext()
  const spectrumId = shopCtx?.shop.owner_contractor_spectrum_id
  const { data: profile, isLoading: profileLoading } = useGetUserProfileQuery()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)
  const [searchState] = useMarketSearch()

  const hasOrg = !!spectrumId

  const searchQueryParams = useMemo(() => {
    return {
      page_size: perPage,
      index: page * perPage,
      quantityAvailable: searchState.quantityAvailable ?? 1,
      query: searchState.query || "",
      sort: searchState.sort || "activity",
      statuses: statusesForManageStock(searchState.statuses),
      minCost: searchState.minCost || undefined,
      maxCost: searchState.maxCost || undefined,
      item_type: searchState.item_type || undefined,
      sale_type: searchState.sale_type || undefined,
    }
  }, [perPage, page, searchState])

  const finalParams = hasOrg
    ? { ...searchQueryParams, contractor_id: spectrumId }
    : searchQueryParams

  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useGetMyListingsQuery(finalParams)

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  const handleRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const listings = searchResults?.listings || []

  return (
    <>
      <DisplayStock
        listings={listings}
        total={searchResults?.total}
        page={page}
        perPage={perPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onRefresh={handleRefresh}
      />
    </>
  )
}
