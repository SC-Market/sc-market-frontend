import type { TFunction } from "i18next"

/**
 * What a listing status is called in the UI. The API's "cancelled" is what
 * the Archive action sets, so it reads "Archived" (it used to show as
 * "CANCELLED"); "expired" is a listing paused by expiry or a wipe.
 */
export function listingStatusLabel(status: string, t: TFunction): string {
  switch (status) {
    case "active":
      return t("listingStatus.active", "Active")
    case "inactive":
      return t("listingStatus.inactive", "Inactive")
    case "sold":
      return t("listingStatus.sold", "Sold")
    case "expired":
      return t("listingStatus.expired", "Paused")
    case "cancelled":
      return t("listingStatus.cancelled", "Archived")
    default:
      return status
  }
}
