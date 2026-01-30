import React from "react"

export const marketDrawerWidth = 360

export const MarketSidebarContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useMarketSidebar = () => {
  const val = React.useContext(MarketSidebarContext)
  if (val == null) {
    throw new Error(
      "Cannot use useMarketSidebar outside of MarketSidebarContext",
    )
  }
  return val
}
export const useMarketSidebarExp = () => {
  const val = React.useContext(MarketSidebarContext)
  if (val == null) {
    return false
  }
  return val[0]
}
