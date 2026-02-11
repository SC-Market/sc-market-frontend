/**
 * Stock Lots API
 *
 * RTK Query API for stock lot management
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import Block from '@mui/icons-material/Block';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidRounded from '@mui/icons-material/PhoneAndroidRounded';
import NoteAddRounded from '@mui/icons-material/NoteAddRounded';

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

export interface Allocation {
  allocation_id: string
  lot_id: string
  order_id: string
  quantity: number
  status: "active" | "released" | "fulfilled"
  created_at: string
  updated_at: string
  lot?: StockLot
}

export interface GetOrderAllocationsRequest {
  order_id: string
}

export interface GetOrderAllocationsResponse {
  allocations: Allocation[]
  total_allocated: number
}

export interface ManualAllocationInput {
  lot_id: string
  quantity: number
}

export interface ManualAllocateOrderRequest {
  order_id: string
  allocations: ManualAllocationInput[]
}

export interface ManualAllocateOrderResponse {
  allocations: Allocation[]
}

export const stockLotsApi = createApi({
  reducerPath: "stockLotsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),
  tagTypes: ["StockLots", "Locations", "MarketListings", "Allocations"],
  endpoints: (builder) => ({
    // Simple stock management
    updateSimpleStock: builder.mutation<
      UpdateSimpleStockResponse,
      UpdateSimpleStockRequest
    >({
      query: ({ listing_id, quantity }) => ({
        url: `/market/listings/${listing_id}/stock`,
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
          url: `/market/listings/${listing_id}/lots?${params.toString()}`,
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
        url: `/market/listings/${listing_id}/lots`,
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
        url: `/market/lots/${lot_id}`,
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
        url: `/market/lots/${lot_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StockLots", "MarketListings"],
    }),

    // Transfer lot
    transferLot: builder.mutation<TransferLotResponse, TransferLotRequest>({
      query: ({ lot_id, ...body }) => ({
        url: `/market/lots/${lot_id}/transfer`,
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
          url: `/market/locations?${params.toString()}`,
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
        url: `/market/locations`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Locations"],
    }),

    // Get order allocations
    getOrderAllocations: builder.query<
      GetOrderAllocationsResponse,
      GetOrderAllocationsRequest
    >({
      query: ({ order_id }) => ({
        url: `/orders/${order_id}/allocations`,
        method: "GET",
      }),
      providesTags: (result, error, { order_id }) => [
        { type: "Allocations", id: order_id },
      ],
    }),

    // Manual allocate order
    manualAllocateOrder: builder.mutation<
      ManualAllocateOrderResponse,
      ManualAllocateOrderRequest
    >({
      query: ({ order_id, allocations }) => ({
        url: `/orders/${order_id}/allocations/manual`,
        method: "POST",
        body: { allocations },
      }),
      invalidatesTags: (result, error, { order_id }) => [
        { type: "Allocations", id: order_id },
        "StockLots",
        "MarketListings",
      ],
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
  useGetOrderAllocationsQuery,
  useManualAllocateOrderMutation,
} = stockLotsApi
