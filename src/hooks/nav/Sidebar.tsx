import React from "react"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const SidebarContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useSidebar = () => {
  const val = React.useContext(SidebarContext)
  if (val == null) {
    throw new Error("Cannot use useSidebar outside of SidebarContext")
  }
  return val
}
