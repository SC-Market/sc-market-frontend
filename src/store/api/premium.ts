import { serviceApi } from "../service"
import { unwrapResponse } from "../api-utils"

export interface PremiumTier {
  id: string
  spectrum_id: string
  tier: string
  custom_domain: string | null
  granted_by: string
  granted_at: string
  revoked_at: string | null
  contractor_name?: string
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
      query: (spectrum_id) => `${baseUrl}/${spectrum_id}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg },
      ],
    }),
    setOrgPremium: builder.mutation<
      PremiumTier,
      { spectrum_id: string; tier: string; custom_domain?: string | null }
    >({
      query: ({ spectrum_id, ...body }) => ({
        url: `${baseUrl}/${spectrum_id}`,
        method: "PUT",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: ["Contractor" as const],
    }),
    revokeOrgPremium: builder.mutation<{ message: string }, string>({
      query: (spectrum_id) => ({
        url: `${baseUrl}/${spectrum_id}`,
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
