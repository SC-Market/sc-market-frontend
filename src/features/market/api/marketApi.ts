import { serviceApi } from "../../../store/service"
import {
  type BaseListingType,
  type ListingStats,
  type MarketListingBody,
  type MarketBuyOrderBody,
  type MarketMultipleBody,
  type UniqueListing,
  type MarketListing,
  type MarketAggregate,
  type MarketMultiple,
  type GameItemDescription,
  type Pagination,
  type MarketSearchResult,
  type MarketSearchParams,
  type MarketStats,
  type MarketBidApi,
  type CreateBidRequest,
} from "../domain/types"
import { unwrapResponse } from "../../../store/api-utils"
import { createOptimisticUpdate } from "../../../util/optimisticUpdates"
import type { Order } from "../../../datatypes/Order"

/** Response from POST /api/market/buyorder/:id/fulfill */
export interface FulfillBuyOrderResponse {
  offer: {
    id: string
    session_id: string
    kind: string
    cost: string
    payment_type: string
    collateral: string
    title: string
    description: string
    timestamp: string
    status: string
    service_id: string | null
    actor_id: string
  }
  session: {
    id: string
    assigned_id: string | null
    customer_id: string
    contractor_id: string
    thread_id: string | null
    status: string
    timestamp: string
  }
  discord_invite: string | null
}

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
      providesTags: () => ["MarketListings" as const],
    }),

    searchMarketListings: builder.query<MarketSearchResult, MarketSearchParams>(
      {
        query: (params) => ({ url: "/api/market/listings", params }),
        transformResponse: unwrapResponse,
        keepUnusedDataFor: 120,
        providesTags: (result, error, params) => [
          "MarketListings" as const,
          { type: "MarketListings" as const, id: "SEARCH" },
          {
            type: "MarketListings" as const,
            id: `SEARCH_${params?.user_seller || "all"}`,
          },
          {
            type: "MarketListings" as const,
            id: `SEARCH_${params?.contractor_seller || "all"}`,
          },
        ],
      },
    ),

    getMarketListing: builder.query<BaseListingType, string>({
      query: (id) => `/api/market/listings/${id}`,
      transformResponse: unwrapResponse,
      keepUnusedDataFor: 300,
      providesTags: (result, error, listing_id) => [
        "MarketListings",
        { type: "MarketListings" as const, id: listing_id },
      ],
    }),

    deleteMarketListing: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/market/listings/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: ReturnType<
              ReturnType<typeof marketApi.util.updateQueryData>
            >[] = []
            const searchPatch = dispatch(
              marketApi.util.updateQueryData(
                "searchMarketListings",
                {} as MarketSearchParams,
                (draft) => {
                  const deletedIndex = draft.listings.findIndex(
                    (l) => l.listing_id === id,
                  )
                  if (deletedIndex !== -1) {
                    draft.listings.splice(deletedIndex, 1)
                    draft.total = Math.max(0, draft.total - 1)
                  }
                },
              ),
            )
            patches.push(searchPatch)
            const myListingsPatch = dispatch(
              marketApi.util.updateQueryData(
                "getMyListings",
                {} as Record<string, unknown>,
                (draft) => {
                  const index = draft.listings.findIndex(
                    (l) => l.listing.listing_id === id,
                  )
                  if (index !== -1) {
                    draft.listings.splice(index, 1)
                    draft.total = Math.max(0, draft.total - 1)
                  }
                },
              ),
            )
            patches.push(myListingsPatch)
            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
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

    getListingBids: builder.query<MarketBidApi[], string>({
      query: (id) => `/api/market/listings/${id}/bids`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, listing_id) => [
        { type: "MarketBids" as const, id: listing_id },
      ],
    }),

    createListingBid: builder.mutation<
      MarketBidApi,
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
      Record<string, unknown>
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

    getMarketItemsByCategory: builder.query<
      { id: string; name: string }[],
      string
    >({
      query: (category) =>
        `/api/market/category/${encodeURIComponent(category)}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, category) => [
        { type: "MarketItems" as const, id: category },
      ],
    }),

    getBuyOrderListings: builder.query<MarketAggregate[], void>({
      query: () => "/api/market/aggregates/buyorders",
      transformResponse: (response: unknown) => (response as MarketAggregate[]),
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
        items: { listing_id: string; quantity: number }[]
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
        const params: Record<string, string | number> = {
          ...otherParams,
        }
        if (status && status.length > 0) {
          params.status = status.join(",")
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
      invalidatesTags: (result, error, body) => [
        "BuyOrderListings",
        "MarketStats",
        "MarketCategories",
        ...(body.game_item_id
          ? [{ type: "Aggregate" as const, id: String(body.game_item_id) }]
          : []),
      ],
      transformResponse: unwrapResponse,
    }),

    cancelBuyOrder: builder.mutation<void, string>({
      query: (buyOrderId) => ({
        url: `/api/market/buyorder/${buyOrderId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: [
        "BuyOrderListings",
        "MarketStats",
        "MarketCategories",
        "Aggregate",
      ],
    }),

    fulfillBuyOrder: builder.mutation<
      FulfillBuyOrderResponse,
      {
        buy_order_id: string
        contractor_spectrum_id?: string
        agreed_price?: number
      }
    >({
      query: ({ buy_order_id, ...body }) => ({
        url: `/api/market/buyorder/${buy_order_id}/fulfill`,
        body,
        method: "POST",
      }),
      transformResponse: (response: unknown): FulfillBuyOrderResponse => {
        const raw = (response as { data?: FulfillBuyOrderResponse }).data ?? response
        return raw as FulfillBuyOrderResponse
      },
      invalidatesTags: [
        "BuyOrderListings",
        "MarketStats",
        "MarketCategories",
        "Aggregate",
        "Orders",
      ],
    }),

    getAggregateChart: builder.query<unknown, string>({
      query: (gameItemId) => `/api/market/aggregate/${gameItemId}/chart`,
      transformResponse: (response: unknown) => response,
      providesTags: (result, error, gameItemId) => [
        { type: "AggregateChart" as const, id: gameItemId },
      ],
    }),

    getAggregateHistory: builder.query<unknown, string>({
      query: (gameItemId) => `/api/market/aggregate/${gameItemId}/history`,
      transformResponse: (response: unknown) => response,
      providesTags: (result, error, gameItemId) => [
        { type: "AggregateHistory" as const, id: gameItemId },
      ],
    }),

    updateAggregateAdmin: builder.mutation<
      unknown,
      { game_item_id: string; data: unknown }
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
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
        "ContractorListings",
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

    getGameItemByName: builder.query<GameItemDescription, string>({
      query: (name) => `/api/market/item/${name}`,
      transformResponse: (r: unknown) => r as GameItemDescription,
      providesTags: (result, error, name) => [
        { type: "GameItem" as const, id: name },
      ],
    }),

    uploadListingPhotos: builder.mutation<
      { photo_urls?: string[] },
      { listingId: string; photos: File[] }
    >({
      query: ({ listingId, photos }) => {
        const formData = new FormData()
        photos.forEach((photo) => formData.append("photos", photo))
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

    createAggregateListing: builder.mutation<unknown, unknown>({
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

    createMultipleListing: builder.mutation<unknown, unknown>({
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

    getAggregateById: builder.query<MarketAggregate, string | number>({
      query: (gameItemId) => `/api/market/aggregate/${gameItemId}`,
      transformResponse: (response: unknown) => response as MarketAggregate,
      providesTags: (result, error, gameItemId) => [
        { type: "Aggregate" as const, id: String(gameItemId) },
      ],
    }),

    updateMultipleListing: builder.mutation<
      unknown,
      MarketMultipleBody & { multiple_id: string }
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

    getMultipleById: builder.query<MarketMultiple, string>({
      query: (multipleId) => `/api/market/multiple/${multipleId}`,
      transformResponse: (response: unknown) => response as MarketMultiple,
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
      async onQueryStarted({ listing_id, body }, { dispatch, queryFulfilled }) {
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: ReturnType<
              ReturnType<typeof marketApi.util.updateQueryData>
            >[] = []
            const listingPatch = dispatch(
              marketApi.util.updateQueryData(
                "getMarketListing",
                listing_id,
                (draft) => {
                  if (body.status !== undefined) {
                    draft.listing.status = body.status as
                      | "active"
                      | "inactive"
                      | "archived"
                  }
                  if (body.quantity_available !== undefined) {
                    draft.listing.quantity_available = body.quantity_available
                  }
                  if (body.price !== undefined) {
                    draft.listing.price = body.price
                  }
                  if (body.title !== undefined) {
                    draft.details.title = body.title
                  }
                  if (body.description !== undefined) {
                    draft.details.description = body.description
                  }
                  if (body.item_type !== undefined) {
                    draft.details.item_type = body.item_type
                  }
                  if (body.item_name !== undefined) {
                    draft.details.item_name = body.item_name
                  }
                  if (body.internal !== undefined) {
                    draft.listing.internal = body.internal
                  }
                  if (
                    body.minimum_bid_increment !== undefined &&
                    "auction_details" in draft &&
                    draft.auction_details
                  ) {
                    draft.auction_details.minimum_bid_increment =
                      body.minimum_bid_increment
                  }
                  if (body.photos !== undefined) {
                    draft.photos = body.photos
                  }
                },
              ),
            )
            patches.push(listingPatch)
            const searchPatch = dispatch(
              marketApi.util.updateQueryData(
                "searchMarketListings",
                {} as MarketSearchParams,
                (draft) => {
                  const listing = draft.listings.find(
                    (l) => l.listing_id === listing_id,
                  )
                  if (listing) {
                    if (body.status !== undefined) {
                      listing.status = body.status as
                        | "active"
                        | "inactive"
                        | "archived"
                    }
                    if (body.quantity_available !== undefined) {
                      listing.quantity_available = body.quantity_available
                    }
                    if (body.price !== undefined) {
                      listing.price = body.price
                    }
                    if (body.title !== undefined) {
                      listing.title = body.title
                    }
                    if (body.item_type !== undefined) {
                      listing.item_type = body.item_type
                    }
                    if (body.item_name !== undefined) {
                      listing.item_name = body.item_name
                    }
                  }
                },
              ),
            )
            patches.push(searchPatch)
            const myListingsPatch = dispatch(
              marketApi.util.updateQueryData(
                "getMyListings",
                {} as Record<string, unknown>,
                (draft) => {
                  const listingItem = draft.listings.find(
                    (l) => l.listing.listing_id === listing_id,
                  )
                  if (listingItem) {
                    if (body.status !== undefined) {
                      listingItem.listing.status = body.status as
                        | "active"
                        | "inactive"
                        | "archived"
                    }
                    if (body.quantity_available !== undefined) {
                      listingItem.listing.quantity_available =
                        body.quantity_available
                    }
                    if (body.price !== undefined) {
                      listingItem.listing.price = body.price
                    }
                    if (body.title !== undefined) {
                      listingItem.details.title = body.title
                    }
                    if (body.description !== undefined) {
                      listingItem.details.description = body.description
                    }
                    if (body.item_type !== undefined) {
                      listingItem.details.item_type = body.item_type
                    }
                    if (body.item_name !== undefined) {
                      listingItem.details.item_name = body.item_name
                    }
                    if (body.internal !== undefined) {
                      listingItem.listing.internal = body.internal
                    }
                    if (
                      body.minimum_bid_increment !== undefined &&
                      "auction_details" in listingItem &&
                      listingItem.auction_details
                    ) {
                      listingItem.auction_details.minimum_bid_increment =
                        body.minimum_bid_increment
                    }
                    if (body.photos !== undefined) {
                      listingItem.photos = body.photos
                    }
                  }
                },
              ),
            )
            patches.push(myListingsPatch)
            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
      invalidatesTags: (result, error, { listing_id }) => [
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
        { type: "MarketListings" as const, id: listing_id },
      ],
    }),

    acceptBid: builder.mutation<unknown, { bidId: string }>({
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
