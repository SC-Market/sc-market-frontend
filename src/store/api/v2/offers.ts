/**
 * V2 Offers API
 *
 * V2 offer endpoints are defined in store/api/v2/market.ts alongside
 * the rest of the V2 market API. The relevant hooks are:
 *
 *   - useGetOfferSessionQuery  — GET  /api/v2/offers/:sessionId
 *   - useSearchOffersQuery     — GET  /api/v2/offers/search
 *
 * This file is intentionally empty to avoid duplicate endpoint
 * injection. Import offer hooks directly from market.ts.
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
