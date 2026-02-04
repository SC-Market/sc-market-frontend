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
  owner_id: string | null
  listed: boolean
  notes: string | null
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

export interface StockAggregates {
  total: number
  available: number
  reserved: number
}

export interface Allocation {
  allocation_id: string
  lot_id: string
  quantity: number
  listing_id: string
  status?: string
  lot?: StockLot
}

export interface ManualAllocationInput {
  listing_id: string
  lot_id: string
  quantity: number
}

export const stockLotsApi = serviceApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get lots for a listing
    getListingLots: builder.query<
      { lots: StockLot[]; aggregates: StockAggregates },
      {
        listing_id: string
        location_id?: string | null
        owner_id?: string | null
        listed?: boolean
      }
    >({
      query: ({ listing_id, location_id, owner_id, listed }) => {
        const params = new URLSearchParams()
        if (location_id) params.append("location_id", location_id)
        if (owner_id) params.append("owner_id", owner_id)
        if (listed !== undefined) params.append("listed", String(listed))

        return `/api/market/listings/${listing_id}/lots?${params.toString()}`
      },
      transformResponse: (response: {
        data: { lots: StockLot[]; aggregates: StockAggregates }
      }) => response.data,
      providesTags: (result, error, { listing_id }) => [
        { type: "MarketListings", id: listing_id },
      ],
    }),

    // Create a new lot
    createLot: builder.mutation<
      { lot: StockLot },
      {
        listing_id: string
        quantity: number
        location_id?: string | null
        owner_username?: string | null
        listed?: boolean
        notes?: string | null
      }
    >({
      query: ({ listing_id, ...body }) => ({
        url: `/api/market/listings/${listing_id}/lots`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: { lot: StockLot } }) =>
        response.data,
      invalidatesTags: (result, error, { listing_id }) => [
        { type: "MarketListings", id: listing_id },
        { type: "MarketListings", id: "SEARCH" },
        "MarketListings",
        "MyListings",
      ],
    }),

    // Update a lot
    updateLot: builder.mutation<
      { lot: StockLot },
      {
        lot_id: string
        listing_id?: string
        quantity?: number
        location_id?: string | null
        owner_id?: string | null
        listed?: boolean
        notes?: string | null
      }
    >({
      query: ({ lot_id, ...body }) => ({
        url: `/api/market/lots/${lot_id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: { data: { lot: StockLot } }) =>
        response.data,
      invalidatesTags: [
        { type: "MarketListings", id: "SEARCH" },
        "MarketListings",
        "MyListings",
      ],
    }),

    // Delete a lot
    deleteLot: builder.mutation<{ success: boolean }, { lot_id: string }>({
      query: ({ lot_id }) => ({
        url: `/api/market/lots/${lot_id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: { success: boolean } }) =>
        response.data,
      invalidatesTags: [
        { type: "MarketListings", id: "SEARCH" },
        "MarketListings",
        "MyListings",
      ],
    }),

    // Transfer lot
    transferLot: builder.mutation<
      { source_lot: StockLot; destination_lot: StockLot },
      { lot_id: string; destination_location_id: string; quantity: number }
    >({
      query: ({ lot_id, ...body }) => ({
        url: `/api/market/lots/${lot_id}/transfer`,
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        data: { source_lot: StockLot; destination_lot: StockLot }
      }) => response.data,
      invalidatesTags: [
        { type: "MarketListings", id: "SEARCH" },
        "MarketListings",
        "MyListings",
      ],
    }),

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
    }),

    // Get order allocations
    getOrderAllocations: builder.query<
      { allocations: Allocation[]; total_allocated: number },
      { order_id: string }
    >({
      query: ({ order_id }) => `/api/orders/${order_id}/allocations`,
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
      ],
    }),

    // Search all lots
    searchLots: builder.query<
      { lots: StockLot[]; total: number },
      {
        user_id?: string
        contractor_spectrum_id?: string
        location_id?: string
        listed?: boolean
        page_size?: number
        offset?: number
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.user_id) searchParams.append("user_id", params.user_id)
        if (params.contractor_spectrum_id)
          searchParams.append(
            "contractor_spectrum_id",
            params.contractor_spectrum_id,
          )
        if (params.location_id)
          searchParams.append("location_id", params.location_id)
        if (params.listed !== undefined)
          searchParams.append("listed", String(params.listed))
        if (params.page_size)
          searchParams.append("page_size", String(params.page_size))
        if (params.offset) searchParams.append("offset", String(params.offset))
        return `/api/market/lots?${searchParams.toString()}`
      },
      transformResponse: (response: {
        data: { lots: StockLot[]; total: number }
      }) => response.data,
      providesTags: [{ type: "MarketListings", id: "SEARCH" }],
    }),
  }),
})

export const {
  useGetListingLotsQuery,
  useCreateLotMutation,
  useUpdateLotMutation,
  useDeleteLotMutation,
  useTransferLotMutation,
  useGetLocationsQuery,
  useCreateLocationMutation,
  useGetOrderAllocationsQuery,
  useManualAllocateOrderMutation,
  useSearchLotsQuery,
} = stockLotsApi
