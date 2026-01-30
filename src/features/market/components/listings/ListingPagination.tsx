/**
 * Reusable table pagination for listing grids.
 * Use with useListingPagination or useMarketSearch for state.
 */
import React from "react"
import { TablePagination } from "@mui/material"
import { useTranslation } from "react-i18next"

export interface ListingPaginationProps {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, newPage: number) => void
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const ROWS_PER_PAGE_OPTIONS = [12, 24, 48, 96]

export function ListingPagination(props: ListingPaginationProps) {
  const { count, page, rowsPerPage, onPageChange, onRowsPerPageChange } = props
  const { t } = useTranslation()

  return (
    <TablePagination
      labelRowsPerPage={t("rows_per_page")}
      labelDisplayedRows={({ from, to, count: c }) =>
        t("displayed_rows", {
          from: from.toLocaleString(undefined),
          to: to.toLocaleString(undefined),
          count: c,
        })
      }
      SelectProps={{
        "aria-label": t("select_rows_per_page"),
        color: "primary",
      }}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      color="primary"
      nextIconButtonProps={{ color: "primary" }}
      backIconButtonProps={{ color: "primary" }}
    />
  )
}
