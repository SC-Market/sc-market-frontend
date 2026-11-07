import type { ListingDraftIssue } from "../domain/listingDraft"
import type { QuickListBatch, QuickListForm } from "../domain/quickList"

/** Where an error shows: next to its field, or above the actions. */
export type QuickListField =
  | "item"
  | "price"
  | "quantity"
  | "batches"
  | "auction_end_time"
  | "form"

export interface QuickListError {
  field: QuickListField
  message: string
}

export function issueField(
  issue: ListingDraftIssue,
  form: QuickListForm,
): QuickListField {
  switch (issue.code) {
    case "gameItemRequired":
    case "titleRequired":
    case "titleTooLong":
      return "item"
    case "basePriceRequired":
      return "price"
    case "stockLotRequired":
    case "quantityRequired":
    case "qualityTierRange":
    case "qualityValueRange":
    case "variantPriceRequired":
      return form.stockMode === "simple" ? "quantity" : "batches"
    case "auctionEndTimeRequired":
      return "auction_end_time"
  }
}

export const TIERS = [1, 2, 3, 4, 5] as const

export function newBatch(): QuickListBatch {
  return { key: crypto.randomUUID(), quantity: 1 }
}
