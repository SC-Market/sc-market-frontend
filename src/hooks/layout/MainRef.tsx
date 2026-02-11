import React from "react"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const MainRefContext =
  React.createContext<React.RefObject<HTMLDivElement | null> | null>(null)

export const useMainRef = () => {
  const val = React.useContext(MainRefContext)
  if (val == null) {
    throw new Error("Cannot use useMainRef outside of DrawerWidthContext")
  }
  return val
}
