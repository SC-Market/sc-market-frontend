import { serviceApi } from "./service"
import { MinimalUser } from "../datatypes/User"
import { MinimalContractor } from "../datatypes/Contractor"
import { OrderAvailability, Service } from "../datatypes/Order"
import { UniqueListing } from "../features/market"
import { unwrapResponse } from "./api-utils"
import {
  generateTempId,
  createOptimisticUpdate,
} from "../util/optimisticUpdates"

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
  discord_invite: string | null
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
  buyer_username?: string
  seller_username?: string
  has_market_listings?: boolean
  has_service?: boolean
  cost_min?: number
  cost_max?: number
  date_from?: string
  date_to?: string
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
      query: (queryParams) => {
        // Convert boolean filters to strings for query params
        const params: any = { ...queryParams }
        if (params.has_market_listings !== undefined) {
          params.has_market_listings = String(params.has_market_listings)
        }
        if (params.has_service !== undefined) {
          params.has_service = String(params.has_service)
        }
        return {
          url: `/api/offers/search`,
          params,
        }
      },
      providesTags: ["Offers" as const, "Offer" as const],
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
      async onQueryStarted(body, { dispatch, queryFulfilled, getState }) {
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: any[] = []

            // Optimistically update offer session
            const sessionPatch = dispatch(
              offersApi.util.updateQueryData(
                "getOfferSessionByID",
                body.session_id,
                (draft) => {
                  // Add new offer to the session
                  const newOffer: Offer = {
                    id: generateTempId("offer"),
                    session_id: body.session_id,
                    actor: null, // Will be filled by server
                    kind: body.kind,
                    cost: body.cost,
                    title: body.title,
                    description: body.description,
                    timestamp: new Date().toISOString(),
                    status: body.status,
                    service: null, // Will be filled by server if service_id provided
                    market_listings: body.market_listings.map((ml) => ({
                      quantity: ml.quantity,
                      listing_id: ml.listing_id,
                      listing: {} as UniqueListing, // Will be filled by server
                    })),
                    payment_type: body.payment_type as any,
                  }
                  draft.offers.push(newOffer)
                  draft.status = body.status
                },
              ),
            )
            patches.push(sessionPatch)

            // Optimistically update search results
            const state = getState() as any
            const cachedQueries = state.api?.queries || {}

            Object.keys(cachedQueries).forEach((queryKey) => {
              if (queryKey.includes("searchOfferSessions")) {
                try {
                  const queryData = cachedQueries[queryKey]
                  if (queryData?.data?.items) {
                    const searchPatch = dispatch(
                      offersApi.util.updateQueryData(
                        "searchOfferSessions",
                        queryData.originalArgs || {},
                        (draft) => {
                          const sessionIndex = draft.items.findIndex(
                            (s) => s.id === body.session_id,
                          )
                          if (sessionIndex !== -1) {
                            const session = draft.items[sessionIndex]
                            // Update most recent offer info
                            session.most_recent_offer = {
                              service_name: body.service_id ? null : null, // Will be filled by server
                              cost: body.cost,
                              title: body.title,
                              payment_type: body.payment_type,
                              count:
                                (session.most_recent_offer?.count || 0) + 1,
                            }
                            // Note: Counter offer status is "counteroffered" which doesn't map directly
                            // to search statuses. The server will update the actual status.
                            // We'll just update the offer count and let the server response handle status.
                          }
                        },
                      ),
                    )
                    patches.push(searchPatch)
                  }
                } catch (e) {
                  // Ignore errors updating individual cached queries
                }
              }
            })

            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
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
    mergeOfferSessions: builder.mutation<
      {
        result: string
        merged_offer_session: OfferSession
        source_offer_session_ids: string[]
        message: string
      },
      { offer_session_ids: string[] }
    >({
      query: ({ offer_session_ids }) => ({
        url: `/api/offers/merge`,
        method: "POST",
        body: { offer_session_ids },
      }),
      invalidatesTags: (result, error, arg) => {
        const mergedId = result?.merged_offer_session?.id
        return [
          ...arg.offer_session_ids.map((id) => ({
            type: "Offer" as const,
            id,
          })),
          mergedId ? ({ type: "Offer" as const, id: mergedId } as const) : null,
          "Offers" as const,
          "Offer" as const,
        ].filter(Boolean) as
          | { type: "Offer"; id?: string }[]
          | ("Offers" | "Offer")[]
      },
      transformResponse: unwrapResponse,
    }),
    assignOffer: builder.mutation<
      void,
      {
        session_id: string
        user_id: string
      }
    >({
      query: (arg) => ({
        url: `/api/offer/${arg.session_id}`,
        method: "PUT",
        body: { assigned_to: arg.user_id },
      }),
      invalidatesTags: (result, error, { session_id }) => [
        { type: "Offer" as const, id: session_id },
        "Offer" as const,
        "Offers" as const,
        "Chat" as const,
      ],
      transformResponse: unwrapResponse,
    }),
    unassignOffer: builder.mutation<
      void,
      {
        session_id: string
      }
    >({
      query: (arg) => ({
        url: `/api/offer/${arg.session_id}`,
        method: "PUT",
        body: { assigned_to: null },
      }),
      invalidatesTags: (result, error, { session_id }) => [
        { type: "Offer" as const, id: session_id },
        "Offer" as const,
        "Offers" as const,
        "Chat" as const,
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
  useMergeOfferSessionsMutation,
  useAssignOfferMutation,
  useUnassignOfferMutation,
} = offersApi
