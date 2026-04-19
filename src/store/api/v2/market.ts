import { generatedApiV2 as api } from "../../generatedApiV2"
export const addTagTypes = [
  "Variant Types V2",
  "Stock Lots V2",
  "Orders V2",
  "Offers V2",
  "Listings V2",
  "Health",
  "Game Items V2",
  "Debug V2",
  "Cart V2",
  "Buy Orders V2",
  "Analytics V2",
  "Admin Feature Flags",
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getVariantTypes: build.query<
        GetVariantTypesApiResponse,
        GetVariantTypesApiArg
      >({
        query: () => ({ url: `/variant-types` }),
        providesTags: ["Variant Types V2"],
      }),
      createStockLot: build.mutation<
        CreateStockLotApiResponse,
        CreateStockLotApiArg
      >({
        query: (queryArg) => ({
          url: `/stock-lots`,
          method: "POST",
          body: queryArg.createStockLotRequest,
        }),
        invalidatesTags: ["Stock Lots V2"],
      }),
      getStockLots: build.query<GetStockLotsApiResponse, GetStockLotsApiArg>({
        query: (queryArg) => ({
          url: `/stock-lots`,
          params: {
            listing_id: queryArg.listingId,
            game_item_id: queryArg.gameItemId,
            location_id: queryArg.locationId,
            listed: queryArg.listed,
            variant_id: queryArg.variantId,
            quality_tier_min: queryArg.qualityTierMin,
            quality_tier_max: queryArg.qualityTierMax,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Stock Lots V2"],
      }),
      updateStockLot: build.mutation<
        UpdateStockLotApiResponse,
        UpdateStockLotApiArg
      >({
        query: (queryArg) => ({
          url: `/stock-lots/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateStockLotRequest,
        }),
        invalidatesTags: ["Stock Lots V2"],
      }),
      deleteStockLot: build.mutation<
        DeleteStockLotApiResponse,
        DeleteStockLotApiArg
      >({
        query: (queryArg) => ({
          url: `/stock-lots/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Stock Lots V2"],
      }),
      bulkUpdateStockLots: build.mutation<
        BulkUpdateStockLotsApiResponse,
        BulkUpdateStockLotsApiArg
      >({
        query: (queryArg) => ({
          url: `/stock-lots/bulk-update`,
          method: "POST",
          body: queryArg.bulkUpdateStockLotsRequest,
        }),
        invalidatesTags: ["Stock Lots V2"],
      }),
      createOrder: build.mutation<CreateOrderApiResponse, CreateOrderApiArg>({
        query: (queryArg) => ({
          url: `/orders`,
          method: "POST",
          body: queryArg.createOrderRequest,
        }),
        invalidatesTags: ["Orders V2"],
      }),
      getOrders: build.query<GetOrdersApiResponse, GetOrdersApiArg>({
        query: (queryArg) => ({
          url: `/orders`,
          params: {
            status: queryArg.status,
            role: queryArg.role,
            quality_tier_min: queryArg.qualityTierMin,
            quality_tier_max: queryArg.qualityTierMax,
            page: queryArg.page,
            page_size: queryArg.pageSize,
            sort_by: queryArg.sortBy,
            sort_order: queryArg.sortOrder,
          },
        }),
        providesTags: ["Orders V2"],
      }),
      getOrderDetail: build.query<
        GetOrderDetailApiResponse,
        GetOrderDetailApiArg
      >({
        query: (queryArg) => ({ url: `/orders/${queryArg.orderId}` }),
        providesTags: ["Orders V2"],
      }),
      getOfferSession: build.query<
        GetOfferSessionApiResponse,
        GetOfferSessionApiArg
      >({
        query: (queryArg) => ({ url: `/offers/${queryArg.sessionId}` }),
        providesTags: ["Offers V2"],
      }),
      searchOffers: build.query<SearchOffersApiResponse, SearchOffersApiArg>({
        query: (queryArg) => ({
          url: `/offers/search`,
          params: {
            role: queryArg.role,
            status: queryArg.status,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Offers V2"],
      }),
      createListing: build.mutation<
        CreateListingApiResponse,
        CreateListingApiArg
      >({
        query: (queryArg) => ({
          url: `/listings`,
          method: "POST",
          body: queryArg.createListingRequest,
        }),
        invalidatesTags: ["Listings V2"],
      }),
      searchListings: build.query<
        SearchListingsApiResponse,
        SearchListingsApiArg
      >({
        query: (queryArg) => ({
          url: `/listings/search`,
          params: {
            text: queryArg.text,
            game_item_id: queryArg.gameItemId,
            quality_tier_min: queryArg.qualityTierMin,
            quality_tier_max: queryArg.qualityTierMax,
            price_min: queryArg.priceMin,
            price_max: queryArg.priceMax,
            page: queryArg.page,
            page_size: queryArg.pageSize,
            item_type: queryArg.itemType,
            quantity_min: queryArg.quantityMin,
            status: queryArg.status,
            sort_by: queryArg.sortBy,
            sort_order: queryArg.sortOrder,
            language_codes: queryArg.languageCodes,
            listing_type: queryArg.listingType,
            seller_id: queryArg.sellerId,
            contractor_id: queryArg.contractorId,
          },
        }),
        providesTags: ["Listings V2"],
      }),
      getMyListings: build.query<GetMyListingsApiResponse, GetMyListingsApiArg>(
        {
          query: (queryArg) => ({
            url: `/listings/mine`,
            params: {
              status: queryArg.status,
              page: queryArg.page,
              page_size: queryArg.pageSize,
              sort_by: queryArg.sortBy,
              sort_order: queryArg.sortOrder,
            },
          }),
          providesTags: ["Listings V2"],
        },
      ),
      getListingDetail: build.query<
        GetListingDetailApiResponse,
        GetListingDetailApiArg
      >({
        query: (queryArg) => ({ url: `/listings/${queryArg.id}` }),
        providesTags: ["Listings V2"],
      }),
      updateListing: build.mutation<
        UpdateListingApiResponse,
        UpdateListingApiArg
      >({
        query: (queryArg) => ({
          url: `/listings/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateListingRequest,
        }),
        invalidatesTags: ["Listings V2"],
      }),
      deleteListing: build.mutation<
        DeleteListingApiResponse,
        DeleteListingApiArg
      >({
        query: (queryArg) => ({
          url: `/listings/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Listings V2"],
      }),
      refreshListing: build.mutation<
        RefreshListingApiResponse,
        RefreshListingApiArg
      >({
        query: (queryArg) => ({
          url: `/listings/${queryArg.id}/refresh`,
          method: "POST",
        }),
        invalidatesTags: ["Listings V2"],
      }),
      trackView: build.mutation<TrackViewApiResponse, TrackViewApiArg>({
        query: (queryArg) => ({
          url: `/listings/${queryArg.id}/views`,
          method: "POST",
        }),
        invalidatesTags: ["Listings V2"],
      }),
      uploadPhotos: build.mutation<UploadPhotosApiResponse, UploadPhotosApiArg>(
        {
          query: (queryArg) => ({
            url: `/listings/${queryArg.id}/photos`,
            method: "POST",
          }),
          invalidatesTags: ["Listings V2"],
        },
      ),
      getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
        query: () => ({ url: `/health` }),
        providesTags: ["Health"],
      }),
      searchGameItems: build.query<
        SearchGameItemsApiResponse,
        SearchGameItemsApiArg
      >({
        query: (queryArg) => ({
          url: `/game-items/search`,
          params: {
            query: queryArg.query,
          },
        }),
        providesTags: ["Game Items V2"],
      }),
      getCategories: build.query<GetCategoriesApiResponse, GetCategoriesApiArg>(
        {
          query: () => ({ url: `/game-items/categories` }),
          providesTags: ["Game Items V2"],
        },
      ),
      getListings: build.query<GetListingsApiResponse, GetListingsApiArg>({
        query: (queryArg) => ({
          url: `/game-items/${queryArg.id}/listings`,
          params: {
            quality_tier: queryArg.qualityTier,
            sort_by: queryArg.sortBy,
            sort_order: queryArg.sortOrder,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Items V2"],
      }),
      getFeatureFlag: build.query<
        GetFeatureFlagApiResponse,
        GetFeatureFlagApiArg
      >({
        query: () => ({ url: `/debug/feature-flag` }),
        providesTags: ["Debug V2"],
      }),
      setFeatureFlag: build.mutation<
        SetFeatureFlagApiResponse,
        SetFeatureFlagApiArg
      >({
        query: (queryArg) => ({
          url: `/debug/feature-flag`,
          method: "POST",
          body: queryArg.setFeatureFlagRequest,
        }),
        invalidatesTags: ["Debug V2"],
      }),
      getCart: build.query<GetCartApiResponse, GetCartApiArg>({
        query: () => ({ url: `/cart` }),
        providesTags: ["Cart V2"],
      }),
      addToCart: build.mutation<AddToCartApiResponse, AddToCartApiArg>({
        query: (queryArg) => ({
          url: `/cart/add`,
          method: "POST",
          body: queryArg.addToCartRequest,
        }),
        invalidatesTags: ["Cart V2"],
      }),
      updateCartItem: build.mutation<
        UpdateCartItemApiResponse,
        UpdateCartItemApiArg
      >({
        query: (queryArg) => ({
          url: `/cart/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateCartItemRequest,
        }),
        invalidatesTags: ["Cart V2"],
      }),
      removeCartItem: build.mutation<
        RemoveCartItemApiResponse,
        RemoveCartItemApiArg
      >({
        query: (queryArg) => ({
          url: `/cart/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Cart V2"],
      }),
      checkoutCart: build.mutation<CheckoutCartApiResponse, CheckoutCartApiArg>(
        {
          query: (queryArg) => ({
            url: `/cart/checkout`,
            method: "POST",
            body: queryArg.checkoutCartRequest,
          }),
          invalidatesTags: ["Cart V2"],
        },
      ),
      createPurchase: build.mutation<
        CreatePurchaseApiResponse,
        CreatePurchaseApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders`,
          method: "POST",
          body: queryArg.createBuyOrderRequest,
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      createStandingBuyOrder: build.mutation<
        CreateStandingBuyOrderApiResponse,
        CreateStandingBuyOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/standing`,
          method: "POST",
          body: queryArg.createStandingBuyOrderRequest,
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      searchBuyOrders: build.query<
        SearchBuyOrdersApiResponse,
        SearchBuyOrdersApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/search`,
          params: {
            game_item_id: queryArg.gameItemId,
            quality_tier_min: queryArg.qualityTierMin,
            quality_tier_max: queryArg.qualityTierMax,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Buy Orders V2"],
      }),
      getMyBuyOrders: build.query<
        GetMyBuyOrdersApiResponse,
        GetMyBuyOrdersApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/mine`,
          params: {
            status: queryArg.status,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Buy Orders V2"],
      }),
      updateBuyOrder: build.mutation<
        UpdateBuyOrderApiResponse,
        UpdateBuyOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateStandingBuyOrderRequest,
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      cancelBuyOrder: build.mutation<
        CancelBuyOrderApiResponse,
        CancelBuyOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      fulfillBuyOrder: build.mutation<
        FulfillBuyOrderApiResponse,
        FulfillBuyOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/${queryArg.id}/fulfill`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      getPriceHistory: build.query<
        GetPriceHistoryApiResponse,
        GetPriceHistoryApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/price-history`,
          params: {
            game_item_id: queryArg.gameItemId,
            quality_tier: queryArg.qualityTier,
            start_date: queryArg.startDate,
            end_date: queryArg.endDate,
            interval: queryArg.interval,
          },
        }),
        providesTags: ["Analytics V2"],
      }),
      getQualityDistribution: build.query<
        GetQualityDistributionApiResponse,
        GetQualityDistributionApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/quality-distribution`,
          params: {
            game_item_id: queryArg.gameItemId,
            start_date: queryArg.startDate,
            end_date: queryArg.endDate,
          },
        }),
        providesTags: ["Analytics V2"],
      }),
      getSellerStats: build.query<
        GetSellerStatsApiResponse,
        GetSellerStatsApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/seller-stats`,
          params: {
            seller_id: queryArg.sellerId,
          },
        }),
        providesTags: ["Analytics V2"],
      }),
      getConfig: build.query<GetConfigApiResponse, GetConfigApiArg>({
        query: () => ({ url: `/admin/feature-flags/config` }),
        providesTags: ["Admin Feature Flags"],
      }),
      updateConfig: build.mutation<UpdateConfigApiResponse, UpdateConfigApiArg>(
        {
          query: (queryArg) => ({
            url: `/admin/feature-flags/config`,
            method: "PUT",
            body: queryArg.updateConfigRequest,
          }),
          invalidatesTags: ["Admin Feature Flags"],
        },
      ),
      getStats: build.query<GetStatsApiResponse, GetStatsApiArg>({
        query: () => ({ url: `/admin/feature-flags/stats` }),
        providesTags: ["Admin Feature Flags"],
      }),
      getUserOverrides: build.query<
        GetUserOverridesApiResponse,
        GetUserOverridesApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/feature-flags/overrides`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Admin Feature Flags"],
      }),
      setUserOverride: build.mutation<
        SetUserOverrideApiResponse,
        SetUserOverrideApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/feature-flags/overrides`,
          method: "POST",
          body: queryArg.setUserOverrideRequest,
        }),
        invalidatesTags: ["Admin Feature Flags"],
      }),
      removeUserOverride: build.mutation<
        RemoveUserOverrideApiResponse,
        RemoveUserOverrideApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/feature-flags/overrides/${queryArg.userId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Admin Feature Flags"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as marketV2Api }
export type GetVariantTypesApiResponse =
  /** status 200 All variant type definitions with validation rules */ GetVariantTypesResponse
export type GetVariantTypesApiArg = void
export type CreateStockLotApiResponse =
  /** status 200 Created stock lot */ UpdateStockLotResponse
export type CreateStockLotApiArg = {
  /** Create request with item_id, quantity, variant_attributes */
  createStockLotRequest: CreateStockLotRequest
}
export type GetStockLotsApiResponse =
  /** status 200 Stock lots with pagination metadata */ GetStockLotsResponse
export type GetStockLotsApiArg = {
  /** Filter by listing UUID */
  listingId?: string
  /** Filter by game item UUID */
  gameItemId?: string
  /** Filter by location UUID */
  locationId?: string
  /** Filter by listed status */
  listed?: boolean
  /** Filter by variant UUID */
  variantId?: string
  /** Minimum quality tier (1-5) */
  qualityTierMin?: number
  /** Maximum quality tier (1-5) */
  qualityTierMax?: number
  /** Page number for pagination (default: 1) */
  page?: number
  /** Number of results per page (default: 20, max: 100) */
  pageSize?: number
}
export type UpdateStockLotApiResponse =
  /** status 200 Updated stock lot */ UpdateStockLotResponse
export type UpdateStockLotApiArg = {
  /** Stock lot UUID */
  id: string
  /** Update request with optional fields */
  updateStockLotRequest: UpdateStockLotRequest
}
export type DeleteStockLotApiResponse = /** status 200 Ok */ {
  message: string
}
export type DeleteStockLotApiArg = {
  /** Stock lot UUID */
  id: string
}
export type BulkUpdateStockLotsApiResponse =
  /** status 200 Bulk update results with success/failure counts */ BulkUpdateStockLotsResponse
export type BulkUpdateStockLotsApiArg = {
  /** Bulk update request with array of lot updates */
  bulkUpdateStockLotsRequest: BulkUpdateStockLotsRequest
}
export type CreateOrderApiResponse =
  /** status 200 Created order with order_id and item details */ CreateOrderResponse
export type CreateOrderApiArg = {
  /** Order creation request with items array */
  createOrderRequest: CreateOrderRequest
}
export type GetOrdersApiResponse =
  /** status 200 Orders list with pagination metadata */ GetOrdersResponse
export type GetOrdersApiArg = {
  status?: "pending" | "completed" | "cancelled"
  role?: "buyer" | "seller"
  qualityTierMin?: number
  qualityTierMax?: number
  page?: number
  pageSize?: number
  sortBy?: "created_at" | "updated_at" | "total_price"
  sortOrder?: "asc" | "desc"
}
export type GetOrderDetailApiResponse =
  /** status 200 Order details with buyer/seller info and variant details */ GetOrderDetailResponse
export type GetOrderDetailApiArg = {
  /** UUID of the order to retrieve */
  orderId: string
}
export type GetOfferSessionApiResponse =
  /** status 200 Ok */ GetOfferSessionV2Response
export type GetOfferSessionApiArg = {
  sessionId: string
}
export type SearchOffersApiResponse =
  /** status 200 Ok */ SearchOffersV2Response
export type SearchOffersApiArg = {
  role?: "customer" | "seller"
  status?: "active" | "closed"
  page?: number
  pageSize?: number
}
export type CreateListingApiResponse =
  /** status 200 Created listing with listing_id */ CreateListingResponse
export type CreateListingApiArg = {
  /** Listing creation request with title, description, pricing, and lots */
  createListingRequest: CreateListingRequest
}
export type SearchListingsApiResponse =
  /** status 200 Search results with pagination metadata */ SearchListingsResponse
export type SearchListingsApiArg = {
  /** Full-text search query */
  text?: string
  /** Filter by specific game item UUID */
  gameItemId?: string
  /** Minimum quality tier (1-5) */
  qualityTierMin?: number
  /** Maximum quality tier (1-5) */
  qualityTierMax?: number
  /** Minimum price filter */
  priceMin?: number
  /** Maximum price filter */
  priceMax?: number
  /** Page number for pagination (default: 1) */
  page?: number
  /** Number of results per page (default: 20, max: 100) */
  pageSize?: number
  itemType?: string
  quantityMin?: number
  status?: "active" | "sold" | "expired" | "cancelled"
  /** Sort field (default: created_at) */
  sortBy?:
    | "created_at"
    | "updated_at"
    | "price"
    | "quality"
    | "seller_rating"
    | "quantity"
  /** Sort order (default: desc) */
  sortOrder?: "asc" | "desc"
  languageCodes?: string
  listingType?: "single" | "bundle" | "bulk"
  sellerId?: string
  contractorId?: string
}
export type GetMyListingsApiResponse =
  /** status 200 Updated listing with variant breakdown */ GetMyListingsResponse
export type GetMyListingsApiArg = {
  /** Filter by listing status */
  status?: "active" | "sold" | "expired" | "cancelled"
  /** Page number for pagination (default: 1) */
  page?: number
  /** Number of results per page (default: 20, max: 100) */
  pageSize?: number
  /** Sort field (default: created_at) */
  sortBy?: "created_at" | "updated_at" | "price" | "quantity"
  /** Sort order (default: desc) */
  sortOrder?: "asc" | "desc"
}
export type GetListingDetailApiResponse =
  /** status 200 Complete listing detail with variant breakdown */ GetListingDetailResponse
export type GetListingDetailApiArg = {
  /** Listing UUID */
  id: string
}
export type UpdateListingApiResponse =
  /** status 200 Search results with pagination metadata */ GetListingDetailResponse
export type UpdateListingApiArg = {
  id: string
  updateListingRequest: UpdateListingRequest
}
export type DeleteListingApiResponse = /** status 200 Success message */ {
  message: string
}
export type DeleteListingApiArg = {
  /** Listing UUID */
  id: string
}
export type RefreshListingApiResponse =
  /** status 200 Success message with next refresh time */ {
    next_refresh_at: string
    message: string
  }
export type RefreshListingApiArg = {
  /** Listing UUID */
  id: string
}
export type TrackViewApiResponse = /** status 200 Ok */ {
  views: number
}
export type TrackViewApiArg = {
  /** Listing UUID */
  id: string
}
export type UploadPhotosApiResponse = /** status 200 Ok */ {
  photos: {
    url: string
    resource_id: string
  }[]
}
export type UploadPhotosApiArg = {
  /** Listing UUID */
  id: string
}
export type GetHealthApiResponse = /** status 200 Ok */ HealthResponse
export type GetHealthApiArg = void
export type SearchGameItemsApiResponse =
  /** status 200 Ok */ GameItemSearchResult[]
export type SearchGameItemsApiArg = {
  /** Search text */
  query?: string
}
export type GetCategoriesApiResponse = /** status 200 Ok */ GameItemCategory[]
export type GetCategoriesApiArg = void
export type GetListingsApiResponse =
  /** status 200 Game item listings with quality distribution */ GetGameItemListingsResponse
export type GetListingsApiArg = {
  /** Game item UUID (required) */
  id: string
  /** Optional quality tier filter (1-5) */
  qualityTier?: number
  /** Sort field (default: price) */
  sortBy?: "price" | "quality" | "quantity" | "seller_rating"
  /** Sort order (default: asc) */
  sortOrder?: "asc" | "desc"
  /** Page number for pagination (default: 1) */
  page?: number
  /** Number of results per page (default: 20, max: 100) */
  pageSize?: number
}
export type GetFeatureFlagApiResponse =
  /** status 200 Current feature flag setting */ GetFeatureFlagResponse
export type GetFeatureFlagApiArg = void
export type SetFeatureFlagApiResponse =
  /** status 200 Updated feature flag setting */ SetFeatureFlagResponse
export type SetFeatureFlagApiArg = {
  /** Feature flag setting request */
  setFeatureFlagRequest: SetFeatureFlagRequest
}
export type GetCartApiResponse =
  /** status 200 Cart contents with variant details and availability */ GetCartResponse
export type GetCartApiArg = void
export type AddToCartApiResponse =
  /** status 200 Cart item ID and success message */ AddToCartResponse
export type AddToCartApiArg = {
  /** Add to cart request with listing, variant, and quantity */
  addToCartRequest: AddToCartRequest
}
export type UpdateCartItemApiResponse = /** status 200 Success message */ {
  message: string
}
export type UpdateCartItemApiArg = {
  /** Cart item UUID */
  id: string
  /** Update request with optional quantity and variant_id */
  updateCartItemRequest: UpdateCartItemRequest
}
export type RemoveCartItemApiResponse = /** status 200 Success message */ {
  message: string
}
export type RemoveCartItemApiArg = {
  /** Cart item UUID */
  id: string
}
export type CheckoutCartApiResponse =
  /** status 200 Order ID and purchase summary */ CheckoutCartResponse
export type CheckoutCartApiArg = {
  /** Checkout request with optional price change confirmation */
  checkoutCartRequest: CheckoutCartRequest
}
export type CreatePurchaseApiResponse =
  /** status 200 Created order with order_id and purchase details */ CreateBuyOrderResponse
export type CreatePurchaseApiArg = {
  /** Purchase request with listing, variant, and quantity */
  createBuyOrderRequest: CreateBuyOrderRequest
}
export type CreateStandingBuyOrderApiResponse =
  /** status 200 Ok */ StandingBuyOrder
export type CreateStandingBuyOrderApiArg = {
  createStandingBuyOrderRequest: CreateStandingBuyOrderRequest
}
export type SearchBuyOrdersApiResponse =
  /** status 200 Ok */ SearchBuyOrdersResponse
export type SearchBuyOrdersApiArg = {
  gameItemId?: string
  qualityTierMin?: number
  qualityTierMax?: number
  page?: number
  pageSize?: number
}
export type GetMyBuyOrdersApiResponse =
  /** status 200 Ok */ SearchBuyOrdersResponse
export type GetMyBuyOrdersApiArg = {
  status?: "active" | "fulfilled" | "cancelled" | "expired"
  page?: number
  pageSize?: number
}
export type UpdateBuyOrderApiResponse = /** status 200 Ok */ StandingBuyOrder
export type UpdateBuyOrderApiArg = {
  id: string
  updateStandingBuyOrderRequest: UpdateStandingBuyOrderRequest
}
export type CancelBuyOrderApiResponse = /** status 200 Ok */ {
  message: string
}
export type CancelBuyOrderApiArg = {
  id: string
}
export type FulfillBuyOrderApiResponse =
  /** status 200 Ok */ CreateBuyOrderResponse
export type FulfillBuyOrderApiArg = {
  id: string
  body: {
    variant_id: string
    listing_id: string
  }
}
export type GetPriceHistoryApiResponse =
  /** status 200 Price history time-series data */ GetPriceHistoryResponse
export type GetPriceHistoryApiArg = {
  /** Game item UUID (required) */
  gameItemId: string
  /** Optional quality tier filter (1-5) */
  qualityTier?: number
  /** Optional start date (ISO 8601 format, defaults to 30 days ago) */
  startDate?: string
  /** Optional end date (ISO 8601 format, defaults to now) */
  endDate?: string
  /** Time interval for aggregation (default: 'day') */
  interval?: "hour" | "day" | "week" | "month"
}
export type GetQualityDistributionApiResponse =
  /** status 200 Quality tier distribution histogram data */ GetQualityDistributionResponse
export type GetQualityDistributionApiArg = {
  /** Game item UUID (required) */
  gameItemId: string
  /** Optional start date (ISO 8601 format) */
  startDate?: string
  /** Optional end date (ISO 8601 format) */
  endDate?: string
}
export type GetSellerStatsApiResponse =
  /** status 200 Seller analytics with sales and inventory breakdown */ GetSellerStatsResponse
export type GetSellerStatsApiArg = {
  /** Optional seller ID (defaults to current user) */
  sellerId?: string
}
export type GetConfigApiResponse = /** status 200 Ok */ FeatureFlagConfig
export type GetConfigApiArg = void
export type UpdateConfigApiResponse = /** status 200 Ok */ FeatureFlagConfig
export type UpdateConfigApiArg = {
  updateConfigRequest: UpdateConfigRequest
}
export type GetStatsApiResponse = /** status 200 Ok */ FeatureFlagStats
export type GetStatsApiArg = void
export type GetUserOverridesApiResponse =
  /** status 200 Ok */ UserOverridesResponse
export type GetUserOverridesApiArg = {
  page?: number
  pageSize?: number
}
export type SetUserOverrideApiResponse = /** status 200 Ok */ {
  message: string
}
export type SetUserOverrideApiArg = {
  setUserOverrideRequest: SetUserOverrideRequest
}
export type RemoveUserOverrideApiResponse = /** status 200 Ok */ {
  message: string
}
export type RemoveUserOverrideApiArg = {
  userId: string
}
export type VariantType = {
  /** Unique identifier for the variant type */
  variant_type_id: string
  /** Internal name (e.g., 'quality_tier', 'quality_value') */
  name: string
  /** Display name for UI (e.g., 'Quality Tier', 'Quality Value') */
  display_name: string
  /** Description of the variant type */
  description?: string
  /** Whether this attribute affects pricing */
  affects_pricing: boolean
  /** Whether this attribute is searchable */
  searchable: boolean
  /** Whether this attribute is filterable */
  filterable: boolean
  /** Data type of the value ('integer', 'decimal', 'string', 'enum') */
  value_type: "integer" | "decimal" | "string" | "enum"
  /** Minimum allowed value (for numeric types) */
  min_value?: number
  /** Maximum allowed value (for numeric types) */
  max_value?: number
  /** Allowed values (for enum types) */
  allowed_values?: string[]
  /** Display order for UI presentation */
  display_order: number
  /** Optional icon identifier */
  icon?: string
  /** Creation timestamp */
  created_at: string
}
export type GetVariantTypesResponse = {
  /** Array of variant type definitions */
  variant_types: VariantType[]
  /** Total count of variant types */
  total: number
}
export type VariantAttributes = {
  /** Quality tier from 1 (lowest) to 5 (highest) */
  quality_tier?: number
  /** Precise quality percentage from 0 to 100 */
  quality_value?: number
  /** How the item was obtained */
  crafted_source?: "crafted" | "store" | "looted" | "unknown"
  /** Blueprint quality tier for craftable items (1-5) */
  blueprint_tier?: number
}
export type StockLotVariant = {
  /** Variant UUID */
  variant_id: string
  /** Variant attributes */
  attributes: VariantAttributes
  /** Display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name (e.g., "T5 Crafted") */
  short_name: string
}
export type LocationInfo = {
  /** Location UUID */
  location_id: string
  /** Location name */
  name: string
  /** Whether this is a preset location (vs custom) */
  is_preset: boolean
}
export type OwnerInfo = {
  /** User UUID */
  user_id: string
  /** Username */
  username: string
  /** Display name */
  display_name?: string
  /** Avatar URL */
  avatar_url?: string
}
export type StockLotDetail = {
  /** Stock lot UUID */
  lot_id: string
  /** Item UUID this lot belongs to */
  item_id: string
  /** Variant information */
  variant: StockLotVariant
  /** Total quantity in this lot */
  quantity_total: number
  /** Location information (null if unspecified) */
  location: LocationInfo | null
  /** Owner information (null if unassigned) */
  owner: OwnerInfo | null
  /** Whether this lot is listed for sale */
  listed: boolean
  /** Optional notes about this lot */
  notes: string | null
  /** User who crafted this item (if applicable) */
  crafted_by?: string
  /** Timestamp when item was crafted (if applicable) */
  crafted_at?: string
  /** ISO 8601 timestamp when lot was created */
  created_at: string
  /** ISO 8601 timestamp when lot was last updated */
  updated_at: string
}
export type UpdateStockLotResponse = {
  /** Updated stock lot */
  lot: StockLotDetail
}
export type CreateStockLotRequest = {
  /** Listing item UUID */
  item_id: string
  /** Quantity (must be > 0) */
  quantity: number
  /** Variant attributes for this lot */
  variant_attributes: VariantAttributes
  /** Optional location UUID */
  location_id?: string
  /** Whether to list for sale (default: true) */
  listed?: boolean
  /** Optional notes */
  notes?: string
}
export type GetStockLotsResponse = {
  /** Array of stock lots */
  lots: StockLotDetail[]
  /** Total number of lots matching filters */
  total: number
  /** Current page number */
  page: number
  /** Number of results per page */
  page_size: number
}
export type UpdateStockLotRequest = {
  /** New total quantity (optional) */
  quantity_total?: number
  /** New listed status (optional) */
  listed?: boolean
  /** New location UUID (optional, null to clear) */
  location_id?: string | null
  /** New notes (optional, null to clear) */
  notes?: string | null
}
export type BulkUpdateResult = {
  /** Stock lot UUID */
  lot_id: string
  /** Whether the update succeeded */
  success: boolean
  /** Error message if update failed */
  error?: string
}
export type BulkUpdateStockLotsResponse = {
  /** Array of update results */
  results: BulkUpdateResult[]
  /** Number of successful updates */
  success_count: number
  /** Number of failed updates */
  failure_count: number
}
export type BulkLotUpdate = {
  /** Stock lot UUID */
  lot_id: string
  /** New total quantity (optional) */
  quantity_total?: number
  /** New listed status (optional) */
  listed?: boolean
  /** New location UUID (optional) */
  location_id?: string | null
}
export type BulkUpdateStockLotsRequest = {
  /** Array of lot updates */
  updates: BulkLotUpdate[]
}
export type OrderVariantDetail = {
  /** UUID of the variant */
  variant_id: string
  /** Variant attributes (quality_tier, quality_value, crafted_source, etc) */
  attributes: VariantAttributes
  /** Human-readable display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name for compact display (e.g., "T5 Crafted") */
  short_name: string
}
export type OrderItemDetail = {
  /** UUID of the order item */
  order_item_id: string
  /** UUID of the listing */
  listing_id: string
  /** UUID of the listing item */
  item_id: string
  /** Variant details with quality attributes */
  variant: OrderVariantDetail
  /** Quantity purchased */
  quantity: number
  /** Price per unit at time of purchase (snapshot) */
  price_per_unit: number
  /** Subtotal for this item (quantity * price_per_unit) */
  subtotal: number
}
export type CreateOrderResponse = {
  /** UUID of the created order */
  order_id: string
  /** UUID of the buyer */
  buyer_id: string
  /** UUID of the seller */
  seller_id: string
  /** Total price in aUEC (atomic units) */
  total_price: number
  /** Order status */
  status: string
  /** ISO 8601 timestamp of order creation */
  created_at: string
  /** Array of order items with variant details */
  items: OrderItemDetail[]
  /** Stock allocation result summary */
  allocation_result?: {
    total_allocated: number
    total_requested: number
    has_partial_allocations: boolean
  }
}
export type OrderItemInput = {
  /** UUID of the listing */
  listing_id: string
  /** UUID of the specific variant to purchase */
  variant_id: string
  /** Quantity to purchase (must be > 0) */
  quantity: number
}
export type CreateOrderRequest = {
  /** Array of items to purchase */
  items: OrderItemInput[]
}
export type OrderPreview = {
  /** UUID of the order */
  order_id: string
  /** Order title (from first listing) */
  title: string
  /** Total price in aUEC */
  total_price: number
  /** Order status */
  status: string
  /** ISO 8601 timestamp of order creation */
  created_at: string
  /** ISO 8601 timestamp of last update */
  updated_at: string
  /** Buyer username */
  buyer_username: string
  /** Seller username */
  seller_username: string
  /** Number of items in order */
  item_count: number
  /** Minimum quality tier across all items */
  quality_tier_min?: number
  /** Maximum quality tier across all items */
  quality_tier_max?: number
  /** Buyer avatar URL */
  buyer_avatar?: string | null
  /** Seller avatar URL */
  seller_avatar?: string | null
}
export type GetOrdersResponse = {
  /** Array of order previews */
  orders: OrderPreview[]
  /** Total number of orders matching filters */
  total: number
  /** Current page number */
  page: number
  /** Number of results per page */
  page_size: number
}
export type OrderVariantItem = {
  order_item_id: string
  variant_id: string
  quantity: number
  price_per_unit: number
  attributes: VariantAttributes
  display_name: string
  short_name: string
}
export type OrderMarketListingV2 = {
  listing_id: string
  quantity: number
  title: string
  price: number
  /** V2 variant items for this listing (empty if no V2 data) */
  v2_variants: OrderVariantItem[]
}
export type GetOrderDetailResponse = {
  /** UUID of the order */
  order_id: string
  /** Buyer information */
  buyer: {
    avatar: string | null
    display_name: string
    username: string
    user_id: string
  }
  /** Seller information */
  seller: {
    avatar: string | null
    display_name: string
    username: string
    user_id: string
  }
  /** Total price in aUEC (atomic units) */
  total_price: number
  /** Order status */
  status: string
  /** Order kind (Delivery, Escort, etc.) */
  kind: string
  /** Order title */
  title: string
  /** Order description */
  description: string
  /** Payment type */
  payment_type: string
  /** Offer session ID (if created from offer) */
  offer_session_id?: string | null
  /** ISO 8601 timestamp of order creation */
  created_at: string
  /** ISO 8601 timestamp of last update */
  updated_at: string
  /** V1 market listings with V2 variant enrichment */
  market_listings: OrderMarketListingV2[]
  /** V2-only order items (from order_market_items_v2) */
  items: OrderItemDetail[]
}
export type UserSummary = {
  user_id: string
  username: string
  display_name?: string
  avatar?: string | null
}
export type OrgSummary = {
  contractor_id: string
  spectrum_id: string
  name: string
  avatar?: string | null
}
export type OfferVariantItem = {
  variant_id: string
  quantity: number
  price_per_unit: number
  attributes: VariantAttributes
  display_name: string
  short_name: string
}
export type OfferMarketListingV2 = {
  listing_id: string
  quantity: number
  title: string
  price: number
  /** V2 variant items for this listing (empty if no V2 data) */
  v2_variants: OfferVariantItem[]
}
export type OfferV2 = {
  offer_id: string
  kind: string
  cost: number
  title: string
  description: string
  payment_type: string
  status: string
  created_at: string
  actor_id: string
  /** V1 market listings (always present) */
  market_listings: OfferMarketListingV2[]
  service?: {
    title: string
    service_id: string
  } | null
}
export type GetOfferSessionV2Response = {
  session_id: string
  status: string
  created_at: string
  order_id?: string
  discord_invite?: string | null
  customer: UserSummary
  seller: (UserSummary | OrgSummary) | null
  offers: OfferV2[]
}
export type OfferSessionV2 = {
  session_id: string
  status: string
  created_at: string
  order_id?: string
  discord_invite?: string | null
  customer: UserSummary
  seller: (UserSummary | OrgSummary) | null
  offers: OfferV2[]
}
export type SearchOffersV2Response = {
  offers: OfferSessionV2[]
  total: number
  page: number
  page_size: number
}
export type CreateListingResponse = {
  listing_id: string
  seller_id: string
  seller_type: "user" | "contractor"
  title: string
  description: string
  status: "active" | "sold" | "expired" | "cancelled"
  created_at: string
  updated_at: string
}
export type StockLotInput = {
  /** Quantity of items in this lot (must be > 0) */
  quantity: number
  /** Variant attributes for this lot */
  variant_attributes: VariantAttributes
  /** Optional location ID where items are stored */
  location_id?: string
  /** Price for this variant (required if pricing_mode is 'per_variant') */
  price?: number
}
export type BulkDiscountTier = {
  /** Minimum quantity to qualify for this discount */
  min_quantity: number
  /** Discount percentage (0-100) */
  discount_percent: number
}
export type CreateListingRequest = {
  /** Listing title (max 500 chars) */
  title: string
  /** Listing description (markdown supported) */
  description: string
  /** Game item UUID being sold */
  game_item_id: string
  /** Pricing strategy: unified price for all variants or per-variant pricing */
  pricing_mode: "unified" | "per_variant"
  /** Base price for all variants (required if pricing_mode is 'unified') */
  base_price?: number
  /** Array of stock lots with variant attributes */
  lots: StockLotInput[]
  /** Optional array of image resource UUIDs to attach as photos */
  photo_resource_ids?: string[]
  /** Pickup method: how the buyer receives the item */
  pickup_method?: "delivery" | "pickup" | "any"
  /** Optional bulk discount tiers sorted by min_quantity ascending */
  bulk_discount_tiers?: BulkDiscountTier[]
}
export type ListingSearchResult = {
  /** Listing UUID */
  listing_id: string
  /** Listing title */
  title: string
  /** Seller username or contractor name */
  seller_name: string
  /** Seller rating (0-5) */
  seller_rating: number
  /** Minimum price across all variants */
  price_min: number
  /** Maximum price across all variants */
  price_max: number
  /** Total quantity available across all variants */
  quantity_available: number
  /** Minimum quality tier available (1-5) */
  quality_tier_min?: number
  /** Maximum quality tier available (1-5) */
  quality_tier_max?: number
  /** Number of unique variants in this listing */
  variant_count: number
  /** Seller type (user or contractor) */
  seller_type: "user" | "contractor"
  /** Username (for user sellers) or spectrum_id (for contractor sellers) - use for profile links */
  seller_slug: string
  /** ISO 8601 timestamp when listing was created */
  created_at: string
  /** ISO 8601 timestamp when listing was last updated */
  updated_at: string
  /** Game item name */
  game_item_name: string
  /** Game item type/category */
  game_item_type: string
  /** Seller rating count */
  seller_rating_count: number
  /** Seller's supported languages (ISO 639-1 codes) */
  seller_languages?: string[]
  /** First photo URL (null if no photos) */
  photo?: string
  /** Pickup method: delivery, pickup, any, or null (not specified) */
  pickup_method?: ("delivery" | "pickup" | "any" | null) | null
  /** Whether this listing has bulk discount tiers defined */
  has_bulk_discount?: boolean
}
export type SearchListingsResponse = {
  /** Array of listing results */
  listings: ListingSearchResult[]
  /** Total number of listings matching filters */
  total: number
  /** Current page number */
  page: number
  /** Number of results per page */
  page_size: number
}
export type MyListingItem = {
  /** Listing UUID */
  listing_id: string
  /** Listing title */
  title: string
  /** Current status */
  status: string
  /** ISO 8601 timestamp when listing was created */
  created_at: string
  /** ISO 8601 timestamp when listing was last updated */
  updated_at: string
  /** Number of unique variants */
  variant_count: number
  /** Total quantity available across all variants */
  quantity_available: number
  /** Minimum price across all variants */
  price_min: number
  /** Maximum price across all variants */
  price_max: number
  /** Minimum quality tier available (1-5) */
  quality_tier_min?: number
  /** Maximum quality tier available (1-5) */
  quality_tier_max?: number
}
export type GetMyListingsResponse = {
  /** Array of user's listings */
  listings: MyListingItem[]
  /** Total number of listings matching filters */
  total: number
  /** Current page number */
  page: number
  /** Number of results per page */
  page_size: number
}
export type ListingDetail = {
  /** Listing UUID */
  listing_id: string
  /** Seller UUID */
  seller_id: string
  /** Type of seller */
  seller_type: "user" | "contractor"
  /** Listing title */
  title: string
  /** Listing description (markdown) */
  description: string
  /** Current listing status */
  status: "active" | "sold" | "expired" | "cancelled"
  /** Visibility setting */
  visibility: "public" | "private" | "unlisted"
  /** Sale type */
  sale_type: "fixed" | "auction" | "negotiable"
  /** Listing type */
  listing_type: "single" | "bundle" | "bulk"
  /** ISO 8601 timestamp when listing was created */
  created_at: string
  /** ISO 8601 timestamp when listing was last updated */
  updated_at: string
  /** Optional ISO 8601 timestamp when listing expires */
  expires_at?: string
  /** Array of photo URLs */
  photos?: string[]
  /** Pickup method: delivery, pickup, any, or null (not specified) */
  pickup_method?: ("delivery" | "pickup" | "any" | null) | null
}
export type SellerInfo = {
  /** Seller UUID */
  id: string
  /** Seller username or contractor name */
  name: string
  /** Seller type */
  type: "user" | "contractor"
  /** Username (for users) or spectrum_id (for contractors) - use for profile links */
  slug: string
  /** Seller rating (0-5) */
  rating: number
  /** Optional seller avatar URL */
  avatar_url?: string
}
export type GameItemInfo = {
  /** Game item UUID */
  id: string
  /** Item name */
  name: string
  /** Item type/category */
  type: string
  /** Optional item image URL */
  image_url?: string
}
export type VariantDetail = {
  /** Variant UUID */
  variant_id: string
  /** Variant attributes (quality tier, crafted source, etc) */
  attributes: VariantAttributes
  /** Human-readable display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name for compact display (e.g., "T5 Crafted") */
  short_name: string
  /** Total quantity available for this variant */
  quantity: number
  /** Price for this variant */
  price: number
  /** Location names where this variant is stored */
  locations: string[]
}
export type ListingItemDetail = {
  /** Item UUID */
  item_id: string
  /** Game item information */
  game_item: GameItemInfo
  /** Pricing strategy for this item */
  pricing_mode: "unified" | "per_variant"
  /** Base price (used when pricing_mode is 'unified') */
  base_price?: number
  /** Array of variants with quantities and prices */
  variants: VariantDetail[]
  /** Bulk discount tiers (null if none defined) */
  bulk_discount_tiers?: BulkDiscountTier[] | null
}
export type GetListingDetailResponse = {
  /** Core listing metadata */
  listing: ListingDetail
  /** Seller information */
  seller: SellerInfo
  /** Array of items being sold with variant breakdown */
  items: ListingItemDetail[]
}
export type VariantPriceUpdate = {
  /** Variant UUID */
  variant_id: string
  /** New price for this variant */
  price: number
}
export type LotUpdate = {
  /** Stock lot UUID */
  lot_id: string
  /** New total quantity (optional) */
  quantity_total?: number
  /** New listed status (optional) */
  listed?: boolean
  /** New location ID (optional) */
  location_id?: string
}
export type UpdateListingRequest = {
  /** New title (optional) */
  title?: string
  /** New description (optional) */
  description?: string
  /** New base price for unified pricing mode (optional) */
  base_price?: number
  /** Array of variant price updates for per_variant pricing mode (optional) */
  variant_prices?: VariantPriceUpdate[]
  /** Array of stock lot updates (optional) */
  lot_updates?: LotUpdate[]
  /** Pickup method: how the buyer receives the item */
  pickup_method?: ("delivery" | "pickup" | "any" | null) | null
  /** Updated bulk discount tiers (pass [] to remove, omit to keep unchanged) */
  bulk_discount_tiers?: BulkDiscountTier[]
}
export type HealthResponse = {
  status: string
  version: string
  timestamp: string
}
export type GameItemSearchResult = {
  id: string
  name: string
  type: string
}
export type GameItemCategory = {
  category: string
  game_item_categories: string
  subcategory?: string
}
export type GameItemMetadata = {
  /** Game item UUID */
  id: string
  /** Game item name */
  name: string
  /** Game item type */
  type: string
  /** Game item image URL */
  image_url?: string
}
export type GameItemQualityDistribution = {
  /** Quality tier (1-5) */
  quality_tier: number
  /** Total quantity available for this tier across all listings */
  quantity_available: number
  /** Minimum price for this tier */
  price_min: number
  /** Maximum price for this tier */
  price_max: number
  /** Average price for this tier */
  price_avg: number
  /** Number of unique sellers offering this tier */
  seller_count: number
  /** Number of listings offering this tier */
  listing_count: number
}
export type GameItemListingResult = {
  /** Listing UUID */
  listing_id: string
  /** Listing title */
  title: string
  /** Seller ID */
  seller_id: string
  /** Seller name */
  seller_name: string
  /** Seller rating (0-5) */
  seller_rating: number
  /** Seller type */
  seller_type: "user" | "contractor"
  /** Username (for user sellers) or spectrum_id (for contractor sellers) */
  seller_slug: string
  /** Minimum price across all variants in this listing */
  price_min: number
  /** Maximum price across all variants in this listing */
  price_max: number
  /** Total quantity available in this listing */
  quantity_available: number
  /** Minimum quality tier in this listing */
  quality_tier_min?: number
  /** Maximum quality tier in this listing */
  quality_tier_max?: number
  /** Number of variants in this listing */
  variant_count: number
  /** Listing created timestamp */
  created_at: string
}
export type GetGameItemListingsResponse = {
  /** Game item metadata */
  game_item: GameItemMetadata
  /** Quality distribution across all listings */
  quality_distribution: GameItemQualityDistribution[]
  /** Individual listings for this game item */
  listings: GameItemListingResult[]
  /** Total number of listings (for pagination) */
  total: number
  /** Current page number */
  page: number
  /** Page size */
  page_size: number
}
export type MarketVersion = "V1" | "V2"
export type GetFeatureFlagResponse = {
  /** User ID */
  user_id: string
  /** Current market version (V1 or V2) */
  market_version: MarketVersion
  /** Whether user has developer privileges (admin or dev environment) */
  is_developer: boolean
}
export type SetFeatureFlagResponse = {
  /** User ID */
  user_id: string
  /** Updated market version */
  market_version: MarketVersion
  /** Success message */
  message: string
}
export type SetFeatureFlagRequest = {
  /** Market version to set (V1 or V2) */
  market_version: MarketVersion
}
export type CartListingInfo = {
  /** Listing UUID */
  listing_id: string
  /** Listing title */
  title: string
  /** Seller username or contractor name */
  seller_name: string
  /** Seller rating (0-5) */
  seller_rating: number
  /** Current listing status */
  status: string
}
export type CartVariantDetail = {
  /** UUID of the variant */
  variant_id: string
  /** Variant attributes (quality_tier, quality_value, crafted_source, etc) */
  attributes: VariantAttributes
  /** Human-readable display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name for compact display (e.g., "T5 Crafted") */
  short_name: string
}
export type CartItemDetail = {
  /** UUID of the cart item */
  cart_item_id: string
  /** Listing information */
  listing: CartListingInfo
  /** Variant details with quality attributes */
  variant: CartVariantDetail
  /** Quantity in cart */
  quantity: number
  /** Price per unit at time of add-to-cart (snapshot) */
  price_per_unit: number
  /** Subtotal for this item (quantity * price_per_unit) */
  subtotal: number
  /** Whether this variant is currently available */
  available: boolean
  /** Whether the price has changed since add-to-cart */
  price_changed: boolean
  /** Current price if price_changed is true */
  current_price?: number
}
export type GetCartResponse = {
  /** Array of cart items with variant details */
  items: CartItemDetail[]
  /** Total price of all items in cart */
  total_price: number
  /** Total number of items in cart */
  item_count: number
}
export type AddToCartResponse = {
  /** UUID of the created cart item */
  cart_item_id: string
  /** Success message */
  message: string
}
export type AddToCartRequest = {
  /** UUID of the listing */
  listing_id: string
  /** UUID of the specific variant to add */
  variant_id: string
  /** Quantity to add (must be > 0) */
  quantity: number
}
export type UpdateCartItemRequest = {
  /** New quantity (optional, must be > 0 if provided) */
  quantity?: number
  /** New variant selection (optional) */
  variant_id?: string
}
export type UnavailableCartItem = {
  /** Cart item UUID */
  cart_item_id: string
  /** Listing title */
  listing_title: string
  /** Variant display name */
  variant_display_name: string
  /** Reason for unavailability */
  reason: string
}
export type CheckoutCartResponse = {
  /** UUID of the created order */
  order_id: string
  /** Total price of the order */
  total_price: number
  /** Number of items successfully purchased */
  items_purchased: number
  /** Array of items that could not be purchased (optional) */
  unavailable_items?: UnavailableCartItem[]
}
export type CheckoutCartRequest = {
  /** Required if any prices have changed since add-to-cart */
  confirm_price_changes?: boolean
}
export type BuyOrderVariantDetail = {
  /** UUID of the variant */
  variant_id: string
  /** Variant attributes (quality_tier, quality_value, crafted_source, etc) */
  attributes: VariantAttributes
  /** Human-readable display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name for compact display (e.g., "T5 Crafted") */
  short_name: string
}
export type BuyOrderItemDetail = {
  /** UUID of the order item */
  order_item_id: string
  /** UUID of the listing */
  listing_id: string
  /** UUID of the listing item */
  item_id: string
  /** Variant details with quality attributes */
  variant: BuyOrderVariantDetail
  /** Quantity purchased */
  quantity: number
  /** Price per unit at time of purchase (snapshot) */
  price_per_unit: number
  /** Subtotal for this item (quantity * price_per_unit) */
  subtotal: number
}
export type CreateBuyOrderResponse = {
  /** UUID of the created order */
  order_id: string
  /** UUID of the buyer */
  buyer_id: string
  /** UUID of the seller */
  seller_id: string
  /** Total price in aUEC (atomic units) */
  total_price: number
  /** Order status */
  status: string
  /** ISO 8601 timestamp of order creation */
  created_at: string
  /** Purchase item details */
  item: BuyOrderItemDetail
  /** Stock allocation result summary */
  allocation_result?: {
    total_allocated: number
    total_requested: number
    has_partial_allocations: boolean
  }
}
export type CreateBuyOrderRequest = {
  /** UUID of the listing to purchase from */
  listing_id: string
  /** UUID of the specific variant to purchase */
  variant_id: string
  /** Quantity to purchase (must be > 0) */
  quantity: number
}
export type StandingBuyOrder = {
  buy_order_id: string
  game_item_id: string
  game_item_name: string
  buyer_id: string
  buyer_name: string
  quantity: number
  price_per_unit: number
  quality_tier_min?: number
  quality_tier_max?: number
  negotiable: boolean
  status: "active" | "fulfilled" | "cancelled" | "expired"
  created_at: string
  expires_at?: string
}
export type CreateStandingBuyOrderRequest = {
  game_item_id: string
  quantity: number
  price_per_unit: number
  quality_tier_min?: number
  quality_tier_max?: number
  negotiable?: boolean
  expires_in_days?: number
}
export type SearchBuyOrdersResponse = {
  buy_orders: StandingBuyOrder[]
  total: number
  page: number
  page_size: number
}
export type UpdateStandingBuyOrderRequest = {
  quantity?: number
  price_per_unit?: number
  quality_tier_min?: number
  quality_tier_max?: number
  negotiable?: boolean
  expires_in_days?: number
}
export type PriceDataPoint = {
  /** ISO 8601 timestamp for this data point */
  timestamp: string
  /** Average price during this time period */
  avg_price: number
  /** Minimum price during this time period */
  min_price: number
  /** Maximum price during this time period */
  max_price: number
  /** Number of transactions/listings during this time period */
  volume: number
  /** Optional quality tier for this data series */
  quality_tier?: number
}
export type GetPriceHistoryResponse = {
  /** Game item UUID */
  game_item_id: string
  /** Game item name */
  game_item_name: string
  /** Time series data points */
  data: PriceDataPoint[]
  /** Start date of the time range */
  start_date: string
  /** End date of the time range */
  end_date: string
  /** Time interval used for aggregation */
  interval: string
}
export type QualityTierDistribution = {
  /** Quality tier (1-5) */
  quality_tier: number
  /** Total quantity available for this tier */
  quantity_available: number
  /** Number of listings offering this tier */
  listing_count: number
  /** Average price for this tier */
  avg_price: number
  /** Minimum price for this tier */
  min_price: number
  /** Maximum price for this tier */
  max_price: number
  /** Number of unique sellers offering this tier */
  seller_count: number
}
export type GetQualityDistributionResponse = {
  /** Game item UUID */
  game_item_id: string
  /** Game item name */
  game_item_name: string
  /** Distribution data by quality tier */
  distribution: QualityTierDistribution[]
  /** Total quantity across all tiers */
  total_quantity: number
  /** Start date of the time range (if filtered) */
  start_date?: string
  /** End date of the time range (if filtered) */
  end_date?: string
}
export type QualityTierSales = {
  /** Quality tier (1-5) */
  quality_tier: number
  /** Total sales volume (number of items sold) */
  volume: number
  /** Average sale price for this tier */
  avg_price: number
  /** Average time to sale in hours */
  avg_time_to_sale_hours: number
}
export type QualityTierPremium = {
  /** Quality tier (1-5) */
  quality_tier: number
  /** Price premium percentage compared to tier 1 baseline */
  premium_percentage: number
}
export type GetSellerStatsResponse = {
  /** Seller ID */
  seller_id: string
  /** Sales data grouped by quality tier */
  sales_by_quality: QualityTierSales[]
  /** Current inventory distribution by quality tier */
  inventory_distribution: QualityTierDistribution[]
  /** Price premium percentages by quality tier */
  price_premiums: QualityTierPremium[]
}
export type FeatureFlagConfig = {
  flag_name: string
  default_version: MarketVersion
  rollout_percentage: number
  enabled: boolean
  created_at: string
  updated_at: string
}
export type UpdateConfigRequest = {
  /** Global default version for users without overrides */
  default_version?: MarketVersion
  /** Percentage of users (0-100) to receive V2 via rollout */
  rollout_percentage?: number
  /** Master kill-switch: when false, everyone gets V1 */
  enabled?: boolean
}
export type FeatureFlagStats = {
  total_overrides: number
  v1_overrides: number
  v2_overrides: number
  rollout_percentage: number
  default_version: MarketVersion
  enabled: boolean
}
export type UserOverride = {
  user_id: string
  market_version: MarketVersion
  updated_at: string
}
export type UserOverridesResponse = {
  overrides: UserOverride[]
  total: number
}
export type SetUserOverrideRequest = {
  user_id: string
  market_version: MarketVersion
}
export const {
  useGetVariantTypesQuery,
  useCreateStockLotMutation,
  useGetStockLotsQuery,
  useUpdateStockLotMutation,
  useDeleteStockLotMutation,
  useBulkUpdateStockLotsMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderDetailQuery,
  useGetOfferSessionQuery,
  useSearchOffersQuery,
  useCreateListingMutation,
  useSearchListingsQuery,
  useGetMyListingsQuery,
  useGetListingDetailQuery,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useRefreshListingMutation,
  useTrackViewMutation,
  useUploadPhotosMutation,
  useGetHealthQuery,
  useSearchGameItemsQuery,
  useGetCategoriesQuery,
  useGetListingsQuery,
  useGetFeatureFlagQuery,
  useSetFeatureFlagMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useCheckoutCartMutation,
  useCreatePurchaseMutation,
  useCreateStandingBuyOrderMutation,
  useSearchBuyOrdersQuery,
  useGetMyBuyOrdersQuery,
  useUpdateBuyOrderMutation,
  useCancelBuyOrderMutation,
  useFulfillBuyOrderMutation,
  useGetPriceHistoryQuery,
  useGetQualityDistributionQuery,
  useGetSellerStatsQuery,
  useGetConfigQuery,
  useUpdateConfigMutation,
  useGetStatsQuery,
  useGetUserOverridesQuery,
  useSetUserOverrideMutation,
  useRemoveUserOverrideMutation,
} = injectedRtkApi
