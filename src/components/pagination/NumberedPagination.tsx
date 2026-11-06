import React, { useId } from "react"
import {
  Box,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Typography,
  type PaginationRenderItemParams,
  type SxProps,
  type Theme,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { useFormatters } from "../../util/format"
import { haptic } from "../../util/haptics"
import { linkedPaginationItem } from "./linkedPaginationItem"

export interface NumberedPaginationLink {
  /** The hub's path, e.g. `/market`. Its `?page=N` is 1-based. */
  path: string
  /** The current query params; every one but `page` is kept on the links. */
  searchParams: URLSearchParams
}

export interface NumberedPaginationProps {
  /** Total number of items across all pages. */
  count: number
  /** Current page, 0-based. */
  page: number
  /** Items per page. */
  rowsPerPage: number
  /** New page, 0-based. Scroll the list into view here, as needed. */
  onPageChange: (page: number) => void
  /**
   * The per-page choices. Leave out (or pass `onRowsPerPageChange` without
   * it) for a list whose API has a fixed page size: no select is shown.
   */
  rowsPerPageOptions?: readonly number[]
  /**
   * New page size. The handler goes back to the first page in the same
   * update (`page = 0` / `?page` dropped), so the view starts at item 1.
   */
  onRowsPerPageChange?: (rowsPerPage: number) => void
  /**
   * URL-driven lists (`?page=`): page buttons become real links that keep
   * the other query params, for crawlers and middle-click. Leave out for
   * state-driven lists (plain buttons).
   */
  link?: NumberedPaginationLink
  /** Hide the "x–y of N" text (e.g. where the list shows its own count). */
  hideRange?: boolean
  sx?: SxProps<Theme>
}

/**
 * The app's list pagination: numbered pages (MUI `Pagination`, first/last
 * page and ellipses), prev/next, the "x–y of N" range and a "Per page"
 * select. Wraps MUI's component; only the select, range, haptics, i18n and
 * link mode are added here.
 */
export function NumberedPagination(props: NumberedPaginationProps) {
  const {
    count,
    page,
    rowsPerPage,
    onPageChange,
    rowsPerPageOptions,
    onRowsPerPageChange,
    link,
    hideRange,
    sx,
  } = props
  const { t } = useTranslation()
  const fmt = useFormatters()
  const isMobile = useIsMobile()
  const selectLabelId = useId()

  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage))
  const from = count === 0 ? 0 : page * rowsPerPage + 1
  const to = Math.min(count, (page + 1) * rowsPerPage)
  const showSelect =
    !!onRowsPerPageChange &&
    !!rowsPerPageOptions &&
    rowsPerPageOptions.length > 1

  // One page: no page buttons. The select stays while a smaller page size
  // would split the list, so a big size can be undone.
  const showPages = totalPages > 1
  if (
    !showPages &&
    (!showSelect || count <= Math.min(...(rowsPerPageOptions ?? [])))
  ) {
    return null
  }

  const renderItem = link
    ? linkedPaginationItem(link.path, link.searchParams)
    : (item: PaginationRenderItemParams) => <PaginationItem {...item} />

  return (
    <Box
      sx={[
        {
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 2 },
          py: 1.5,
          px: { xs: 1, sm: 2 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {(!hideRange || showSelect) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            order: { xs: 2, sm: 0 },
          }}
        >
          {!hideRange && (
            <Typography variant="body2" color="text.primary">
              {t("displayed_rows", {
                from: fmt.number(from),
                to: fmt.number(to),
                count,
              })}
            </Typography>
          )}
          {showSelect && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                id={selectLabelId}
                variant="body2"
                color="text.primary"
              >
                {t("pagination.perPage")}
              </Typography>
              <Select
                size="small"
                variant="standard"
                color="primary"
                labelId={selectLabelId}
                value={rowsPerPage}
                onChange={(event) => {
                  haptic.selection()
                  onRowsPerPageChange(Number(event.target.value))
                }}
                disableUnderline
                sx={{ fontSize: "0.875rem" }}
              >
                {rowsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {fmt.number(option)}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
        </Box>
      )}
      {showPages && (
        <Pagination
          aria-label={t("pagination.navLabel")}
          count={totalPages}
          page={Math.min(page + 1, totalPages)}
          onChange={(_, newPage) => {
            if (newPage - 1 === page) return
            haptic.selection()
            onPageChange(newPage - 1)
          }}
          color="primary"
          size={isMobile ? "small" : "medium"}
          siblingCount={isMobile ? 0 : 1}
          boundaryCount={1}
          renderItem={renderItem}
          getItemAriaLabel={(type, itemPage, selected) => {
            if (type === "previous") return t("accessibility.previousPage")
            if (type === "next") return t("accessibility.nextPage")
            return selected
              ? t("pagination.currentPage", { page: fmt.number(itemPage ?? 0) })
              : t("pagination.goToPage", { page: fmt.number(itemPage ?? 0) })
          }}
          sx={{ order: { xs: 1, sm: 0 }, ml: { sm: "auto" } }}
        />
      )}
    </Box>
  )
}

/**
 * The page size of a URL-driven list from its `?page_size=` param: one of
 * `options`, else `fallback` (the list's default, the size prerendered and
 * linked pages use).
 */
export function parsePageSize(
  value: string | null,
  options: readonly number[],
  fallback: number,
): number {
  const n = Number(value)
  return options.includes(n) ? n : fallback
}

/** "Per page" choices of the card grids that show 24 (or 48) by default. */
export const CARD_GRID_PAGE_SIZE_OPTIONS: readonly number[] = [12, 24, 48, 96]
