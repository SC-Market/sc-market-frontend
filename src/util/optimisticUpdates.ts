/**
 * Utilities for implementing optimistic UI updates with RTK Query
 *
 * These utilities help implement optimistic updates that show changes immediately
 * and rollback on error, providing a more responsive user experience.
 *
 * IMPORTANT: Do NOT use optimistic updates for mutations that redirect to detail pages.
 * Redirects require the real ID from the server response, and optimistic temp IDs
 * would cause navigation to non-existent resources. Only use optimistic updates for:
 * - Operations that update existing resources (update, delete, status changes)
 * - Operations that add to lists where the user stays on the list page
 * - Operations that don't redirect after completion
 */

import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query"
import type { ThunkDispatch, AnyAction } from "@reduxjs/toolkit"

/**
 * Type for optimistic update patches that can be rolled back
 * This is the return type of api.util.updateQueryData
 */
export type OptimisticPatch = {
  undo: () => void
}

/**
 * Helper to generate a temporary ID for optimistic items
 * WARNING: Only use for optimistic updates in lists. Never use for redirects.
 */
export function generateTempId(prefix = "temp"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Helper to check if an item is optimistically added (has temp ID)
 */
export function isOptimisticItem(item: {
  id?: string
  listing_id?: string
}): boolean {
  const id = item.id || item.listing_id
  return id ? id.startsWith("temp-") : false
}

/**
 * Type for optimistic update handler
 */
export type OptimisticUpdateHandler<TArg, TResult> = (
  arg: TArg,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
  getState: () => unknown,
) => OptimisticPatch | OptimisticPatch[]

/**
 * Creates an optimistic update handler for RTK Query mutations
 *
 * @param updateFn Function that performs the optimistic cache update
 * @returns onQueryStarted handler for RTK Query mutation
 *
 * @example
 * ```typescript
 * updateMarketListing: builder.mutation<UniqueListing, MarketListingBody>({
 *   query: (listingData) => ({
 *     url: "/api/market/listings",
 *     method: "POST",
 *     body: listingData,
 *   }),
 *   async onQueryStarted(arg, { dispatch, queryFulfilled }) {
 *     await createOptimisticUpdate(
 *       (dispatch) => {
 *         // Optimistic update logic
 *         return dispatch(
 *           marketApi.util.updateQueryData('searchMarketListings', {}, (draft) => {
 *             // Update existing listing in cache
 *           })
 *         )
 *       },
 *       queryFulfilled,
 *       dispatch,
 *     )
 *   },
 * })
 * ```
 *
 * IMPORTANT: Do NOT use this for mutations that redirect after creation.
 * Redirects require real IDs from the server response.
 */
export async function createOptimisticUpdate<TArg, TResult>(
  updateFn: (
    dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
  ) => OptimisticPatch | OptimisticPatch[],
  queryFulfilled: Promise<{ data: TResult }>,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
): Promise<void> {
  // Perform optimistic update
  const patches = updateFn(dispatch)
  const patchArray = Array.isArray(patches) ? patches : [patches]

  try {
    // Wait for the server response
    await queryFulfilled
    // If successful, the server response will replace the optimistic update
    // via cache invalidation or transformResponse
  } catch (error) {
    // Rollback all patches on error
    patchArray.forEach((patch) => {
      if (patch && typeof patch.undo === "function") {
        patch.undo()
      }
    })
    // Re-throw the error so it can be handled by the component
    throw error
  }
}

/**
 * Helper to merge server response with optimistic update
 * Useful when the server response structure differs from optimistic structure
 */
export function mergeServerResponse<T>(
  optimistic: T,
  server: T,
  mergeFn?: (optimistic: T, server: T) => T,
): T {
  if (mergeFn) {
    return mergeFn(optimistic, server)
  }
  // Default: prefer server response, but keep optimistic fields that aren't in server
  return { ...optimistic, ...server }
}
