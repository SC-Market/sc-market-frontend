/**
 * Shared types and helpers for page data prefetch functions.
 *
 * Each public page declares its first-render data requirements as a plain
 * `prefetchXPage(dispatch, params)` function (next to the feature it belongs
 * to). Today they are run on link hover/intent to warm the RTK Query cache;
 * later they become react-router loaders with almost no change.
 *
 * Rules for prefetch functions:
 * - Only dispatch `api.endpoints.<endpoint>.initiate(args)` on existing
 *   endpoints, with exactly the args the page's components pass to the
 *   matching `use*Query` hook, so the component's subscription hits the cache.
 * - Take `dispatch` as a parameter; never import the store.
 * - Skip auth-only queries (e.g. the current user's profile).
 * - Resolve when every initiated query has settled; never reject.
 */
import type { Params } from "react-router-dom"
import type { AppDispatch } from "../store/store"

export type PrefetchDispatch = AppDispatch

/** Route params as produced by react-router's matchPath/matchRoutes. */
export type RouteParams = Params<string>

export type DataPrefetchFn = (
  dispatch: PrefetchDispatch,
  params: RouteParams,
) => Promise<void>

/** The object returned by `dispatch(endpoint.initiate(args))`. */
interface QuerySubscription<T> extends PromiseLike<T> {
  unsubscribe(): void
}

/**
 * Wait for a dispatched `initiate()` to settle, then release its
 * subscription. The cached data stays for the endpoint's
 * `keepUnusedDataFor`, so the page's own hook subscription picks it up
 * without a second request. The initiate promise never rejects (errors are
 * part of the result), so neither does this.
 */
export async function settleQuery<T>(
  subscription: QuerySubscription<T>,
): Promise<T> {
  try {
    return await subscription
  } finally {
    subscription.unsubscribe()
  }
}
