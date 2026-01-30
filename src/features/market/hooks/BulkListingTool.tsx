import React from "react"
import type { MarketListingBody } from "../domain/types"

export const BulkListingToolContext = React.createContext<
  | [
      Map<string, Partial<MarketListingBody>>,
      React.Dispatch<
        React.SetStateAction<Map<string, Partial<MarketListingBody>>>
      >,
    ]
  | null
>(null)

export const useBulkListingTool = () => {
  const val = React.useContext(BulkListingToolContext)
  if (val == null) {
    throw new Error(
      "Cannot use useBulkListingTool outside of BulkListingToolContext",
    )
  }
  return val
}
