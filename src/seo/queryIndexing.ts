/**
 * How a URL's query string affects indexing, shared by the SPA (Page.tsx)
 * and the edge bridge so both emit the same canonical and robots tags.
 *
 * - No query, or only tracking parameters and ?lng: the clean page.
 * - Exactly `?page=N` with N >= 2: a paginated hub page, self-canonical and
 *   indexable (`pageNumber`). Pages without pagination treat it like any
 *   other query.
 * - Anything else (search, filters, sort, ?page=1): a variant of the clean
 *   page: robots noindex, canonical to the clean URL.
 */
import { hasPageQuery } from "../document/pageQuery"

/** Highest hub page served as its own page (deeper ones are noindex variants). */
export const MAX_INDEXED_PAGE = 1000

export interface QueryIndexing {
  /** The query changes the page (not just tracking parameters). */
  hasQuery: boolean
  /** N of a bare `?page=N` (N >= 2), else null. */
  pageNumber: number | null
}

export function queryIndexing(params: URLSearchParams): QueryIndexing {
  const search = params.toString()
  if (!hasPageQuery(search)) return { hasQuery: false, pageNumber: null }
  const meaningful = [...params.keys()].filter((key) =>
    hasPageQuery(`${encodeURIComponent(key)}=`),
  )
  if (
    meaningful.length !== 1 ||
    meaningful[0] !== "page" ||
    params.getAll("page").length !== 1
  ) {
    return { hasQuery: true, pageNumber: null }
  }
  const raw = params.get("page") ?? ""
  if (!/^[1-9][0-9]{0,3}$/.test(raw))
    return { hasQuery: true, pageNumber: null }
  const n = Number(raw)
  return {
    hasQuery: true,
    pageNumber: n >= 2 && n <= MAX_INDEXED_PAGE ? n : null,
  }
}

/** Path plus `?page=N` (page 1 is the bare path). */
export function pagedPath(path: string, pageNumber: number): string {
  return pageNumber > 1 ? `${path}?page=${pageNumber}` : path
}

/**
 * Hubs whose `?page=N` is its own page, in the SPA and the bridge (the
 * bridge kinds with `paginated: true`; a test keeps the two in sync).
 */
export const PAGINATED_PATHS: readonly string[] = [
  "/market",
  "/shops",
  "/storefronts",
  "/wiki/items",
  "/wiki/ships",
  "/wiki/commodities",
]

/** Paginated hubs with a path parameter: the mission hubs (/missions/givers/<slug>, …). */
export const PAGINATED_PATTERNS: readonly RegExp[] = [
  /^\/missions\/(?:givers|factions|types|systems)\/[^/]+$/,
]

export function isPaginatedPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/"
  return (
    PAGINATED_PATHS.includes(path) ||
    PAGINATED_PATTERNS.some((pattern) => pattern.test(path))
  )
}
