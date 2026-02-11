import { BACKEND_URL } from "../util/constants"
import { Commodity } from "../datatypes/Commodity"
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

const baseUrl = `${BACKEND_URL}/api/commodities`
// Define a service using a base URL and expected endpoints
export const commodityApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    commoditiesGetCommodities: builder.query<
      { status: string; data: Commodity[] },
      void
    >({
      query: () => `${baseUrl}`,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const useGetCommoditiesQuery =
  commodityApi.endpoints.commoditiesGetCommodities.useQuery
