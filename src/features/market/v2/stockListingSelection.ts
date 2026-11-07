import { GridRowSelectionModel } from "@mui/x-data-grid"
import React, { createContext, useContext } from "react"

export const STOCK_PAGE_SIZE_OPTIONS: readonly number[] = [24, 48, 96]

/* ── Types ── */

export interface NewListingRowV2 {
  id: string
  game_item_id: string | null
  game_item_name: string | null
  price: number
  quantity_available: number
  status: "active" | "inactive"
  isNew: boolean
}

/* ── Listing selection (bulk actions) ── */

export const ListingSelectionContext = createContext<
  | [
      GridRowSelectionModel,
      React.Dispatch<React.SetStateAction<GridRowSelectionModel>>,
    ]
  | null
>(null)

/** The selection state from StockManagerV2. Both consumers render inside its provider. */
export function useListingSelection() {
  const ctx = useContext(ListingSelectionContext)
  if (!ctx)
    throw new Error(
      "useListingSelection must be used inside ListingSelectionContext",
    )
  return ctx
}
