import { serviceApi } from "../../../store/service"
import { MinimalUser } from "../../../datatypes/User"
import { OrderKind, PaymentType } from "../../orders/domain/types"
import { unwrapResponse } from "../../../store/api-utils"

// Re-export domain types for backward compatibility
export type { PublicContract, ContractOfferBody, PublicContractBody } from "../domain/types"

import type { PublicContract, ContractOfferBody, PublicContractBody } from "../domain/types"

export const publicContractsApi = serviceApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicContract: builder.query<PublicContract, string>({
      query: (arg) => `/api/contracts/${arg}`,
      providesTags: (result, error, arg) => [
        "PublicContracts" as const,
        { type: "PublicContracts" as const, id: arg },
      ],
      transformResponse: unwrapResponse,
    }),
    getPublicContracts: builder.query<PublicContract[], void>({
      query: () => `/api/contracts`,
      providesTags: ["PublicContracts" as const],
      transformResponse: unwrapResponse,
    }),
    createContractOffer: builder.mutation<
      { session_id: string },
      ContractOfferBody
    >({
      query: ({ contract_id, ...body }) => ({
        url: `/api/contracts/${contract_id}/offers`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
    }),
    createPublicContract: builder.mutation<
      { contract_id: string },
      PublicContractBody
    >({
      query: (body) => ({
        url: `/api/contracts`,
        method: "POST",
        body,
      }),
      // Note: No optimistic update here because:
      // 1. This operation redirects to /contracts/public/{contract_id} which requires the real contract_id from server
      // 2. The user is immediately redirected away, so they won't see the list update
      // 3. Optimistic updates for redirecting operations can cause navigation to non-existent resources
      transformResponse: unwrapResponse,
    }),
  }),
})

export const {
  useGetPublicContractQuery,
  useGetPublicContractsQuery,
  useCreateContractOfferMutation,
  useCreatePublicContractMutation,
} = publicContractsApi
