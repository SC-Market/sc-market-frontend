import { BACKEND_URL } from "../../../util/constants"
import { serviceApi } from "../../../store/service"
import { unwrapResponse } from "../../../store/api-utils"
import { Contractor } from "../../../datatypes/Contractor"
import type {
  ApiToken,
  CreateTokenRequest,
  UpdateTokenRequest,
  TokenStats,
  ExtendTokenRequest,
} from "../domain/types"

// Re-export types for convenience
export type {
  ApiToken,
  CreateTokenRequest,
  UpdateTokenRequest,
  TokenStats,
  ExtendTokenRequest,
} from "../domain/types"

const baseUrl = `${BACKEND_URL}/api`

/**
 * API Tokens API endpoints
 */
export const tokensApi = serviceApi.injectEndpoints({
  overrideExisting: false,
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

// Export hooks for usage in functional components
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
