import React from "react"
import { ContractorKindIconKey } from "../../views/contractor/ContractorList"

export interface ContractorSearchState {
  fields: ContractorKindIconKey[]
  rating: number
  query: string
  sorting: string
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
