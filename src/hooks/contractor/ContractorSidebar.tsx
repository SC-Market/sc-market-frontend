import React from "react"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const contractorDrawerWidth = 360

export const ContractorSidebarContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useContractorSidebar = () => {
  const val = React.useContext(ContractorSidebarContext)
  if (val == null) {
    throw new Error(
      "Cannot use useContractorSidebar outside of ContractorSidebarContext",
    )
  }
  return val
}
