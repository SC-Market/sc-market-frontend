import React from "react"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';

export interface ContractSearchState {
  kind?: string | undefined
  // type?: string | undefined,
  minOffer?: number
  maxOffer?: number | null
  // quantityAvailable?: number
  query: string
  paymentType?: string
  sort?: string
}

export const ContractSearchContext = React.createContext<
  | [
      ContractSearchState,
      React.Dispatch<React.SetStateAction<ContractSearchState>>,
    ]
  | null
>(null)

export const useContractSearch = () => {
  const val = React.useContext(ContractSearchContext)
  if (val == null) {
    throw new Error(
      "Cannot use useContractSearch outside of ContractSearchContext",
    )
  }
  return val
}
