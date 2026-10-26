/**
 * Whether a list or page should show its loading skeleton for an RTK Query
 * result: only while there is no data for the query's CURRENT arguments yet
 * (the first load, or a change of page / filters / id).
 *
 * `isLoading || isFetching` is wrong for that: `isFetching` is also true for
 * every background refetch of the same arguments (polling, refetch on focus,
 * a tag invalidated by a mutation), so the loaded content was swapped for the
 * skeleton and back each time. During such a refetch `currentData` keeps the
 * loaded result, so the content stays on screen.
 */
export function isAwaitingData(query: {
  isFetching: boolean
  currentData?: unknown
}): boolean {
  return query.isFetching && query.currentData === undefined
}
