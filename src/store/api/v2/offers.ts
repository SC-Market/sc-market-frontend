/**
 * V2 Offers API
 *
 * Read-only V2 serialization of V1 offer sessions, enriched with variant data.
 * Offer creation/acceptance/rejection still goes through V1 endpoints.
 */
import { generatedApi as api } from "../../generatedApi"

export const addTagTypes = ["Offers V2"] as const

const injectedRtkApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (build) => ({
    getOfferSessionV2: build.query<OfferSessionV2, { sessionId: string }>({
      query: ({ sessionId }) => ({ url: `/api/v2/offers/${sessionId}` }),
      providesTags: ["Offers V2"],
    }),
    searchOffersV2: build.query<SearchOffersV2Response, SearchOffersV2Args>({
      query: (args) => ({
        url: `/api/v2/offers/search`,
        params: {
          role: args.role,
          status: args.status,
          page: args.page,
          page_size: args.pageSize,
        },
      }),
      providesTags: ["Offers V2"],
    }),
  }),
  overrideExisting: false,
})

export { injectedRtkApi as v2_offersApi }

export const { useGetOfferSessionV2Query, useSearchOffersV2Query } =
  injectedRtkApi

// Types

export interface UserSummary {
  user_id: string
  username: string
  display_name?: string
  avatar?: string | null
}

export interface OrgSummary {
  contractor_id: string
  spectrum_id: string
  name: string
  avatar?: string | null
}

export interface OfferVariantItem {
  variant_id: string
  quantity: number
  price_per_unit: number
  attributes: Record<string, any>
  display_name: string
  short_name: string
}

export interface OfferMarketListingV2 {
  listing_id: string
  quantity: number
  title: string
  price: number
  v2_variants: OfferVariantItem[]
}

export interface OfferV2 {
  offer_id: string
  kind: string
  cost: number
  title: string
  description: string
  payment_type: string
  status: string
  created_at: string
  actor_id: string
  market_listings: OfferMarketListingV2[]
  service?: { service_id: string; title: string } | null
}

export interface OfferSessionV2 {
  session_id: string
  status: string
  created_at: string
  order_id?: string
  discord_invite?: string | null
  customer: UserSummary
  seller: UserSummary | OrgSummary | null
  offers: OfferV2[]
}

export interface SearchOffersV2Response {
  offers: OfferSessionV2[]
  total: number
  page: number
  page_size: number
}

export interface SearchOffersV2Args {
  role?: "customer" | "seller"
  status?: "active" | "closed"
  page?: number
  pageSize?: number
}
