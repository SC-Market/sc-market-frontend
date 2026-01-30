import { serviceApi as api } from "../service"
export const addTagTypes = ["Offers"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createOfferThread: build.mutation<
        CreateOfferThreadApiResponse,
        CreateOfferThreadApiArg
      >({
        query: (queryArg) => ({
          url: `/api/offers/${queryArg.sessionId}/thread`,
          method: "POST",
        }),
        invalidatesTags: ["Offers"],
      }),
      searchOffers: build.query<SearchOffersApiResponse, SearchOffersApiArg>({
        query: (queryArg) => ({
          url: `/api/offers/search`,
          params: {
            contractor: queryArg.contractor,
            assigned: queryArg.assigned,
            customer: queryArg.customer,
            sort_method: queryArg.sortMethod,
            status: queryArg.status,
            index: queryArg.index,
            page_size: queryArg.pageSize,
            reverse_sort: queryArg.reverseSort,
            buyer_username: queryArg.buyerUsername,
            seller_username: queryArg.sellerUsername,
            has_market_listings: queryArg.hasMarketListings,
            has_service: queryArg.hasService,
            cost_min: queryArg.costMin,
            cost_max: queryArg.costMax,
            date_from: queryArg.dateFrom,
            date_to: queryArg.dateTo,
          },
        }),
        providesTags: ["Offers"],
      }),
      mergeOfferSessions: build.mutation<
        MergeOfferSessionsApiResponse,
        MergeOfferSessionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/offers/merge`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Offers"],
      }),
      getOfferById: build.query<GetOfferByIdApiResponse, GetOfferByIdApiArg>({
        query: (queryArg) => ({ url: `/api/offer/${queryArg.sessionId}` }),
        providesTags: ["Offers"],
      }),
      updateAnOffer: build.mutation<
        UpdateAnOfferApiResponse,
        UpdateAnOfferApiArg
      >({
        query: (queryArg) => ({
          url: `/api/offer/${queryArg.sessionId}`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["Offers"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as offersApi }
export type CreateOfferThreadApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type CreateOfferThreadApiArg = {
  /** The ID of the offer */
  sessionId: string
}
export type SearchOffersApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: {
      items?: OrderStub[]
      item_count?: number
    }
  }
export type SearchOffersApiArg = {
  /** The Spectrum ID of the contracting org */
  contractor?: string
  /** The assigned user's username */
  assigned?: string
  /** The customer's username */
  customer?: string
  /** The method to sort results by */
  sortMethod?:
    | "title"
    | "customer_name"
    | "status"
    | "timestamp"
    | "contractor_name"
  /** The current status of the order */
  status?: "to-seller" | "to-customer" | "accepted" | "rejected"
  /** The page index of the search */
  index?: number
  /** The page size for the search */
  pageSize?: number
  /** Whether to reverse the sort */
  reverseSort?: boolean
  /** Filter by buyer (customer) username (for seller view) */
  buyerUsername?: string
  /** Filter by seller username (contractor spectrum_id or assigned user username) (for buyer view) */
  sellerUsername?: string
  /** Filter offers that have market listings attached */
  hasMarketListings?: boolean
  /** Filter offers that have a service attached */
  hasService?: boolean
  /** Minimum cost filter */
  costMin?: number
  /** Maximum cost filter */
  costMax?: number
  /** Filter offers created after this date (ISO 8601 format) */
  dateFrom?: string
  /** Filter offers created before this date (ISO 8601 format) */
  dateTo?: string
}
export type MergeOfferSessionsApiResponse =
  /** status 200 OK - Offer sessions successfully merged */ {
    data: {
      result: string
      /** The new merged offer session */
      merged_offer_session: object
      /** IDs of the offer sessions that were merged */
      source_offer_session_ids: string[]
      message: string
    }
  }
export type MergeOfferSessionsApiArg = {
  body: {
    /** Array of offer session IDs to merge (minimum 2) */
    offer_session_ids: string[]
  }
}
export type GetOfferByIdApiResponse =
  /** status 200 OK - Successful request with response body */ OfferSessionDetails
export type GetOfferByIdApiArg = {
  sessionId: string
}
export type UpdateAnOfferApiResponse =
  /** status 200 OK - Resource successfully updated */ {
    data: {}
  }
export type UpdateAnOfferApiArg = {
  sessionId: string
  body:
    | CounterOfferBody
    | {
        status?: OfferStatus
      }
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
export type Conflict = {
  message: "Conflict"
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
export type Rating = {
  avg_rating: number
  rating_count: number
  streak: number
  total_orders: number
}
export type MinimalContractor = {
  avatar: string
  name: string
  spectrum_id: string
  rating: Rating
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
export type OrderStatus =
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled"
export type OrderStub = {
  order_id: string
  contractor: MinimalContractor
  assigned_to: MinimalUser
  customer: MinimalUser
  status: OrderStatus
  timestamp: string
  service_name: string | null
  cost: number
  title: string
  payment_type:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
  count: number
}
export type NotFound = {
  message: "Not Found"
}
export type OfferSessionStatus = "closed" | "open"
export type OfferStatus =
  | "rejected"
  | "accepted"
  | "counteroffered"
  | "cancelled"
export type ServiceStatus = "active" | "inactive"
export type Order = {
  service_id?: string
  service_name?: string
  service_description?: string
  title: string
  rush: boolean
  description: string
  kind: string
  collateral?: number
  offer?: number
  payment_type: "one-time" | "daily" | "hourly"
  departure?: string | null
  destination?: string | null
  cost: number
  user?: string | null
  contractor: string | null
  status: ServiceStatus
  timestamp: string
  photos?: string[]
}
export type OfferBodyMarketListing = {
  quantity: number
  listing_id: string
}
export type Offer = {
  id?: string
  session_id?: string
  actor?: MinimalUser
  kind?: string
  cost?: number
  title?: string
  description?: string
  timestamp?: string
  status?: OfferStatus
  collateral?: number | null
  service?: Order
  market_listings?: OfferBodyMarketListing[]
  payment_type?:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
}
export type OfferSessionDetails = {
  id?: string
  status?: OfferSessionStatus
  contractor?: MinimalContractor
  assigned_to?: MinimalUser
  customer?: MinimalUser
  discord_thread_id?: string | null
  discord_server_id?: string | null
  discord_invite?: string | null
  contract_id?: string | null
  /** Order ID associated with this offer session when status is 'Accepted' */
  order_id?: string | null
  offers?: Offer[]
  timestamp?: string
}
export type CounterOfferBody = {
  session_id?: string
  title?: string
  kind?: string
  cost?: number
  description?: string
  timestamp?: string
  service_id?: string | null
  market_listings?: OfferBodyMarketListing[]
  payment_type?:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
  status?: "counteroffered"
}
export const {
  useCreateOfferThreadMutation,
  useSearchOffersQuery,
  useMergeOfferSessionsMutation,
  useGetOfferByIdQuery,
  useUpdateAnOfferMutation,
} = injectedRtkApi
