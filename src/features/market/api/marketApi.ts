import { serviceApi } from "../../../store/service"
import {
  type BaseListingType,
  type MarketListingBody,
  type UniqueListing,
  type MarketAggregate,
  type GameItemDescription,
  type MarketSearchResult,
  type MarketSearchParams,
  type MarketStats,
} from "../domain/types"
import { unwrapResponse } from "../../../store/api-utils"
import { createOptimisticUpdate } from "../../../util/optimisticUpdates"

export const marketApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getMarketStats: builder.query<MarketStats, void>({
      query: () => "/api/market/stats",
      transformResponse: unwrapResponse,
      providesTags: ["MarketStats"],
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

    getBuyOrderListings: builder.query<
      MarketAggregate[],
      Partial<MarketSearchParams> | void
    >({
      query: (params) => ({
        url: "/api/market/aggregates/buyorders",
        params: params || {},
      }),
      transformResponse: (response: unknown) => response as MarketAggregate[],
      providesTags: ["BuyOrderListings"],
    }),

    refreshMarketListing: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/market/listing/${id}/refresh`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        "MarketListings",
        { type: "MarketListings" as const, id },
      ],
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

    updateListingQuantity: builder.mutation<
      { result: string; quantity_available: number; quantity_reserved: number },
      { listing_id: string; quantity: number }
    >({
      query: ({ listing_id, quantity }) => ({
        url: `/api/market/listing/${listing_id}/update_quantity`,
        method: "POST",
        body: { quantity_available: quantity },
      }),
      transformResponse: (response: { data?: { result: string; quantity_available: number; quantity_reserved: number } } | { result: string; quantity_available: number; quantity_reserved: number }) => {
        return "data" in response && response.data ? response.data : response as { result: string; quantity_available: number; quantity_reserved: number }
      },
      invalidatesTags: (result, error, { listing_id }) => [
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
        "ContractorListings",
        "StockLots",
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

    batchUpdateMarketListings: builder.mutation<
      { result: string; updated: number },
      {
        listing_ids: string[]
        status: "active" | "inactive" | "archived"
      }
    >({
      query: (body) => ({
        url: "/api/market/listings/batch-update",
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, { listing_ids }) => [
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
        ...listing_ids.map((id) => ({
          type: "MarketListings" as const,
          id,
        })),
      ],
    }),

    batchUpdateListingQuantities: builder.mutation<
      { result: string; updated: number },
      { updates: { listing_id: string; quantity_available: number }[] }
    >({
      query: (body) => ({
        url: "/api/market/listings/batch-update-quantity",
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, { updates }) => [
        "MarketListings",
        "MyListings",
        "MarketStats",
        "MarketCategories",
        "BuyOrderListings",
        "AllListings",
        "ContractorListings",
        "StockLots",
        ...updates.map((u) => ({
          type: "MarketListings" as const,
          id: u.listing_id,
        })),
      ],
    }),

  }),
})

export const {
  useGetMarketStatsQuery,
  useGetMarketListingQuery,
  useGetMyListingsQuery,
  useGetMarketCategoriesQuery,
  useGetMarketItemsByCategoryQuery,
  useGetBuyOrderListingsQuery,
  useRefreshMarketListingMutation,
  useCancelBuyOrderMutation,
  useUpdateListingQuantityMutation,
  useCreateMarketListingMutation,
  useGetGameItemByNameQuery,
  useUpdateMarketListingMutation,
  useBatchUpdateMarketListingsMutation,
  useBatchUpdateListingQuantitiesMutation,
} = marketApi

export const useMarketGetGameItemByNameQuery = useGetGameItemByNameQuery
export const useMarketRefreshListingMutation = useRefreshMarketListingMutation
export const useMarketUpdateListingMutation = useUpdateMarketListingMutation
