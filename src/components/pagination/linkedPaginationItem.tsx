import React from "react"
import { PaginationItem, type PaginationRenderItemParams } from "@mui/material"
import { Link } from "react-router-dom"
import { isPaginatedPath, pagedPath } from "../../seo/queryIndexing"

/** The query param linked pages are numbered by (1-based, like `pagedPath`). */
const PAGE_PARAM = "page"

/**
 * The href of page `pageNumber` (1-based) of a hub at `path`, keeping every
 * other query param (filters, page size). Page 1 drops `page`, the same as
 * `pagedPath`, so the first page is the hub's own URL.
 */
export function linkedPageHref(
  path: string,
  searchParams: URLSearchParams,
  pageNumber: number,
): string {
  const params = new URLSearchParams(searchParams)
  params.delete(PAGE_PARAM)
  if ([...params.keys()].length === 0) return pagedPath(path, pageNumber)
  if (pageNumber > 1) params.set(PAGE_PARAM, String(pageNumber))
  return `${path}?${params}`
}

function isPlainLeftClick(event: React.MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

/**
 * `renderItem` for a hub's MUI <Pagination>: page buttons become real links
 * (`/wiki/items?page=3`) so crawlers can walk the pages from the HTML,
 * prerendered pages included, and middle/ctrl-click opens a page in a new
 * tab. A plain click stays an in-app page change: the Pagination's onChange
 * updates the URL and the router Link does not navigate a second time, so a
 * page change is one history entry.
 *
 * Links keep the other query params (filters, page size). Those filtered
 * variants are noindex, as is `?page=N` of a list that isn't a paginated hub
 * (`isPaginatedPath`), so their links are `rel="nofollow"`: crawlers still
 * walk only the hubs' bare `?page=N` pages.
 */
export function linkedPaginationItem(
  path: string,
  searchParams: URLSearchParams,
) {
  const followable =
    isPaginatedPath(path) &&
    [...searchParams.keys()].every((key) => key === PAGE_PARAM)
  function LinkedPaginationItem(item: PaginationRenderItemParams) {
    if (
      item.page === null ||
      item.disabled ||
      item.type === "start-ellipsis" ||
      item.type === "end-ellipsis"
    ) {
      return <PaginationItem {...item} />
    }
    const { onClick, ...rest } = item
    return (
      <PaginationItem
        component={Link}
        to={linkedPageHref(path, searchParams, item.page)}
        rel={followable ? undefined : "nofollow"}
        {...rest}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          // A modified click opens the page in a new tab: leave this one be.
          if (!isPlainLeftClick(event)) return
          event.preventDefault()
          onClick(event)
        }}
      />
    )
  }
  return LinkedPaginationItem
}
