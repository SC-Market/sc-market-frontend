/**
 * Reusable pagination for listing grids.
 * Desktop: TablePagination with rows-per-page selector.
 * Mobile: Compact numbered Pagination component.
 */
import React from "react"
import { TablePagination, Pagination, Box, useMediaQuery, useTheme } from "@mui/material"
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const totalPages = Math.ceil(count / rowsPerPage)

  if (isMobile && totalPages > 1) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={(_, p) => onPageChange(null, p - 1)}
          color="primary"
          size="small"
          siblingCount={0}
        />
      </Box>
    )
  }

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
