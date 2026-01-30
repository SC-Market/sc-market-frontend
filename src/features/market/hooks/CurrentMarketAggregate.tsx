import React from "react"
import type { MarketAggregate } from "../domain/types"

export const CurrentMarketAggregateContext = React.createContext<
  [MarketAggregate, () => void] | null
>(null)

export const useCurrentMarketAggregate = () => {
  const val = React.useContext(CurrentMarketAggregateContext)
  if (val == null) {
    throw new Error(
      "Cannot use useCurrentMarketAggregate outside of CurrentMarketAggregateContext",
    )
  }
  return val
}
