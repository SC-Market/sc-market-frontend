import React from "react"

export const contractDrawerWidth = 360

export const ContractSidebarContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useContractSidebar = () => {
  const val = React.useContext(ContractSidebarContext)
  if (val == null) {
    throw new Error(
      "Cannot use useContractSidebar outside of ContractSidebarContext",
    )
  }
  return val
}
