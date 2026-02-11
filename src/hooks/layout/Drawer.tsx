import React from "react"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const sidebarDrawerWidth = 280

export const DrawerOpenContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useDrawerOpen = () => {
  const val = React.useContext(DrawerOpenContext)
  if (val == null) {
    throw new Error("Cannot use useDrawerWidth outside of DrawerWidthContext")
  }
  return val
}
