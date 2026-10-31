/**
 * After a server-rendered page hydrates, refetch the live data it shipped
 * (listings, prices, stock, shops, orgs, users: everything but the game data
 * in PRERENDERABLE_ENDPOINTS). The SSR Function's HTML can be up to 11
 * minutes old (edge cache, docs/ssr-worker.md); the page shows that data at
 * once, then updates in place. A refetch keeps the current data on screen
 * (isFetching, not isLoading), so nothing flashes.
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
}

interface Endpoint {
  initiate(
    arg: unknown,
    options: { forceRefetch: boolean; subscribe: boolean },
  ): unknown
}

const APIS = [serviceApi, generatedApi, generatedApiV2] as const

/** The shipped queries to refetch: fulfilled, live (not game data). */
export function liveShippedQueries(
  shipped: PrerenderedApiState,
): Array<{ reducerPath: string; endpointName: string; originalArgs: unknown }> {
  const out: Array<{
    reducerPath: string
    endpointName: string
    originalArgs: unknown
  }> = []
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
      })
    }
  }
  return out
}

/** Refetch the live shipped queries (fire and forget). Returns how many. */
export function refreshShippedLiveData(
  dispatch: AppDispatch,
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
    if (!endpoint) continue
    dispatch(
      endpoint.initiate(query.originalArgs, {
        forceRefetch: true,
        subscribe: false,
      }) as Parameters<AppDispatch>[0],
    )
    started++
  }
  return started
}
