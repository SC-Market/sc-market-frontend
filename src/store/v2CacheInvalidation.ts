/**
 * Middleware that invalidates V2 RTK Query cache when V1 mutations succeed.
 * Since V1 (serviceApi) and V2 (generatedApiV2) are separate createApi instances,
 * tags don't cross boundaries. This middleware bridges them.
 */
import type { Middleware } from "@reduxjs/toolkit"
import { marketV2Api } from "./api/v2/market"

/** V1 mutation endpoint names that should invalidate V2 offer cache */
const OFFER_MUTATIONS = [
  "updateOfferStatus",
  "counterOffer",
  "createOfferThread",
  "assignOffer",
  "unassignOffer",
  "mergeOfferSessions",
]

/** V1 mutation endpoint names that should invalidate V2 order cache */
const ORDER_MUTATIONS = [
  "setOrderStatus",
  "assignOrder",
  "unassignOrder",
  "createOrderThread",
  "leaveOrderReview",
]

export const v2CacheInvalidationMiddleware: Middleware = (storeApi) => (next) => (action: unknown) => {
  const result = next(action)

  const act = action as { type?: string; meta?: { arg?: { endpointName?: string } } }
  if (typeof act?.type === "string" && act.type.endsWith("/fulfilled")) {
    const endpointName = act?.meta?.arg?.endpointName

    if (OFFER_MUTATIONS.includes(endpointName)) {
      storeApi.dispatch(marketV2Api.util.invalidateTags(["Offers V2"]))
    }

    if (ORDER_MUTATIONS.includes(endpointName)) {
      storeApi.dispatch(marketV2Api.util.invalidateTags(["Orders V2"]))
    }

    // Accept creates an order too
    if (endpointName === "updateOfferStatus") {
      storeApi.dispatch(marketV2Api.util.invalidateTags(["Orders V2"]))
    }
  }

  return result
}
