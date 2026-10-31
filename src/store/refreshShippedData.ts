/**
 * After a server-rendered page hydrates, refetch the live data it shipped
 * (listings, prices, stock, shops, orgs, users: everything but the game data
 * in PRERENDERABLE_ENDPOINTS). The SSR Function's HTML can be up to 11
 * minutes old (edge cache, docs/ssr-worker.md); the page shows that data at
 * once, then updates in place. A refetch keeps the current data on screen
 * (the answer replaces it), and a refetch that fails (offline, a 5xx)
 * changes nothing: a page that rendered fine never turns into an error
 * page because a background refresh failed.
 *
 * Prerendered hubs ship game data only, so nothing is refetched there.
 */
import type { AppDispatch } from "./store"
import type { PrerenderedApiState } from "./hydration"
import { serviceApi } from "./service"
import { generatedApi } from "./generatedApi"
import { generatedApiV2 } from "./generatedApiV2"
import { PRERENDERABLE_ENDPOINTS } from "../server/prerenderData"

interface ShippedQuery {
  endpointName?: string
  originalArgs?: unknown
  status?: string
  data?: unknown
}

interface Endpoint {
  initiate(
    arg: unknown,
    options: { forceRefetch: boolean; subscribe: boolean },
  ): unknown
}

/** What dispatch(initiate()) resolves to (the parts used here). */
interface QueryResult {
  isError?: boolean
  data?: unknown
}

type Upsert = (endpointName: string, arg: unknown, data: unknown) => unknown

const APIS = [serviceApi, generatedApi, generatedApiV2] as const

export interface ShippedLiveQuery {
  reducerPath: string
  endpointName: string
  originalArgs: unknown
  data: unknown
}

/** The shipped queries to refetch: fulfilled, live (not game data). */
export function liveShippedQueries(
  shipped: PrerenderedApiState,
): ShippedLiveQuery[] {
  const out: ShippedLiveQuery[] = []
  for (const [reducerPath, slice] of Object.entries(shipped)) {
    const queries = (slice as { queries?: Record<string, ShippedQuery> })
      .queries
    for (const entry of Object.values(queries ?? {})) {
      if (
        entry?.status !== "fulfilled" ||
        !entry.endpointName ||
        PRERENDERABLE_ENDPOINTS.has(entry.endpointName)
      ) {
        continue
      }
      out.push({
        reducerPath,
        endpointName: entry.endpointName,
        originalArgs: entry.originalArgs,
        data: entry.data,
      })
    }
  }
  return out
}

/** Something to dispatch initiate()/upsert actions to (a store). */
interface Dispatcher {
  dispatch: AppDispatch
}

/**
 * Refetch the live shipped queries (fire and forget). Each refetch runs on
 * `scratch`, a separate store, and only a successful answer is written to
 * the page's store (upsertQueryData): a failed refresh leaves the page
 * exactly as it was. Returns how many were started.
 */
export function refreshShippedLiveData(
  page: Dispatcher,
  scratch: Dispatcher,
  shipped: PrerenderedApiState,
): number {
  let started = 0
  for (const query of liveShippedQueries(shipped)) {
    const api = APIS.find((a) => a.reducerPath === query.reducerPath)
    // The page's chunk injected its endpoints before hydration; one that
    // isn't there (a renamed endpoint, an old HTML) is skipped.
    const endpoint = (api?.endpoints as Record<string, Endpoint | undefined>)?.[
      query.endpointName
    ]
    if (!api || !endpoint) continue
    const refetch = scratch.dispatch(
      endpoint.initiate(query.originalArgs, {
        forceRefetch: true,
        subscribe: false,
      }) as Parameters<AppDispatch>[0],
    ) as unknown as PromiseLike<QueryResult>
    void Promise.resolve(refetch).then((result) => {
      if (!result || result.isError || result.data === undefined) return
      const upsert = api.util.upsertQueryData as unknown as Upsert
      page.dispatch(
        upsert(
          query.endpointName,
          query.originalArgs,
          result.data,
        ) as Parameters<AppDispatch>[0],
      )
    })
    started++
  }
  return started
}
