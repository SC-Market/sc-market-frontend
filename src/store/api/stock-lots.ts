/**
 * Stock Lots API
 * 
 * RTK Query API for stock lot management
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

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

export interface UpdateSimpleStockRequest {
  listing_id: string
  quantity: number
}

export interface UpdateSimpleStockResponse {
  quantity_available: number
  quantity_reserved: number
}

export interface GetListingLotsRequest {
  listing_id: string
  location_id?: string
  owner_id?: string
  listed?: boolean
}

export interface GetListingLotsResponse {
  lots: StockLot[]
  aggregates: StockAggregates
}

export interface CreateLotRequest {
  listing_id: string
  quantity: number
  location_id?: string | null
  owner_id?: string | null
  listed?: boolean
  notes?: string | null
}

export interface CreateLotResponse {
  lot: StockLot
}

export interface UpdateLotRequest {
  lot_id: string
  quantity?: number
  location_id?: string | null
  owner_id?: string | null
  listed?: boolean
  notes?: string | null
}

export interface UpdateLotResponse {
  lot: StockLot
}

export interface TransferLotRequest {
  lot_id: string
  destination_location_id: string
  quantity: number
}

export interface TransferLotResponse {
  source_lot: StockLot
  destination_lot: StockLot
}

export interface GetLocationsRequest {
  search?: string
}

export interface GetLocationsResponse {
  locations: Location[]
}

export interface CreateLocationRequest {
  name: string
}

export interface CreateLocationResponse {
  location: Location
}

export const stockLotsApi = createApi({
  reducerPath: "stockLotsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/market",
    credentials: "include",
  }),
  tagTypes: ["StockLots", "Locations", "MarketListings"],
  endpoints: (builder) => ({
    // Simple stock management
    updateSimpleStock: builder.mutation<
      UpdateSimpleStockResponse,
      UpdateSimpleStockRequest
    >({
      query: ({ listing_id, quantity }) => ({
        url: `/listings/${listing_id}/stock`,
        method: "PUT",
        body: { quantity },
      }),
      invalidatesTags: (result, error, { listing_id }) => [
        { type: "StockLots", id: listing_id },
        { type: "MarketListings", id: listing_id },
        "MarketListings",
      ],
    }),

    // Get lots for a listing
    getListingLots: builder.query<
      GetListingLotsResponse,
      GetListingLotsRequest
    >({
      query: ({ listing_id, location_id, owner_id, listed }) => {
        const params = new URLSearchParams()
        if (location_id) params.append("location_id", location_id)
        if (owner_id) params.append("owner_id", owner_id)
        if (listed !== undefined) params.append("listed", String(listed))

        return {
          url: `/listings/${listing_id}/lots?${params.toString()}`,
          method: "GET",
        }
      },
      providesTags: (result, error, { listing_id }) => [
        { type: "StockLots", id: listing_id },
      ],
    }),

    // Create a new lot
    createLot: builder.mutation<CreateLotResponse, CreateLotRequest>({
      query: ({ listing_id, ...body }) => ({
        url: `/listings/${listing_id}/lots`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { listing_id }) => [
        { type: "StockLots", id: listing_id },
        { type: "MarketListings", id: listing_id },
        "MarketListings",
      ],
    }),

    // Update a lot
    updateLot: builder.mutation<UpdateLotResponse, UpdateLotRequest>({
      query: ({ lot_id, ...body }) => ({
        url: `/lots/${lot_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: "StockLots", id: result?.lot.listing_id },
        { type: "MarketListings", id: result?.lot.listing_id },
        "MarketListings",
      ],
    }),

    // Delete a lot
    deleteLot: builder.mutation<{ success: boolean }, { lot_id: string }>({
      query: ({ lot_id }) => ({
        url: `/lots/${lot_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StockLots", "MarketListings"],
    }),

    // Transfer lot
    transferLot: builder.mutation<TransferLotResponse, TransferLotRequest>({
      query: ({ lot_id, ...body }) => ({
        url: `/lots/${lot_id}/transfer`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: "StockLots", id: result?.source_lot.listing_id },
        { type: "MarketListings", id: result?.source_lot.listing_id },
        "MarketListings",
      ],
    }),

    // Get locations
    getLocations: builder.query<GetLocationsResponse, GetLocationsRequest>({
      query: ({ search }) => {
        const params = new URLSearchParams()
        if (search) params.append("search", search)

        return {
          url: `/locations?${params.toString()}`,
          method: "GET",
        }
      },
      providesTags: ["Locations"],
    }),

    // Create custom location
    createLocation: builder.mutation<
      CreateLocationResponse,
      CreateLocationRequest
    >({
      query: (body) => ({
        url: `/locations`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Locations"],
    }),
  }),
})

export const {
  useUpdateSimpleStockMutation,
  useGetListingLotsQuery,
  useCreateLotMutation,
  useUpdateLotMutation,
  useDeleteLotMutation,
  useTransferLotMutation,
  useGetLocationsQuery,
  useCreateLocationMutation,
} = stockLotsApi
