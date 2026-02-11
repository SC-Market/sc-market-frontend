import { BACKEND_URL } from "../util/constants"
import { serviceApi } from "./service"
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

const apiBase = "/api"

/**
 * Organization/Contractor info for preferences
 */
export interface UserOrganization {
  contractor_id: string
  name: string
}

/**
 * Organizations API endpoints
 */
export const organizationsApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get user's organizations
    getUserOrganizations: builder.query<UserOrganization[], void>({
      query: () => ({
        url: `${apiBase}/profile/organizations`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: { organizations: UserOrganization[] }
      }) => {
        return unwrapResponse(response).organizations
      },
      providesTags: ["UserOrganizations" as const],
    }),
  }),
})

// Export hooks for usage in functional components
export const { useGetUserOrganizationsQuery } = organizationsApi
