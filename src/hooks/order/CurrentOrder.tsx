import React from "react"
import { Order } from "../../datatypes/Order"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const CurrentOrderContext = React.createContext<
  [Order, () => void] | null
>(null)

export const useCurrentOrder = () => {
  const val = React.useContext(CurrentOrderContext)
  if (val == null) {
    throw new Error("Cannot use useCurrentOrder outside of CurrentOrderContext")
  }
  return val
}
