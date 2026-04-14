import { serviceApi } from "../service"
import { unwrapResponse } from "../api-utils"

export interface PremiumTier {
  id: string
  contractor_id: string
  tier: string
  granted_by: string
  granted_at: string
  revoked_at: string | null
  contractor_name?: string
  spectrum_id?: string
}

export interface PremiumListResponse {
  items: PremiumTier[]
  total: number
  page: number
  page_size: number
}

const baseUrl = "/api/admin/premium"

export const premiumApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getPremiumOrgs: builder.query<
      PremiumListResponse,
      { page?: number; page_size?: number }
    >({
      query: (params) => ({ url: baseUrl, params }),
      transformResponse: unwrapResponse,
      providesTags: ["Contractor" as const],
    }),
    getOrgPremium: builder.query<PremiumTier, string>({
      query: (contractor_id) => `${baseUrl}/${contractor_id}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg },
      ],
    }),
    setOrgPremium: builder.mutation<
      PremiumTier,
      { contractor_id: string; tier: string }
    >({
      query: ({ contractor_id, tier }) => ({
        url: `${baseUrl}/${contractor_id}`,
        method: "PUT",
        body: { tier },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: ["Contractor" as const],
    }),
    revokeOrgPremium: builder.mutation<{ message: string }, string>({
      query: (contractor_id) => ({
        url: `${baseUrl}/${contractor_id}`,
        method: "DELETE",
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: ["Contractor" as const],
    }),
  }),
})

export const {
  useGetPremiumOrgsQuery,
  useGetOrgPremiumQuery,
  useSetOrgPremiumMutation,
  useRevokeOrgPremiumMutation,
} = premiumApi
