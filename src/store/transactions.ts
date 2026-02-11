import { BACKEND_URL } from "../util/constants"
import { Transaction, TransactionBody } from "../datatypes/Transaction"
import { serviceApi } from "./service"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export interface SerializedError {
  error?: string
}

let baseUrl = `${BACKEND_URL}/api/transaction`
// Define a service using a base URL and expected endpoints
export const transactionApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    transactionGetTransactionByID: builder.query<Transaction, string>({
      query: (transaction_id) => `${baseUrl}/${transaction_id}`,
    }),
    transactionCreateContractorTransaction: builder.mutation<
      void,
      { spectrum_id: string; body: TransactionBody }
    >({
      query: ({ spectrum_id, body }) => ({
        url: `${baseUrl}/contractor/${spectrum_id}/create`,
        method: "POST",
        body,
      }),
    }),
    transactionCreateUserTransaction: builder.mutation<void, TransactionBody>({
      query: (body) => ({
        url: `${baseUrl}/create`,
        method: "POST",
        body,
      }),
    }),
    transactionCreateTransaction: builder.mutation<
      void,
      { body: TransactionBody; spectrum_id?: string | null }
    >({
      query: ({ body, spectrum_id }) => ({
        url: spectrum_id ? `/contractor/${spectrum_id}/create` : `/create`,
        method: "POST",
        body,
      }),
    }),
  }),
})

baseUrl = `${BACKEND_URL}/api/transactions`
export const transactionsApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    transactionGetMine: builder.query<Transaction[], void>({
      query: () => `${baseUrl}/mine`,
    }),
    transactionGetTransactionsByContractor: builder.query<
      Transaction[],
      string
    >({
      query: (spectrum_id) => `${baseUrl}/contractor/${spectrum_id}`,
    }),
  }),
})

export const useGetTransactionByIDQuery =
  transactionApi.endpoints.transactionGetTransactionByID.useQuery
export const useGetMyTransactions =
  transactionsApi.endpoints.transactionGetMine.useQuery
export const useGetTransactionsByContractor =
  transactionsApi.endpoints.transactionGetTransactionsByContractor.useQuery
export const useCreateContractorTransaction =
  transactionApi.endpoints.transactionCreateContractorTransaction.useMutation
export const useCreateUserTransaction =
  transactionApi.endpoints.transactionCreateUserTransaction.useMutation
export const useCreateTransaction =
  transactionApi.endpoints.transactionCreateTransaction.useMutation
