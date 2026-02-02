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
      { listing_id: string; location_id?: string | null; owner_id?: string | null; listed?: boolean }
    >({
      query: ({ listing_id, location_id, owner_id, listed }) => {
        const params = new URLSearchParams()
        if (location_id) params.append("location_id", location_id)
        if (owner_id) params.append("owner_id", owner_id)
        if (listed !== undefined) params.append("listed", String(listed))

        return `/market/listings/${listing_id}/lots?${params.toString()}`
      },
      providesTags: (result, error, { listing_id }) => [
        { type: "MarketListings", id: listing_id },
      ],
    }),

    // Create a new lot
    createLot: builder.mutation<
      { lot: StockLot },
      { listing_id: string; quantity: number; location_id?: string | null; owner_id?: string | null; listed?: boolean; notes?: string | null }
    >({
      query: ({ listing_id, ...body }) => ({
        url: `/market/listings/${listing_id}/lots`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { listing_id }) => [
        { type: "MarketListings", id: listing_id },
      ],
    }),

    // Update a lot
    updateLot: builder.mutation<
      { lot: StockLot },
      { lot_id: string; quantity?: number; location_id?: string | null; owner_id?: string | null; listed?: boolean; notes?: string | null }
    >({
      query: ({ lot_id, ...body }) => ({
        url: `/market/lots/${lot_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MarketListings"],
    }),

    // Delete a lot
    deleteLot: builder.mutation<{ success: boolean }, { lot_id: string }>({
      query: ({ lot_id }) => ({
        url: `/market/lots/${lot_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MarketListings"],
    }),

    // Transfer lot
    transferLot: builder.mutation<
      { source_lot: StockLot; destination_lot: StockLot },
      { lot_id: string; destination_location_id: string; quantity: number }
    >({
      query: ({ lot_id, ...body }) => ({
        url: `/market/lots/${lot_id}/transfer`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["MarketListings"],
    }),

    // Get locations
    getLocations: builder.query<{ locations: Location[] }, { search?: string }>({
      query: ({ search }) => {
        const params = new URLSearchParams()
        if (search) params.append("search", search)
        return `/market/locations?${params.toString()}`
      },
    }),

    // Create location
    createLocation: builder.mutation<{ location: Location }, { name: string }>({
      query: (body) => ({
        url: "/market/locations",
        method: "POST",
        body,
      }),
    }),

    // Get order allocations
    getOrderAllocations: builder.query<
      { allocations: Allocation[]; total_allocated: number },
      { order_id: string }
    >({
      query: ({ order_id }) => `/orders/${order_id}/allocations`,
    }),

    // Manual allocate order
    manualAllocateOrder: builder.mutation<
      { allocations: Allocation[] },
      { order_id: string; allocations: ManualAllocationInput[] }
    >({
      query: ({ order_id, allocations }) => ({
        url: `/orders/${order_id}/allocations/manual`,
        method: "POST",
        body: { allocations },
      }),
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
} = stockLotsApi
