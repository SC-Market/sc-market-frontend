import React from "react"
import { PaginationItem, type PaginationRenderItemParams } from "@mui/material"
import { Link } from "react-router-dom"
import { pagedPath } from "../../seo/queryIndexing"

/**
 * `renderItem` for a hub's MUI <Pagination>: page buttons become real links
 * (`/wiki/items?page=3`) so crawlers can walk the pages from the HTML,
 * prerendered pages included. A click is still an in-app navigation (the
 * router Link) and the Pagination's onChange runs as before. Only the bare
 * `?page=N` form is linked: other query params (filters) are noindex
 * variants, so their pages stay plain buttons.
 */
export function linkedPaginationItem(path: string, searchParams: URLSearchParams) {
  const linkable = [...searchParams.keys()].every((key) => key === "page")
  function LinkedPaginationItem(item: PaginationRenderItemParams) {
    if (!linkable || item.page === null || item.disabled || item.type === "start-ellipsis" || item.type === "end-ellipsis") {
      return <PaginationItem {...item} />
    }
    return <PaginationItem component={Link} to={pagedPath(path, item.page)} {...item} />
  }
  return LinkedPaginationItem
}
