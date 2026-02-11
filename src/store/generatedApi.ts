/**
 * Base API slice for OpenAPI-generated endpoints (src/store/api/*).
 * Codegen injects endpoints here; hand-written feature APIs use serviceApi.
 */
import { BACKEND_URL } from "../util/constants"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export const generatedApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}`,
    credentials: "include",
  }),
  endpoints: () => ({}),
  reducerPath: "generatedApi",
  refetchOnReconnect: true,
  refetchOnFocus: false,
  keepUnusedDataFor: 600,
  tagTypes: [], // Generated slices add their own via enhanceEndpoints
})
