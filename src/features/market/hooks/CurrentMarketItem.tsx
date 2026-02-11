import React from "react"
import type { MarketListingType } from "../domain/types"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export const CurrentMarketListingContext = React.createContext<
  [MarketListingType, () => void] | null
>(null)

export function useCurrentMarketListing<T>() {
  const val = React.useContext(CurrentMarketListingContext)
  if (val == null) {
    throw new Error(
      "Cannot use useCurrentMarketListing outside of CurrentMarketListingContext",
    )
  }
  return [val[0] as T, val[1]] as const
}
