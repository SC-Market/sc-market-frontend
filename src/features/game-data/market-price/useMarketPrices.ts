/**
 * SC Market prices of a set of game items in one request (the batched
 * GET /game-items/market-prices), for list pages and detail pages alike.
 *
 * Client-only on purpose: the wiki and game-data pages are prerendered or
 * server-rendered, and live prices must not be baked into that HTML (they
 * would be stale, and differ from the browser's first render). Until the page
 * has hydrated, the hook returns nothing and skips the request, so the server
 * render and the hydration render agree; the line appears after.
 */
import { useMemo } from "react"
import {
  useGetMarketPricesQuery,
  type GameItemMarketPrice,
} from "../../../store/api/v2/market"
import { useHydrated } from "../../../hooks/ssr/useHydrated"

/** Most ids one request takes (the backend's limit: the largest list page). */
export const MARKET_PRICES_MAX_IDS = 120

const EMPTY: ReadonlyMap<string, GameItemMarketPrice> = new Map()

/** The request's `ids` argument: unique, sorted (a stable cache key), capped. */
export function marketPriceIdsArg(ids: readonly string[]): string {
  return [...new Set(ids.map((id) => id.toLowerCase()))]
    .sort()
    .slice(0, MARKET_PRICES_MAX_IDS)
    .join(",")
}

/**
 * Prices by game item id. An item nobody sells has no entry (callers hide
 * the price), and so does every item before hydration.
 */
export function useMarketPrices(
  ids: readonly string[],
): ReadonlyMap<string, GameItemMarketPrice> {
  const hydrated = useHydrated()
  const arg = marketPriceIdsArg(ids)
  const { data } = useGetMarketPricesQuery(
    { ids: arg },
    { skip: !hydrated || arg === "" },
  )
  return useMemo(() => {
    if (!hydrated || !data) return EMPTY
    return new Map(data.items.map((p) => [p.game_item_id.toLowerCase(), p]))
  }, [data, hydrated])
}
