import React from "react"
import type { Order } from "../domain/types"

export const CurrentOrderContext = React.createContext<
  [Order, () => void] | null
>(null)

export const useCurrentOrder = () => {
  const val = React.useContext(CurrentOrderContext)
  if (val == null) {
    throw new Error("Cannot use useCurrentOrder outside of CurrentOrderContext")
  }
  return val
}
