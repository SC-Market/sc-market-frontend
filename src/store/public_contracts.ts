import { serviceApi } from "./service"
import { MinimalUser } from "../datatypes/User"
import { OrderKind, PaymentType } from "../datatypes/Order"
import { unwrapResponse } from "./api-utils"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export interface PublicContract {
  id: string
  title: string
  customer: MinimalUser
  description: string
  kind: OrderKind
  collateral: number
  cost: number
  payment_type: PaymentType
  timestamp: Date
  status: string
  expiration: Date
}

export interface ContractOfferBody {
  contract_id: string
  contractor: string | null
  title: string
  description: string
  kind: string
  collateral: number
  cost: number
  payment_type: PaymentType
}

export interface PublicContractBody {
  title: string
  description: string
  kind: string
  collateral: number
  cost: number
  payment_type: PaymentType
}

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
