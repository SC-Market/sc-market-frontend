import { useSearchParams } from "react-router-dom"
import {
  CARD_GRID_PAGE_SIZE_OPTIONS,
  parsePageSize,
  type NumberedPaginationProps,
} from "./NumberedPagination"

export interface UrlPaginationOptions {
  /** The hub's path, for the page links. */
  path: string
  /** The page size without `?page_size=` (the one prerendering uses). */
  defaultPageSize: number
  /** The "Per page" choices; the card grids' by default. */
  pageSizeOptions?: readonly number[]
  /** Replace the history entry on a page change instead of pushing one. */
  replace?: boolean
}

export interface UrlPagination {
  /** The current page, 1-based like `?page=`. */
  page: number
  pageSize: number
  /** Spread onto <NumberedPagination> next to `count`. */
  pagination: Pick<
    NumberedPaginationProps,
    | "page"
    | "rowsPerPage"
    | "onPageChange"
    | "rowsPerPageOptions"
    | "onRowsPerPageChange"
    | "link"
  >
}

/**
 * Page and page size of a URL-driven list: `?page=N` (1-based, dropped on
 * page 1) and `?page_size=` (dropped at the default size). Every other
 * query param (filters) is kept. A page change scrolls back to the top; a
 * new page size starts on page 1.
 */
export function useUrlPagination(opts: UrlPaginationOptions): UrlPagination {
  const {
    path,
    defaultPageSize,
    pageSizeOptions = CARD_GRID_PAGE_SIZE_OPTIONS,
    replace = false,
  } = opts
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const pageSize = parsePageSize(
    searchParams.get("page_size"),
    pageSizeOptions,
    defaultPageSize,
  )

  return {
    page,
    pageSize,
    pagination: {
      page: page - 1,
      rowsPerPage: pageSize,
      onPageChange: (newPage) => {
        const params = new URLSearchParams(searchParams)
        if (newPage > 0) params.set("page", String(newPage + 1))
        else params.delete("page")
        setSearchParams(params, { replace })
        window.scrollTo({ top: 0, behavior: "smooth" })
      },
      rowsPerPageOptions: pageSizeOptions,
      onRowsPerPageChange: (size) => {
        const params = new URLSearchParams(searchParams)
        params.delete("page")
        if (size === defaultPageSize) params.delete("page_size")
        else params.set("page_size", String(size))
        setSearchParams(params, { replace })
      },
      link: { path, searchParams },
    },
  }
}
