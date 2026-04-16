import { serviceApi } from "../../../../store/service"
import { unwrapResponse } from "../../../../store/api-utils"
import type { SearchListingsRequest, SearchListingsResponse } from "../types/v2-api-types"

/**
 * Market V2 API - Redux Toolkit Query endpoints for V2 market system
 * 
 * Uses OpenAPI-generated types and follows the same pattern as V1 marketApi
 */
export const marketV2Api = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    searchListingsV2: builder.query<SearchListingsResponse, SearchListingsRequest>({
      query: (params) => ({ url: "/api/v2/listings/search", params }),
      transformResponse: unwrapResponse,
      keepUnusedDataFor: 120,
      providesTags: ["MarketListingsV2"],
    }),
  }),
})

export const {
  useSearchListingsV2Query,
  useLazySearchListingsV2Query,
} = marketV2Api
