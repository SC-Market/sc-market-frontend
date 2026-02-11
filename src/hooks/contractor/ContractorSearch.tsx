import React from "react"
import { ContractorKindIconKey } from "../../views/contractor/ContractorList"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export interface ContractorSearchState {
  fields: ContractorKindIconKey[]
  rating: number
  query: string
  sorting: string
  language_codes?: string[]
}

export const ContractorSearchContext = React.createContext<
  | [
      ContractorSearchState,
      React.Dispatch<React.SetStateAction<ContractorSearchState>>,
    ]
  | null
>(null)

export const useContractorSearch = () => {
  const val = React.useContext(ContractorSearchContext)
  if (val == null) {
    throw new Error(
      "Cannot use useContractorSearch outside of ContractorSearchContext",
    )
  }
  return val
}
