import { serviceApi } from "./service"
import {
  MarketListing,
  MarketBuyOrderBody,
  BaseListingType,
  MarketMultipleBody,
  ListingStats,
  MarketListingBody,
  UniqueListing,
} from "../datatypes/MarketListing"
import { MinimalUser } from "../datatypes/User.ts"
import { Order } from "../datatypes/Order.tsx"
import { unwrapResponse } from "./orders.ts"
import { BaseQueryMeta } from "@reduxjs/toolkit/query"

// Discriminated union for photo upload parameters to prevent undefined values
type PhotoUploadParams =
  | { status: "valid"; listingId: string; photos: File[] }
  | { status: "invalid"; error: string }

export interface Pagination {
  page: number
  page_size: number
  total: number
  totalItems: number
  has_next: boolean
  has_prev: boolean
}

function validatePhotoUploadParams(
  listingId: string | undefined,
  photos: File[],
): PhotoUploadParams {
  if (!listingId) {
    return {
      status: "invalid",
      error: "Listing ID is required for photo upload",
    }
  }
  if (!photos || photos.length === 0) {
    return { status: "invalid", error: "At least one photo is required" }
  }
  return { status: "valid", listingId, photos }
}

// Base interface for all market listing search results
export interface BaseMarketListingSearchResult {
  listing_id: string
  item_type: string
  item_name: string | null
  game_item_id: string | null
  price: number
  expiration: string
  minimum_price: number
  maximum_price: number
  quantity_available: number
  timestamp: string
  total_rating: number
  avg_rating: number
  details_id: string
  status: "active" | "inactive" | "archived"
  user_seller: string | null // Now just the username string
  contractor_seller: string | null // Now just the spectrum_id string
  rating_count: number
  rating_streak: number
  total_orders: number
  total_assignments: number
  response_rate: number
  title: string
  photo: string
  internal: boolean
  badges?: {
    badge_ids: string[]
    metadata: any
  } | null
}

export type ExtendedUniqueSearchResult = BaseMarketListingSearchResult & {
  listing_type: "unique"
  sale_type: "sale" | "auction"
  auction_end_time?: string | null
}

export type ExtendedAggregateSearchResult = BaseMarketListingSearchResult & {
  listing_type: "aggregate"
  sale_type: "aggregate"
}

export type ExtendedMultipleSearchResult = BaseMarketListingSearchResult & {
  listing_type: "multiple"
  sale_type: "multiple"
}

// Discriminating union for different listing types in search results
export type MarketListingSearchResult =
  | ExtendedUniqueSearchResult
  | ExtendedAggregateSearchResult
  | ExtendedMultipleSearchResult

// MarketListingComplete - matches OpenAPI spec for individual listings
export interface MarketListingComplete {
  listing_id: string
  price: number
  sale_type: "sale" | "auction" | "aggregate" | "multiple"
  quantity_available: number
  status: "active" | "inactive" | "archived"
  title: string
  description: string
  item_type: string
  internal: boolean
  seller: {
    user: {
      user_id: string
      username: string
      avatar_url: string | null
    } | null
    contractor: {
      contractor_id: string
      name: string
      spectrum_id: string
      logo_url: string | null
    } | null
  }
  photos: Array<{
    resource_id: string
    url: string
  }>
  auction_details?: {
    minimum_bid_increment: number
    end_time: string
    status: "active" | "inactive"
    current_bid?: {
      amount: number
      bidder: {
        user_id: string
        username: string
        avatar_url: string | null
      }
    } | null
  } | null
  // Additional properties for compatibility
  timestamp?: string
  expiration?: string
  game_item_id?: string | null
  item_name?: string | null
  listing_type?: string
  details_id?: string
  minimum_price?: number
  maximum_price?: number
  total_rating?: number
  avg_rating?: number
  rating_count?: number | null
  rating_streak?: number | null
  total_orders?: number | null
  total_assignments?: number | null
  response_rate?: number | null
  auction_end_time?: string | null
  photo?: string
  user_seller?: MinimalUser | null
  contractor_seller?: MinimalUser | null
}

export interface MarketBid {
  bid_id: string
  listing_id: string
  bidder: {
    user_id?: string | null
    contractor_id?: string | null
    username: string
    display_name: string
  }
  bid_amount: number
  timestamp: string
}

export interface CreateBidRequest {
  bid_amount: number
}

export type SaleType = "sale" | "aggregate" | "multiple" | "auction"

export type MarketSearchParams = Partial<{
  query: string
  statuses: string
  sale_type: SaleType | "any"
  item_type: string
  minCost: number | string | null
  maxCost: number | string | null
  user_seller: string
  contractor_seller: string
  page: number | string
  rating: string | null | number
  quantityAvailable: string | number
  sort: string | null
  seller_rating: string | number
  index: string | number
  page_size: string | number
  listing_type: string | null
}>

export interface MarketSearchResult {
  total: number
  listings: MarketListingSearchResult[]
}

export interface MarketStats {
  total_orders: number
  total_order_value: number
  week_orders: number
  week_order_value: number
}

// Define a service using a base URL and expected endpoints
export const marketApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getMarketStats: builder.query<MarketStats, void>({
      query: () => "/api/market/stats",
      transformResponse: unwrapResponse,
      providesTags: ["MarketStats"],
    }),

    getStatsForListings: builder.query<
      { stats: (ListingStats & { listing_id: string })[] },
      string[]
    >({
      query: (listing_ids) => ({
        body: { listing_ids },
        url: "/api/market/listings/stats",
        method: "POST",
      }),
      transformResponse: unwrapResponse,
      providesTags: (result, error, params) => ["MarketListings" as const],
    }),

    searchMarketListings: builder.query<MarketSearchResult, MarketSearchParams>(
      {
        query: (params) => ({ url: "/api/market/listings", params }),
        transformResponse: unwrapResponse,
        providesTags: (result, error, params) => [
          "MarketListings" as const,
          { type: "MarketListings" as const, id: "SEARCH" },
          {
            type: "MarketListings" as const,
            id: `SEARCH_${params.user_seller || "all"}`,
          },
          {
            type: "MarketListings" as const,
            id: `SEARCH_${params.contractor_seller || "all"}`,
          },
        ],
      },
    ),

    getMarketListing: builder.query<BaseListingType, string>({
      query: (id) => `/api/market/listings/${id}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, listing_id) => [
        "MarketListings",
        {
          type: "MarketListings" as const,
          id: listing_id,
        },
      ],
    }),

    deleteMarketListing: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/market/listings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "MarketListings",
        { type: "MarketListings" as const, id },
      ],
    }),

    recordListingView: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/market/listings/${id}/views`,
        method: "POST",
      }),
    }),

    getListingBids: builder.query<MarketBid[], string>({
      query: (id) => `/api/market/listings/${id}/bids`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, listing_id) => [
        { type: "MarketBids" as const, id: listing_id },
      ],
    }),

    createListingBid: builder.mutation<
      MarketBid,
      { listing_id: string } & CreateBidRequest
    >({
      query: ({ listing_id, ...bid }) => ({
        url: `/api/market/listings/${listing_id}/bids`,
        method: "POST",
        body: bid,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, { listing_id }) => [
        { type: "MarketBids" as const, id: listing_id },
        "MarketListings",
        { type: "MarketListings" as const, id: listing_id },
      ],
    }),

    getUserListings: builder.query<MarketListing[], string>({
      query: (username) => `/api/market/user/${username}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, username) => [
        { type: "UserListings" as const, id: username },
      ],
    }),

    getMyListings: builder.query<
      { listings: UniqueListing[]; total: number },
      any
    >({
      query: (params) => ({ url: "/api/market/mine", params }),
      transformResponse: unwrapResponse,
      providesTags: ["MyListings"],
    }),

    getMarketCategories: builder.query<
      { category: string; subcategory: string }[],
      void
    >({
      query: () => "/api/market/categories",
      transformResponse: unwrapResponse,
      providesTags: ["MarketCategories"],
    }),

    getMarketItemsByCategory: builder.query<any[], string>({
      query: (category) =>
        `/api/market/category/${encodeURIComponent(category)}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, category) => [
        { type: "MarketItems" as const, id: category },
      ],
    }),

    getBuyOrderListings: builder.query<any[], void>({
      query: () => "/api/market/aggregates/buyorders",
      transformResponse: (response: any[]) => response,
      providesTags: ["BuyOrderListings"],
    }),

    refreshMarketListing: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/market/listings/${id}/refresh`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        "MarketListings",
        { type: "MarketListings" as const, id },
      ],
    }),

    purchaseMarketListing: builder.mutation<
      {
        result: string
        offer_id: string
        session_id: string
        discord_invite?: string | null
      },
      {
        items: {
          listing_id: string
          quantity: number
        }[]
        note?: string
        offer?: number | string | null
      }
    >({
      query: (purchaseData) => ({
        url: "/api/market/purchase",
        method: "POST",
        body: purchaseData,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
        "Offers",
        "Offer",
      ],
    }),

    trackMarketListingView: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/market/listings/${id}/views`,
        method: "POST",
      }),
    }),

    getMarketListingOrders: builder.query<
      { data: Order[]; pagination: Pagination },
      {
        listing_id: string
        page?: number
        pageSize?: number
        status?: string[]
        sortBy?: string
        sortOrder?: string
      }
    >({
      query: ({ listing_id, status, ...otherParams }) => {
        const params: Record<string, string | number> = { ...otherParams }
        if (status && status.length > 0) {
          params.status = status.join(",") // comma-separated string
        }

        return {
          url: `/api/market/listing/${listing_id}/orders`,
          params,
        }
      },
      providesTags: (result, error, { listing_id }) => [
        { type: "MarketListingOrders" as const, id: listing_id },
      ],
    }),

    createBuyOrder: builder.mutation<MarketBuyOrderBody, MarketBuyOrderBody>({
      query: (buyOrderData) => ({
        url: "/api/market/buyorder/create",
        method: "POST",
        body: buyOrderData,
      }),
      invalidatesTags: ["BuyOrderListings"],
      transformResponse: unwrapResponse,
    }),

    cancelBuyOrder: builder.mutation<void, string>({
      query: (buyOrderId) => ({
        url: `/api/market/buyorder/${buyOrderId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["BuyOrderListings"],
    }),

    fulfillBuyOrder: builder.mutation<
      Order,
      { buy_order_id: string; contractor_spectrum_id?: string }
    >({
      query: ({ buy_order_id, ...body }) => ({
        url: `/api/market/buyorder/${buy_order_id}/fulfill`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["BuyOrderListings"],
    }),

    getAggregateChart: builder.query<any, string>({
      query: (gameItemId) => `/api/market/aggregate/${gameItemId}/chart`,
      transformResponse: (response: any) => response,
      providesTags: (result, error, gameItemId) => [
        { type: "AggregateChart" as const, id: gameItemId },
      ],
    }),

    getAggregateHistory: builder.query<any, string>({
      query: (gameItemId) => `/api/market/aggregate/${gameItemId}/history`,
      transformResponse: (response: any) => response,
      providesTags: (result, error, gameItemId) => [
        { type: "AggregateHistory" as const, id: gameItemId },
      ],
    }),

    updateAggregateAdmin: builder.mutation<
      any,
      { game_item_id: string; data: any }
    >({
      query: ({ game_item_id, data }) => ({
        url: `/api/market/aggregate/${game_item_id}/update`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { game_item_id }) => [
        { type: "AggregateChart" as const, id: game_item_id },
        { type: "AggregateHistory" as const, id: game_item_id },
      ],
    }),

    updateListingQuantity: builder.mutation<
      void,
      { listing_id: string; quantity: number }
    >({
      query: ({ listing_id, quantity }) => ({
        url: `/api/market/listing/${listing_id}/update_quantity`,
        method: "POST",
        body: { quantity_available: quantity },
      }),
      invalidatesTags: (result, error, { listing_id }) => [
        // Invalidate all market-related caches aggressively
        "MarketListings" as const,
        "MyListings" as const,
        "MarketStats" as const,
        "MarketCategories" as const,
        "BuyOrderListings" as const,
        "AllListings" as const,
        "ContractorListings" as const,
        // Invalidate specific listing
        { type: "MarketListings" as const, id: listing_id },
      ],
    }),
    createMarketListing: builder.mutation<UniqueListing, MarketListingBody>({
      query: (listingData) => ({
        url: "/api/market/listings",
        method: "POST",
        body: listingData,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
        { type: "MarketListings" as const, id: "SEARCH" },
      ],
    }),
    getGameItemByName: builder.query<any, string>({
      query: (name) => `/api/market/item/${name}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, name) => [
        { type: "GameItem" as const, id: name },
      ],
    }),

    uploadListingPhotos: builder.mutation<
      any,
      { listingId: string; photos: File[] }
    >({
      query: ({ listingId, photos }) => {
        const formData = new FormData()
        photos.forEach((photo, index) => {
          formData.append("photos", photo)
        })
        return {
          url: `/api/market/listing/${listingId}/photos`,
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: (result, error, { listingId }) => [
        "MarketListings",
        { type: "MarketListings" as const, id: listingId },
      ],
    }),

    createAggregateListing: builder.mutation<any, any>({
      query: (listingData) => ({
        url: "/api/market/listings",
        method: "POST",
        body: listingData,
      }),
      invalidatesTags: [
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
      ],
    }),

    createMultipleListing: builder.mutation<any, any>({
      query: (listingData) => ({
        url: "/api/market/multiple/create",
        method: "POST",
        body: listingData,
      }),
      invalidatesTags: [
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
      ],
    }),

    getAggregateById: builder.query<any, string | number>({
      query: (gameItemId) => `/api/market/aggregate/${gameItemId}`,
      transformResponse: (response: any) => response,
      providesTags: (result, error, gameItemId) => [
        { type: "Aggregate" as const, id: gameItemId },
      ],
    }),

    updateMultipleListing: builder.mutation<
      any,
      MarketMultipleBody & {
        multiple_id: string
      }
    >({
      query: ({ multiple_id, ...data }) => ({
        url: `/api/market/multiple/${multiple_id}/update`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
      ],
    }),

    // Add missing endpoints that are being exported
    getMultipleById: builder.query<any, string>({
      query: (multipleId) => `/api/market/multiple/${multipleId}`,
      transformResponse: (response: any) => response,
      providesTags: (result, error, multipleId) => [
        { type: "Multiple" as const, id: multipleId },
      ],
    }),

    updateMarketListing: builder.mutation<
      void,
      { listing_id: string; body: Partial<MarketListingBody> }
    >({
      query: ({ listing_id, body }) => ({
        url: `/api/market/listing/${listing_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { listing_id }) => [
        // Invalidate all market-related caches aggressively
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
        // Invalidate specific listing
        { type: "MarketListings" as const, id: listing_id },
      ],
    }),

    acceptBid: builder.mutation<any, { bidId: string }>({
      query: ({ bidId }) => ({
        url: `/api/market/bids/${bidId}/accept`,
        method: "POST",
      }),
      invalidatesTags: [
        "MarketBids",
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
      ],
    }),
  }),
})

export const {
  useGetMarketStatsQuery,
  useSearchMarketListingsQuery,
  useGetMarketListingQuery,
  useGetMyListingsQuery,
  useGetMarketCategoriesQuery,
  useGetMarketItemsByCategoryQuery,
  useGetAggregateByIdQuery,
  useGetMultipleByIdQuery,
  useGetStatsForListingsQuery,

  // Legacy hooks (for backward compatibility during transition)
  useGetBuyOrderListingsQuery,
  useRefreshMarketListingMutation,
  usePurchaseMarketListingMutation,
  useTrackMarketListingViewMutation,
  useGetMarketListingOrdersQuery,
  useCreateBuyOrderMutation,
  useCancelBuyOrderMutation,
  useFulfillBuyOrderMutation,
  useGetAggregateChartQuery,
  useGetAggregateHistoryQuery,
  useUpdateAggregateAdminMutation,
  useUpdateListingQuantityMutation,
  useCreateMarketListingMutation,
  useGetGameItemByNameQuery,
  useUploadListingPhotosMutation,
  useCreateAggregateListingMutation,
  useCreateMultipleListingMutation,
  useUpdateMultipleListingMutation,
  useUpdateMarketListingMutation,
  useCreateListingBidMutation,
  useAcceptBidMutation,
} = marketApi

export const useSearchMarketQuery = useSearchMarketListingsQuery
export const useMarketGetGameItemByNameQuery = useGetGameItemByNameQuery
export const useMarketRefreshListingMutation = useRefreshMarketListingMutation
export const useMarketUpdateListingMutation = useUpdateMarketListingMutation
export const useMarketCancelBuyOrderMutation = useCancelBuyOrderMutation
export const useMarketFulfillBuyOrderMutation = useFulfillBuyOrderMutation
export const useMarketGetAggregateChartByIDQuery = useGetAggregateChartQuery
export const useMarketGetAggregateHistoryByIDQuery = useGetAggregateHistoryQuery
export const useMarketUpdateAggregateAdminMutation =
  useUpdateAggregateAdminMutation
export const useMarketUploadListingPhotosMutation =
  useUploadListingPhotosMutation
export const useMarketCreateAggregateListingMutation =
  useCreateAggregateListingMutation
export const useMarketCreateMultipleListingMutation =
  useCreateMultipleListingMutation
export const useMarketGetMyListingsQuery = useGetMyListingsQuery
export const useMarketUpdateMultipleListingMutation =
  useUpdateMultipleListingMutation
export const useMarketTrackListingViewMutation =
  useTrackMarketListingViewMutation
export const useMarketGetListingOrdersQuery = useGetMarketListingOrdersQuery

// Export validation function for type-safe photo uploads
export { validatePhotoUploadParams }
