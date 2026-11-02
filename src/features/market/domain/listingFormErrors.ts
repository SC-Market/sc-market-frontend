/**
 * Errors for the create/edit listing forms, shown next to the field they are
 * about (not only in a toast that disappears).
 */
import type { StandardErrorResponse } from "../../../store/api-types"

/** The form fields an error can point at; "form" is everything else. */
export type ListingFormField =
  | "game_item_id"
  | "title"
  | "description"
  | "base_price"
  | "quantity"
  | "auction_end_time"
  | "form"

export interface ListingFormError {
  field: ListingFormField
  message: string
}

/** DOM id of each field's input, so the form can scroll to and focus it. */
export const LISTING_FIELD_IDS: Record<Exclude<ListingFormField, "form">, string> = {
  game_item_id: "game-item-search",
  title: "listing-title",
  description: "listing-description",
  base_price: "listing-base-price",
  quantity: "listing-quantity",
  auction_end_time: "listing-auction-end-time",
}

/** Maps the API's validation field names to the form's fields. */
const API_FIELDS: Record<string, ListingFormField> = {
  title: "title",
  description: "description",
  game_item_id: "game_item_id",
  base_price: "base_price",
  "lots[0].quantity": "quantity",
  "auction_details.end_time": "auction_end_time",
}

function isStandardError(data: unknown): data is StandardErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "message" in data.error
  )
}

/**
 * The first error of a failed create/update request, pointed at a form
 * field when the API names one. `fallback` is used when the response has no
 * message (network errors and the like).
 */
export function listingApiError(error: unknown, fallback: string): ListingFormError {
  const data =
    typeof error === "object" && error !== null && "data" in error ? error.data : undefined
  if (!isStandardError(data)) return { field: "form", message: fallback }
  const first = data.error.validationErrors?.[0]
  if (first) {
    return { field: API_FIELDS[first.field] ?? "form", message: first.message }
  }
  return { field: "form", message: data.error.message || fallback }
}

/** Scrolls to and focuses a field's input (no-op for "form"). */
export function focusListingField(field: ListingFormField): void {
  if (field === "form") return
  const el = document.getElementById(LISTING_FIELD_IDS[field])
  el?.scrollIntoView?.({ behavior: "smooth", block: "center" })
  el?.focus?.({ preventScroll: true })
}
