/**
 * Hook for listing grid pagination state synced with URL (useMarketSearch).
 * Use with ListingPagination component.
 */
import { useCallback } from "react"
import { useMarketSearch } from "./MarketSearch"

export function useListingPagination() {
  const [searchState, setSearchState] = useMarketSearch()

  const page = searchState.index ?? 0
  const rowsPerPage = searchState.page_size ?? 48

  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      setSearchState((prev) => ({ ...prev, index: newPage }))
    },
    [setSearchState],
  )

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchState((prev) => ({
        ...prev,
        page_size: +event.target.value,
      }))
    },
    [setSearchState],
  )

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  }
}
