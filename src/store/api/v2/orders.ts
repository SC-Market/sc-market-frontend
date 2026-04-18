/**
 * V2 Orders API
 *
 * V2 order endpoints are defined in store/api/v2/market.ts alongside
 * the rest of the V2 market API. The relevant hooks are:
 *
 *   - useCreateOrderMutation   — POST /api/v2/orders
 *   - useGetOrdersQuery        — GET  /api/v2/orders
 *   - useGetOrderDetailQuery   — GET  /api/v2/orders/:id
 *
 * This file is intentionally empty to avoid duplicate endpoint
 * injection. Import order hooks directly from market.ts.
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
export { injectedRtkApi as v2_ordersApi }
export const {} = injectedRtkApi
