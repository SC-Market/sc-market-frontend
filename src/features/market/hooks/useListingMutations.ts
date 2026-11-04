/**
 * Saving and changing listings from the listing forms and lists. Each sends
 * the request and alerts; the forms keep their fields and navigation.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useCreateListingMutation,
  useUpdateListingMutation,
  type CreateListingRequest,
  type UpdateListingRequest,
} from "../../../store/api/v2/market"
import { listingApiError, type ListingFormError } from "../domain/listingFormErrors"

export type ListingSaveResult =
  | { ok: true; listingId: string }
  | { ok: false; error: ListingFormError }

/** Create a listing; on failure, the error for the form to show by its field. */
export function useCreateListingSubmit() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createListing, { isLoading }] = useCreateListingMutation()

  const submit = useCallback(
    async (request: CreateListingRequest): Promise<ListingSaveResult> => {
      try {
        const result = await createListing({ createListingRequest: request }).unwrap()
        issueAlert({
          message: t("CreateListingV2.success", "Listing created successfully"),
          severity: "success",
        })
        return { ok: true, listingId: result.listing_id }
      } catch (e) {
        const error = listingApiError(e, t("CreateListingV2.error", "Failed to create listing"))
        issueAlert({ message: error.message, severity: "error" })
        return { ok: false, error }
      }
    },
    [createListing, issueAlert, t],
  )

  return { submit, isLoading }
}

/** Save the edit form's changes to a listing. */
export function useUpdateListingSubmit() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateListing, { isLoading }] = useUpdateListingMutation()

  const submit = useCallback(
    async (id: string, request: UpdateListingRequest): Promise<ListingSaveResult> => {
      try {
        await updateListing({ id, updateListingRequest: request }).unwrap()
        issueAlert({
          message: t("EditListingV2.success", "Listing updated successfully"),
          severity: "success",
        })
        return { ok: true, listingId: id }
      } catch (e) {
        const error = listingApiError(e, t("EditListingV2.error", "Failed to update listing"))
        issueAlert({ message: error.message, severity: "error" })
        return { ok: false, error }
      }
    },
    [updateListing, issueAlert, t],
  )

  return { submit, isLoading }
}

/** Activate, pause or archive one listing. Each resolves to whether it worked. */
export function useListingStatusActions() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateListing] = useUpdateListingMutation()

  const setStatus = useCallback(
    async (
      id: string,
      status: "active" | "inactive" | "cancelled",
      done: string,
      failed: string,
    ) => {
      try {
        await updateListing({ id, updateListingRequest: { status } }).unwrap()
        issueAlert({ message: done, severity: "success" })
        return true
      } catch {
        issueAlert({ message: failed, severity: "error" })
        return false
      }
    },
    [updateListing, issueAlert],
  )

  const activate = useCallback(
    (id: string) => setStatus(id, "active", t("marketV2.activated"), t("marketV2.activateFailed")),
    [setStatus, t],
  )
  const deactivate = useCallback(
    (id: string) =>
      setStatus(id, "inactive", t("marketV2.deactivated"), t("marketV2.deactivateFailed")),
    [setStatus, t],
  )
  const archive = useCallback(
    (id: string) => setStatus(id, "cancelled", t("marketV2.archived"), t("marketV2.archiveFailed")),
    [setStatus, t],
  )

  return { activate, deactivate, archive }
}
