import React, { useCallback } from "react"
import { useMarketSearch } from "../../hooks/market/MarketSearch"
import { TablePagination } from "@mui/material"

export function MarketPageNav(props: {
  ref: React.RefObject<HTMLDivElement>
  total: number
}) {
  const { ref, total } = props
  const [searchState, setSearchState] = useMarketSearch()

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setSearchState({
        ...searchState,
        index: newPage,
      })
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [ref, searchState, setSearchState],
  )

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchState({
        ...searchState,
        page_size: +event.target.value,
      })
    },
    [searchState, setSearchState],
  )

  return (
    <TablePagination
      rowsPerPageOptions={[12, 24, 48, 96]}
      component="div"
      count={total}
      rowsPerPage={searchState.page_size || 48}
      page={searchState.index || 0}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      color={"primary"}
      nextIconButtonProps={{ color: "primary" }}
      backIconButtonProps={{ color: "primary" }}
    />
  )
}
