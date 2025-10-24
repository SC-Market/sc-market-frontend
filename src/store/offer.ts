import { serviceApi } from "./service"
import { MinimalUser } from "../datatypes/User"
import { MinimalContractor } from "../datatypes/Contractor"
import { OrderAvailability, Service } from "../datatypes/Order"
import { UniqueListing } from "../datatypes/MarketListing"
import { unwrapResponse } from "./orders"

export interface OfferSessionStub {
  id: string
  contractor: MinimalContractor | null
  assigned_to: MinimalUser | null
  customer: MinimalUser
  status: string
  timestamp: string
  most_recent_offer: {
    service_name: string | null
    cost: string
    title: string
    payment_type: string
    count: number
  }
}

export interface OfferSession {
  id: string
  contractor: MinimalContractor | null
  assigned_to: MinimalUser | null
  customer: MinimalUser
  status: string
  timestamp: string
  offers: Offer[]
  contract_id?: string | null
  discord_thread_id: string | null
  discord_server_id: string | null
  availability: OrderAvailability
  order_id?: string | null
}

export interface Offer {
  id: string
  session_id: string
  actor: MinimalUser | null
  kind: string
  cost: string
  title: string
  description: string
  timestamp: string
  status: string
  collateral?: string | number | null
  service: Service | null
  market_listings: OfferMarketListing[]
  payment_type: "one-time" | "hourly" | "daily"
}

export interface CounterOfferBody {
  session_id: string
  title: string
  kind: string
  cost: string
  description: string
  service_id: string | null
  market_listings: { listing_id: string; quantity: number }[]
  payment_type: string
  status: "counteroffered"
}

export interface OfferMarketListing {
  quantity: number
  listing_id: string
  listing: UniqueListing
}

export type OfferSearchSortMethod =
  | "title"
  | "customer_name"
  | "status"
  | "timestamp"
  | "contractor_name"

export const OFFER_SEARCH_SORT_METHODS = [
  "title",
  "customer_name",
  "status",
  "timestamp",
  "contractor_name",
]

export type OfferSearchStatus =
  | "to-seller"
  | "to-customer"
  | "accepted"
  | "rejected"

export const OFFER_SEARCH_STATUS = [
  "to-seller",
  "to-customer",
  "accepted",
  "rejected",
]

export interface OfferSearchQuery {
  sort_method?: OfferSearchSortMethod
  status?: OfferSearchStatus
  assigned?: string
  contractor?: string
  customer?: string
  index?: number
  page_size?: number
  reverse_sort?: boolean
}

export const offersApi = serviceApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceivedOffers: builder.query<OfferSessionStub[], void>({
      query: () => `/api/offers/received`,
      providesTags: ["Offers" as const],
      transformResponse: unwrapResponse,
    }),
    getReceivedOffersOrg: builder.query<OfferSessionStub[], string>({
      query: (spectrum_id) => `/api/offers/contractor/${spectrum_id}/received`,
      providesTags: ["Offers" as const],
      transformResponse: unwrapResponse,
    }),
    getSentOffers: builder.query<OfferSessionStub[], void>({
      query: () => `/api/offers/sent`,
      providesTags: ["Offers" as const],
      transformResponse: unwrapResponse,
    }),
    getOfferSessionByID: builder.query<OfferSession, string>({
      query: (id) => `/api/offer/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "Offer" as const, id: id },
        "Offer" as const,
      ],
      transformResponse: unwrapResponse,
    }),
    searchOfferSessions: builder.query<
      {
        items: OfferSessionStub[]
        item_counts: {
          "to-seller": number
          "to-customer": number
          accepted: number
          rejected: number
        }
      },
      OfferSearchQuery
    >({
      query: (queryParams) => ({
        url: `/api/offers/search`,
        params: queryParams,
      }),
      // providesTags: (_result, _error, id) => [
      //   { type: "Offer" as const, id: id },
      //   "Offer" as const,
      // ],
      transformResponse: unwrapResponse,
    }),
    updateOfferStatus: builder.mutation<
      { order_id?: string },
      { session_id: string; status: string }
    >({
      query: ({ session_id, status }) => ({
        url: `/api/offer/${session_id}`,
        body: { status },
        method: "PUT",
      }),
      invalidatesTags: (result, error, { session_id, status }) => [
        { type: "Offer" as const, id: session_id },
        "Orders" as const,
        "Offers" as const,
      ],
      transformResponse: unwrapResponse,
    }),
    counterOffer: builder.mutation<void, CounterOfferBody>({
      query: (body) => ({
        url: `/api/offer/${body.session_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: "Offer" as const, id: body.session_id },
        "Offers" as const,
      ],
      transformResponse: unwrapResponse,
    }),
    createOfferThread: builder.mutation<void, string>({
      query: (session_id) => ({
        url: `/api/offers/${session_id}/thread`,
        method: "POST",
      }),
      invalidatesTags: (result, error, session_id) => [
        {
          type: "Offer" as const,
          id: session_id,
        },
        "Offer" as const,
      ],
      transformResponse: unwrapResponse,
    }),
  }),
})

export const {
  useGetOfferSessionByIDQuery,
  useUpdateOfferStatusMutation,
  useCounterOfferMutation,
  useCreateOfferThreadMutation,
  useSearchOfferSessionsQuery,
} = offersApi
