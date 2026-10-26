/**
 * Stock Lots API Endpoints
 *
 * Injected into serviceApi for stock lot management. Order stock allocation
 * moved to the generated V2 client (/api/v2/orders/{orderId}/allocations).
 */

import { serviceApi } from "../service"

export interface Location {
  location_id: string
  name: string
  is_preset: boolean
  display_order: number | null
  created_by: string | null
  created_at: string
}

export const stockLotsApi = serviceApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get locations
    getLocations: builder.query<{ locations: Location[] }, { search?: string }>(
      {
        query: ({ search }) => {
          const params = new URLSearchParams()
          if (search) params.append("search", search)
          return `/api/market/locations?${params.toString()}`
        },
        transformResponse: (response: { data: { locations: Location[] } }) =>
          response.data,
        providesTags: [{ type: "StockLocations", id: "LIST" }],
      },
    ),

    // Create location
    createLocation: builder.mutation<{ location: Location }, { name: string }>({
      query: (body) => ({
        url: "/api/market/locations",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: { location: Location } }) =>
        response.data,
      invalidatesTags: [{ type: "StockLocations", id: "LIST" }],
    }),
  }),
})

export const { useGetLocationsQuery, useCreateLocationMutation } = stockLotsApi
