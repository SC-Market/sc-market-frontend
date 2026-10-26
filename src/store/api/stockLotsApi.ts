/**
 * Stock Lots API Endpoints
 *
 * Injected into serviceApi for stock lot management
 */

import { serviceApi } from "../service"

export interface StockLot {
  lot_id: string
  listing_id: string
  quantity_total: number
  location_id: string | null
  location?: {
    location_id: string
    name: string
  } | null
  owner_id: string | null
  owner?: {
    user_id: string
    username: string
    display_name: string
    avatar: string | null
  } | null
  listed: boolean
  notes: string | null
  variant?: {
    variant_id: string
    attributes: {
      quality_tier?: number
      quality_value?: number
      crafted_source?: string
    }
    display_name: string
  } | null
  created_at: string
  updated_at: string
}

export interface Location {
  location_id: string
  name: string
  is_preset: boolean
  display_order: number | null
  created_by: string | null
  created_at: string
}

export interface Allocation {
  allocation_id: string
  lot_id: string
  quantity: number
  listing_id: string
  status?: string
  lot?: StockLot & {
    location?: Location | null
    owner?: {
      user_id: string
      username: string
      display_name: string
      avatar: string | null
    } | null
  }
}

/** Listing data returned by the allocations endpoint — V2 shape or V1 shape */
export interface AllocationListingData {
  title?: string
  listing_id?: string
  photos?: string[]
  /** V1 shape has details.title */
  details?: { title?: string }
}

export interface AllocationGroup {
  listing_id: string
  listing: AllocationListingData | null
  allocations: Allocation[]
  total_allocated: number
  status?: string
}

export interface ManualAllocationInput {
  listing_id: string
  lot_id: string
  quantity: number
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

    // Get order allocations
    getOrderAllocations: builder.query<
      { grouped_allocations: AllocationGroup[]; total_allocated: number },
      { order_id: string }
    >({
      query: ({ order_id }) => `/api/orders/${order_id}/allocations`,
      transformResponse: (response: {
        data: {
          grouped_allocations: AllocationGroup[]
          total_allocated: number
        }
      }) => response.data,
      providesTags: (result, error, { order_id }) => [
        { type: "Orders", id: order_id },
        { type: "Orders", id: "ALLOCATIONS" },
      ],
    }),

    // Manual allocate order
    manualAllocateOrder: builder.mutation<
      { allocations: Allocation[] },
      { order_id: string; allocations: ManualAllocationInput[] }
    >({
      query: ({ order_id, allocations }) => ({
        url: `/api/orders/${order_id}/allocations/manual`,
        method: "POST",
        body: { allocations },
      }),
      invalidatesTags: (result, error, { order_id, allocations }) => [
        { type: "Orders", id: order_id },
        { type: "Orders", id: "ALLOCATIONS" },
        { type: "MarketListings", id: "SEARCH" },
        ...allocations.map((a) => ({
          type: "MarketListings" as const,
          id: a.listing_id,
        })),
        ...allocations.map((a) => ({
          type: "StockLots" as const,
          id: a.listing_id,
        })),
      ],
    }),
  }),
})

export const {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useGetOrderAllocationsQuery,
  useManualAllocateOrderMutation,
} = stockLotsApi
