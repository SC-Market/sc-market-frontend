import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_URL } from "../util/constants"
import { Contractor } from "../datatypes/Contractor"
import { unwrapResponse } from "./orders"

const baseUrl = `${BACKEND_URL}/api`

export interface ApiToken {
  id: string
  name: string
  description?: string
  scopes: string[]
  contractor_spectrum_ids: string[]
  expires_at?: string
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface CreateTokenRequest {
  name: string
  description?: string
  scopes: string[]
  contractor_spectrum_ids?: string[]
  expires_at?: string
}

export interface UpdateTokenRequest {
  name?: string
  description?: string
  scopes?: string[]
  contractor_spectrum_ids?: string[]
  expires_at?: string
}

export interface TokenStats {
  id: string
  name: string
  created_at: string
  last_used_at?: string
  expires_at?: string
  is_expired: boolean
  days_until_expiry?: number
  usage_count?: number
}

export interface ExtendTokenRequest {
  expires_at: string
}

export const tokensApi = createApi({
  reducerPath: "tokensApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  tagTypes: ["ApiToken"],
  endpoints: (builder) => ({
    // Get all tokens for the current user
    getTokens: builder.query<ApiToken[], void>({
      query: () => "/tokens",
      transformResponse: unwrapResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ApiToken" as const, id })),
              { type: "ApiToken", id: "LIST" },
            ]
          : [{ type: "ApiToken", id: "LIST" }],
    }),

    // Get a specific token
    getToken: builder.query<ApiToken, string>({
      query: (tokenId) => `/tokens/${tokenId}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, tokenId) => [
        { type: "ApiToken", id: tokenId },
      ],
    }),

    // Create a new token
    createToken: builder.mutation<
      { token: string; data: ApiToken },
      CreateTokenRequest
    >({
      query: (body) => ({
        url: "/tokens",
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [{ type: "ApiToken", id: "LIST" }],
    }),

    // Update a token
    updateToken: builder.mutation<
      ApiToken,
      { tokenId: string; body: UpdateTokenRequest }
    >({
      query: ({ tokenId, body }) => ({
        url: `/tokens/${tokenId}`,
        method: "PUT",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, { tokenId }) => [
        { type: "ApiToken", id: tokenId },
        { type: "ApiToken", id: "LIST" },
      ],
    }),

    // Delete a token
    deleteToken: builder.mutation<void, string>({
      query: (tokenId) => ({
        url: `/tokens/${tokenId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, tokenId) => [
        { type: "ApiToken", id: tokenId },
        { type: "ApiToken", id: "LIST" },
      ],
    }),

    // Extend token expiration
    extendToken: builder.mutation<
      ApiToken,
      { tokenId: string; body: ExtendTokenRequest }
    >({
      query: ({ tokenId, body }) => ({
        url: `/tokens/${tokenId}/extend`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, { tokenId }) => [
        { type: "ApiToken", id: tokenId },
        { type: "ApiToken", id: "LIST" },
      ],
    }),

    // Get token statistics
    getTokenStats: builder.query<TokenStats, string>({
      query: (tokenId) => `/tokens/${tokenId}/stats`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, tokenId) => [
        { type: "ApiToken", id: tokenId },
      ],
    }),

    // Get contractors for token creation
    getContractorsForTokens: builder.query<Contractor[], void>({
      query: () => "/contractors",
      transformResponse: (response: { data: Contractor[] }) => response.data,
    }),
  }),
})

export const {
  useGetTokensQuery,
  useGetTokenQuery,
  useCreateTokenMutation,
  useUpdateTokenMutation,
  useDeleteTokenMutation,
  useExtendTokenMutation,
  useGetTokenStatsQuery,
  useGetContractorsForTokensQuery,
} = tokensApi
