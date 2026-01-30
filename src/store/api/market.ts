import { generatedApi as api } from "../generatedApi"
export const addTagTypes = [
  "Market",
  "Market Listing",
  "Auctions",
  "Aggregates",
  "Charts",
  "Game Items",
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiMarketStats: build.query<
        GetApiMarketStatsApiResponse,
        GetApiMarketStatsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/stats`,
          params: {
            format: queryArg.format,
          },
        }),
        providesTags: ["Market"],
      }),
      getMarketListingsStats: build.mutation<
        GetMarketListingsStatsApiResponse,
        GetMarketListingsStatsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listings/stats`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Market"],
      }),
      putApiMarketListingByListingId: build.mutation<
        PutApiMarketListingByListingIdApiResponse,
        PutApiMarketListingByListingIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listing/${queryArg.listingId}`,
          method: "PUT",
          body: queryArg.listingUpdateRequest,
        }),
        invalidatesTags: ["Market", "Market Listing"],
      }),
      postApiMarketListingByListingIdUpdateQuantity: build.mutation<
        PostApiMarketListingByListingIdUpdateQuantityApiResponse,
        PostApiMarketListingByListingIdUpdateQuantityApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listing/${queryArg.listingId}/update_quantity`,
          method: "POST",
          body: queryArg.updateQuantityRequest,
        }),
        invalidatesTags: ["Market", "Market Listing"],
      }),
      postApiMarketListingByListingIdRefresh: build.mutation<
        PostApiMarketListingByListingIdRefreshApiResponse,
        PostApiMarketListingByListingIdRefreshApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listing/${queryArg.listingId}/refresh`,
          method: "POST",
        }),
        invalidatesTags: ["Market", "Market Listing"],
      }),
      getApiMarketListingsByListingId: build.query<
        GetApiMarketListingsByListingIdApiResponse,
        GetApiMarketListingsByListingIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listings/${queryArg.listingId}`,
        }),
        providesTags: ["Market", "Market Listing"],
      }),
      getApiMarketListingByListingIdOrders: build.query<
        GetApiMarketListingByListingIdOrdersApiResponse,
        GetApiMarketListingByListingIdOrdersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listing/${queryArg.listingId}/orders`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            status: queryArg.status,
            sortBy: queryArg.sortBy,
            sortOrder: queryArg.sortOrder,
          },
        }),
        providesTags: ["Market", "Market Listing"],
      }),
      postApiMarketPurchase: build.mutation<
        PostApiMarketPurchaseApiResponse,
        PostApiMarketPurchaseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/purchase`,
          method: "POST",
          body: queryArg.purchaseRequest,
        }),
        invalidatesTags: ["Market"],
      }),
      placeBidOnAuction: build.mutation<
        PlaceBidOnAuctionApiResponse,
        PlaceBidOnAuctionApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listings/${queryArg.listingId}/bids`,
          method: "POST",
          body: queryArg.marketBidRequest,
        }),
        invalidatesTags: ["Market", "Auctions"],
      }),
      createMarketListing: build.mutation<
        CreateMarketListingApiResponse,
        CreateMarketListingApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listings`,
          method: "POST",
          body: queryArg.marketListingCreateRequest,
        }),
        invalidatesTags: ["Market"],
      }),
      searchMarketListings: build.query<
        SearchMarketListingsApiResponse,
        SearchMarketListingsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listings`,
          params: {
            item_type: queryArg.itemType,
            sale_type: queryArg.saleType,
            minCost: queryArg.minCost,
            maxCost: queryArg.maxCost,
            quantityAvailable: queryArg.quantityAvailable,
            query: queryArg.query,
            sort: queryArg.sort,
            index: queryArg.index,
            page_size: queryArg.pageSize,
            user_seller: queryArg.userSeller,
            contractor_seller: queryArg.contractorSeller,
            listing_type: queryArg.listingType,
            statuses: queryArg.statuses,
          },
        }),
        providesTags: ["Market"],
      }),
      uploadListingPhotos: build.mutation<
        UploadListingPhotosApiResponse,
        UploadListingPhotosApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listing/${queryArg.listingId}/photos`,
          method: "POST",
        }),
        invalidatesTags: ["Market"],
      }),
      trackMarketListingView: build.mutation<
        TrackMarketListingViewApiResponse,
        TrackMarketListingViewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/listings/${queryArg.listingId}/views`,
          method: "POST",
        }),
        invalidatesTags: ["Market"],
      }),
      getApiMarketMine: build.query<
        GetApiMarketMineApiResponse,
        GetApiMarketMineApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/mine`,
          params: {
            contractor_id: queryArg.contractorId,
            query: queryArg.query,
            statuses: queryArg.statuses,
            sale_type: queryArg.saleType,
            item_type: queryArg.itemType,
            listing_type: queryArg.listingType,
            sort: queryArg.sort,
            index: queryArg.index,
            page_size: queryArg.pageSize,
            minCost: queryArg.minCost,
            maxCost: queryArg.maxCost,
            quantityAvailable: queryArg.quantityAvailable,
          },
        }),
        providesTags: ["Market", "Market Listing"],
      }),
      getUserListings: build.query<
        GetUserListingsApiResponse,
        GetUserListingsApiArg
      >({
        query: (queryArg) => ({ url: `/api/market/user/${queryArg.username}` }),
        providesTags: ["Market"],
      }),
      getContractorPublicListings: build.query<
        GetContractorPublicListingsApiResponse,
        GetContractorPublicListingsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/contractor/${queryArg.spectrumId}`,
        }),
        providesTags: ["Market"],
      }),
      getMarketBuyOrders: build.query<
        GetMarketBuyOrdersApiResponse,
        GetMarketBuyOrdersApiArg
      >({
        query: () => ({ url: `/api/market/aggregates/buyorders` }),
        providesTags: ["Market", "Aggregates"],
      }),
      getGameItemBuyOrderChart: build.query<
        GetGameItemBuyOrderChartApiResponse,
        GetGameItemBuyOrderChartApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/aggregate/${queryArg.gameItemId}/chart`,
        }),
        providesTags: ["Market", "Aggregates", "Charts"],
      }),
      getGameItemByName: build.query<
        GetGameItemByNameApiResponse,
        GetGameItemByNameApiArg
      >({
        query: (queryArg) => ({ url: `/api/market/item/${queryArg.name}` }),
        providesTags: ["Market", "Game Items"],
      }),
      getSellerAnalytics: build.query<
        GetSellerAnalyticsApiResponse,
        GetSellerAnalyticsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/market/seller/analytics`,
          params: {
            period: queryArg.period,
          },
        }),
        providesTags: ["Market"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as marketApi }
export type GetApiMarketStatsApiResponse =
  /** status 200 Successfully retrieved order statistics. Returns Grafana format if format=grafana is specified. */
  GrafanaTimeSeries[] | OrderStats
export type GetApiMarketStatsApiArg = {
  /** Response format - use 'grafana' for Grafana JSON datasource format */
  format?: "grafana"
}
export type GetMarketListingsStatsApiResponse =
  /** status 200 Successfully retrieved listing statistics */ {
    stats: {
      listing_id: string
      /** Number of active orders for this listing */
      order_count: number
      /** Number of active offers for this listing */
      offer_count: number
      /** Number of views for this listing */
      view_count: number
    }[]
  }
export type GetMarketListingsStatsApiArg = {
  body: {
    /** Array of market listing IDs to get stats for */
    listing_ids: string[]
  }
}
export type PutApiMarketListingByListingIdApiResponse =
  /** status 200 Listing updated successfully */ UpdateListingResponse
export type PutApiMarketListingByListingIdApiArg = {
  /** ID of the listing to update */
  listingId: string
  listingUpdateRequest: ListingUpdateRequest
}
export type PostApiMarketListingByListingIdUpdateQuantityApiResponse =
  /** status 200 Quantity updated successfully */ UpdateQuantityResponse
export type PostApiMarketListingByListingIdUpdateQuantityApiArg = {
  /** ID of the listing to update */
  listingId: string
  updateQuantityRequest: UpdateQuantityRequest
}
export type PostApiMarketListingByListingIdRefreshApiResponse =
  /** status 200 Listing expiration refreshed successfully */ RefreshListingResponse
export type PostApiMarketListingByListingIdRefreshApiArg = {
  /** ID of the listing to refresh */
  listingId: string
}
export type GetApiMarketListingsByListingIdApiResponse =
  /** status 200 Successfully retrieved listing details */
  UniqueListing | AggregateListing
export type GetApiMarketListingsByListingIdApiArg = {
  /** ID of the listing to retrieve */
  listingId: string
}
export type GetApiMarketListingByListingIdOrdersApiResponse =
  /** status 200 Successfully retrieved listing orders */ ListingOrdersResponse
export type GetApiMarketListingByListingIdOrdersApiArg = {
  /** ID of the listing to get orders for */
  listingId: string
  /** Page number (1-based) */
  page?: number
  /** Number of orders per page */
  pageSize?: number
  /** Filter orders by status */
  status?: "not-started,in-progress" | "fulfilled,cancelled"
  /** Field to sort by */
  sortBy?: "timestamp" | "status"
  /** Sort order */
  sortOrder?: "asc" | "desc"
}
export type PostApiMarketPurchaseApiResponse =
  /** status 200 Purchase offer created successfully */ {
    data: {
      result: "Success"
      offer_id: string
      session_id: string
      discord_invite: string | null
    }
  }
export type PostApiMarketPurchaseApiArg = {
  purchaseRequest: PurchaseRequest
}
export type PlaceBidOnAuctionApiResponse =
  /** status 200 Bid placed successfully */ {
    data: {
      result: "Success"
    }
  }
export type PlaceBidOnAuctionApiArg = {
  listingId: string
  marketBidRequest: MarketBidRequest
}
export type CreateMarketListingApiResponse =
  /** status 200 Listing created successfully */ MarketListingComplete
export type CreateMarketListingApiArg = {
  marketListingCreateRequest: MarketListingCreateRequest
}
export type SearchMarketListingsApiResponse =
  /** status 200 Search completed successfully */ {
    data: {
      total: number
      listings: MarketListingSearchResult[]
    }
  }
export type SearchMarketListingsApiArg = {
  itemType?: string | null
  saleType?: string | null
  minCost?: string
  maxCost?: string | null
  quantityAvailable?: string
  query?: string
  sort?:
    | "date-old"
    | "date-new"
    | "rating"
    | "title"
    | "price-low"
    | "price-high"
    | "quantity-low"
    | "quantity-high"
    | "activity"
  index?: string
  pageSize?: string
  userSeller?: string
  contractorSeller?: string
  listingType?: string | null
  /** Comma-separated list of statuses to include (e.g., 'active', 'active,inactive', 'active,inactive,archived') */
  statuses?: string | null
}
export type UploadListingPhotosApiResponse =
  /** status 200 Photos uploaded successfully */ PhotoUploadResponse
export type UploadListingPhotosApiArg = {
  /** ID of the listing to upload photos for */
  listingId: string
}
export type TrackMarketListingViewApiResponse =
  /** status 200 View tracked successfully */ {
    message: string
  }
export type TrackMarketListingViewApiArg = {
  /** ID of the listing to track view for */
  listingId: string
}
export type GetApiMarketMineApiResponse =
  /** status 200 Successfully retrieved listings */ {
    listings?: object[]
    total?: number
  }
export type GetApiMarketMineApiArg = {
  /** Contractor ID to get listings for (user must be a member) */
  contractorId?: string
  /** Search query to filter listings by title or description */
  query?: string
  /** Comma-separated list of statuses */
  statuses?: string
  /** Filter by sale type */
  saleType?: "unique" | "aggregate" | "multiple" | "auction"
  /** Filter by item type */
  itemType?: string
  /** Filter by listing type */
  listingType?: "unique" | "aggregate" | "multiple"
  /** Sort method */
  sort?: string
  /** Starting index for pagination */
  index?: number
  /** Number of results per page */
  pageSize?: number
  /** Minimum price filter */
  minCost?: string
  /** Maximum price filter */
  maxCost?: string
  /** Minimum quantity available */
  quantityAvailable?: string
}
export type GetUserListingsApiResponse =
  /** status 200 User's listings retrieved successfully */ MarketListingComplete[]
export type GetUserListingsApiArg = {
  /** Username of the seller whose listings to retrieve */
  username: string
}
export type GetContractorPublicListingsApiResponse =
  /** status 200 Contractor listings retrieved successfully */ MarketListingComplete[]
export type GetContractorPublicListingsApiArg = {
  /** Spectrum ID of the contractor organization */
  spectrumId: string
}
export type GetMarketBuyOrdersApiResponse =
  /** status 200 Buy orders retrieved successfully */ MarketAggregateComplete[]
export type GetMarketBuyOrdersApiArg = void
export type GetGameItemBuyOrderChartApiResponse =
  /** status 200 Chart data retrieved successfully */ BuyOrderChartDataPoint[]
export type GetGameItemBuyOrderChartApiArg = {
  /** ID of the game item to get chart data for */
  gameItemId: string
}
export type GetGameItemByNameApiResponse =
  /** status 200 Game item retrieved successfully */ GameItemDescription
export type GetGameItemByNameApiArg = {
  /** Name of the game item to retrieve */
  name: string
}
export type GetSellerAnalyticsApiResponse =
  /** status 200 Analytics retrieved successfully */ {
    data: {
      market_listings: number
      services: number
      total_market_views: number
      total_service_views: number
      time_period: string
      user_id: string
    }
  }
export type GetSellerAnalyticsApiArg = {
  /** Time period for analytics (7d, 30d, 90d) */
  period?: "7d" | "30d" | "90d"
}
export type GrafanaTimeSeries = {
  /** Metric name/series identifier */
  target: string
  /** Array of [value, timestamp_in_ms] pairs */
  datapoints: number[][]
}
export type OrderStats = {
  /** Total number of orders */
  total_orders: number
  /** Total value of all orders */
  total_order_value: number
  /** Number of orders in the last week */
  week_orders?: number
  /** Total value of orders in the last week */
  week_order_value?: number
}
export type BadRequest = {
  errors?: {
    message: string
  }[]
  message: string
}
export type Unauthorized = {
  message: "Unauthorized"
}
export type Forbidden = {
  message: "Forbidden"
}
export type ServerError = {
  message: "Internal Server Error"
}
export type UpdateListingResponse = {
  result: "Success"
}
export type ErrorResponse = {
  error: string
}
export type ListingUpdateRequest = {
  /** New status for the listing */
  status?: "active" | "inactive" | "archived"
  /** New title for the listing */
  title?: string
  /** New description for the listing */
  description?: string
  /** Type of the item */
  item_type?: string
  /** Name of the game item */
  item_name?: string
  /** New price for the listing */
  price?: number
  /** New quantity available */
  quantity_available?: number
  /** List of photo URLs */
  photos?: string[]
  /** Minimum increment for auction bids */
  minimum_bid_increment?: number
}
export type UpdateQuantityResponse = {
  result: "Success"
}
export type UpdateQuantityRequest = {
  /** New quantity available for the listing */
  quantity_available: number
}
export type RefreshListingResponse = {
  result: "Success"
}
export type Rating = {
  avg_rating: number
  rating_count: number
  streak: number
  total_orders: number
}
export type MinimalUser = {
  username: string
  display_name: string
  avatar: string
  rating: Rating
  discord_profile?: {
    id: string
    discriminator: string
    username: string
  } | null
}
export type MinimalContractor = {
  avatar: string
  name: string
  spectrum_id: string
  rating: Rating
}
export type MarketListingSeller = {
  user?: MinimalUser
  contractor?: MinimalContractor
}
export type MarketListingBase = {
  listing_id: string
  sale_type: "unique" | "multiple" | "auction" | "aggregate"
  price: number
  quantity_available: number
  status: "active" | "inactive" | "archived"
  timestamp: string
  expiration: string
  seller: MarketListingSeller
}
export type UniqueListing = MarketListingBase & {
  title?: string
  description?: string
  item_type?: string
  photos?: string[]
  game_item?: {
    name?: string
    icon_url?: string
  } | null
  /** Total number of views for this listing */
  view_count?: number
}
export type AggregateListingStats = {
  minimum_price?: number
  maximum_price?: number
  average_price?: number
  total_quantity?: number
}
export type AggregateListing = MarketListingBase & {
  stats?: AggregateListingStats
  game_item?: {
    name?: string
    icon_url?: string
  }
}
export type OrderStatus =
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled"
export type OrderApplicant = {
  order_id: string
  user_applicant: MinimalUser
  org_applicant: MinimalContractor
  timestamp: number
  message: string
}
export type OfferMarketListing = {
  quantity: number
  listing_id: string
  listing: UniqueListing
}
export type OrderReview = {
  user_author: MinimalUser
  contractor_author: MinimalContractor
  content: string
  timestamp: number
  review_id: string
  order_id: string
  rating: number
}
export type AvailabilityEntry = {
  start: number
  finish: number
}
export type OrderAvailability = {
  customer: AvailabilityEntry[]
  assigned: AvailabilityEntry[]
}
export type Order = {
  order_id: string
  status: OrderStatus
  kind: string
  cost: number
  rush: boolean
  assigned_to: string | null
  contractor: string | null
  customer: string
  title: string
  description: string
  discord_thread_id?: string | null
  discord_server_id?: string | null
  discord_invite?: string | null
  timestamp: string
  applicants: OrderApplicant[]
  market_listings?: OfferMarketListing[]
  customer_review?: OrderReview
  contractor_review?: OrderReview
  template_id?: string | null
  payment_type:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
  availability?: OrderAvailability
  offer_session_id: string | null
}
export type ListingOrdersPagination = {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
export type ListingOrdersResponse = {
  data: Order[]
  pagination: ListingOrdersPagination
}
export type RateLimitError = {
  /** Error type identifier */
  error: "RATE_LIMIT_EXCEEDED"
  /** Human-readable error message */
  message: string
  /** Seconds to wait before retrying */
  retryAfter: number
  /** Maximum requests allowed per time window */
  limit: number
  /** Requests remaining in current window */
  remaining: number
  /** Unix timestamp when rate limit resets */
  resetTime: number
  /** User tier that triggered the rate limit */
  userTier: "anonymous" | "authenticated" | "admin"
  /** Endpoint that was rate limited */
  endpoint: string
}
export type OfferBodyMarketListing = {
  quantity: number
  listing_id: string
}
export type PurchaseRequest = {
  items: OfferBodyMarketListing[]
  /** Optional note from buyer to seller */
  note?: string
  /** Optional custom offer amount in aUEC */
  offer?: number
}
export type MarketBidRequest = {
  listing_id: string
  bid: number
}
export type MarketListingComplete = {
  listing_id: string
  price: number
  sale_type: "sale" | "auction" | "aggregate" | "multiple"
  quantity_available: number
  status: "active" | "inactive" | "archived"
  title: string
  description: string
  item_type: string
  internal: boolean
  seller?: {
    user?: {
      user_id?: string
      username?: string
      avatar_url?: string | null
    } | null
    contractor?: {
      contractor_id?: string
      name?: string
      spectrum_id?: string
      logo_url?: string | null
    } | null
  }
  photos: {
    resource_id?: string
    url?: string
  }[]
  auction_details?: {
    minimum_bid_increment?: number
    end_time?: string
    status?: "active" | "inactive"
    current_bid?: {
      amount?: number
      bidder?: {
        user_id?: string
        username?: string
        avatar_url?: string | null
      }
    } | null
  } | null
  game_item?: {
    id?: string
    name?: string
    type?: string
    description?: string
  } | null
  created_at: string
  updated_at: string
}
export type MarketListingCreateRequest = {
  price: number
  title: string
  description: string
  sale_type: "sale" | "auction"
  item_type: string
  item_name?: string | null
  quantity_available: number
  /** Array of photo URLs. If empty or not provided, a default placeholder photo will be used. */
  photos?: string[]
  minimum_bid_increment: number
  status: "active" | "inactive"
  end_time?: string | null
}
export type Uuid = string
export type ListingType = "unique" | "aggregate" | "multiple"
export type ItemType = string
export type GameItemId = string | null
export type SaleType = "unique" | "aggregate" | "multiple" | "auction"
export type Price = number
export type Timestamp = string
export type Quantity = number
export type ListingStatus = "active" | "inactive" | "archived"
export type ListingTitle = string
export type MarketListingSearchResult = {
  /** Unique identifier for the listing */
  listing_id: Uuid
  /** Type of listing */
  listing_type: ListingType
  /** Type of game item */
  item_type: ItemType
  /** Name of the specific game item */
  item_name?: string | null
  /** Specific game item identifier */
  game_item_id?: GameItemId
  /** Type of sale */
  sale_type: SaleType
  /** Current price */
  price: Price
  /** When the listing expires */
  expiration?: Timestamp
  /** Minimum price (for auctions) */
  minimum_price?: Price
  /** Maximum price (for auctions) */
  maximum_price?: Price
  /** Available quantity */
  quantity_available: Quantity
  /** When the listing was created */
  timestamp: Timestamp
  /** ID of the listing details */
  details_id?: Uuid
  /** Current status */
  status: ListingStatus
  /** Listing title */
  title: ListingTitle
  /** URL to the primary photo */
  photo: string
  /** Whether this is an internal listing */
  internal: boolean
  /** When the auction ends (for auction listings) */
  auction_end_time?: Timestamp
  /** Total rating points for the seller */
  total_rating: number
  /** Average rating for the seller */
  avg_rating: number
  /** Number of ratings for the seller */
  rating_count?: number | null
  /** Current rating streak for the seller */
  rating_streak?: number | null
  /** Username of the user seller */
  user_seller?: string | null
  /** Spectrum ID of the contractor seller */
  contractor_seller?: string | null
  /** Total number of orders for the seller */
  total_orders?: number | null
  /** Total number of assignments for the seller */
  total_assignments?: number | null
  /** Response rate percentage for the seller */
  response_rate?: number | null
}
export type PhotoUploadResponse = {
  /** Success message */
  result: string
  photos: {
    /** Unique identifier for the uploaded photo */
    resource_id: string
    /** CDN URL for the uploaded photo */
    url: string
  }[]
}
export type NotFound = {
  message: "Not Found"
}
export type BuyOrder = {
  /** Unique buy order ID */
  buy_order_id: string
  /** Game item ID (aggregate) */
  aggregate_id: string
  /** Requested quantity */
  quantity: number
  /** Price per unit */
  price: number
  /** Buyer user summary */
  buyer: MinimalUser
  /** Order expiry timestamp */
  expiry: string
}
export type MarketAggregateComplete = {
  /** Type of the market listing */
  type: "aggregate"
  /** Item details */
  details: object
  /** Game item ID for the aggregate */
  aggregate_id: string
  photos: string[]
  /** List of buy orders for this item */
  buy_orders: BuyOrder[]
  /** List of related listings */
  listings: MarketListingBase[]
}
export type BuyOrderChartDataPoint = {
  /** Highest price during the day */
  high: number
  /** Lowest price during the day */
  low: number
  /** Closing price of the day */
  close: number
  /** Opening price of the day */
  open: number
  /** Unix timestamp for the day */
  timestamp: number
  /** Total quantity of orders during the day */
  volume: number
}
export type GameItemDescription = {
  /** Unique identifier for the game item */
  id: string
  /** Name of the game item */
  name: string
  /** Type/category of the game item */
  type: string
  /** Description of the game item */
  description: string
  /** URL to the item's image */
  image_url?: string | null
}
export const {
  useGetApiMarketStatsQuery,
  useGetMarketListingsStatsMutation,
  usePutApiMarketListingByListingIdMutation,
  usePostApiMarketListingByListingIdUpdateQuantityMutation,
  usePostApiMarketListingByListingIdRefreshMutation,
  useGetApiMarketListingsByListingIdQuery,
  useGetApiMarketListingByListingIdOrdersQuery,
  usePostApiMarketPurchaseMutation,
  usePlaceBidOnAuctionMutation,
  useCreateMarketListingMutation,
  useSearchMarketListingsQuery,
  useUploadListingPhotosMutation,
  useTrackMarketListingViewMutation,
  useGetApiMarketMineQuery,
  useGetUserListingsQuery,
  useGetContractorPublicListingsQuery,
  useGetMarketBuyOrdersQuery,
  useGetGameItemBuyOrderChartQuery,
  useGetGameItemByNameQuery,
  useGetSellerAnalyticsQuery,
} = injectedRtkApi
