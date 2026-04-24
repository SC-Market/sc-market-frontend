import React from "react"

export const ContractAppOpenContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useContractAppOpen = () => {
  const val = React.useContext(ContractAppOpenContext)
  if (val == null) {
    throw new Error(
      "Cannot use useContractAppOpen outside of ContractAppOpenContext",
    )
  }
  return val
}
