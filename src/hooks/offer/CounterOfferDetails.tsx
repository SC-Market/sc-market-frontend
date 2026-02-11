import React from "react"
import { CounterOfferBody } from "../../store/offer"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const CounterOfferDetailsContext = React.createContext<
  | [CounterOfferBody, React.Dispatch<React.SetStateAction<CounterOfferBody>>]
  | null
>(null)

export const useCounterOffer = () => {
  const val = React.useContext(CounterOfferDetailsContext)
  if (val == null) {
    throw new Error(
      "Cannot use useCounterOffer outside of CounterOfferDetailsContext",
    )
  }
  return val
}
