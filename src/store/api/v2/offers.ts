/**
 * V2 Offers API
 *
 * V2 offers (purchase flows) are handled through the V1 offer bridge.
 * The V2 cart checkout (useCheckoutCartMutation) and buy order purchase
 * (useCreateBuyOrderMutation) in market.ts create orders that use the
 * existing V1 offer/session system for fulfillment tracking.
 *
 * No separate V2 offer endpoints are needed — all offer-related hooks
 * are exported from store/api/v2/market.ts.
 */
import { generatedApi as api } from "../../generatedApi"
export const addTagTypes = [] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({}),
    overrideExisting: false,
  })
export { injectedRtkApi as v2_offersApi }
export const {} = injectedRtkApi
