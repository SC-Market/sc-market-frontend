/**
 * The stock manager's listing actions: bulk status changes, refresh/renew,
 * and saving an inline row edit. Each sends the requests and reports the
 * outcome with an alert; the components only render.
 */
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  marketV2Api,
  useCreateListingMutation,
  useRefreshListingMutation,
  useUpdateListingMutation,
  useUpdateStockLotMutation,
  type MyListingItem,
} from "../../../store/api/v2/market"
import { listingApiError } from "../domain/listingFormErrors"
import {
  lotTotalAfterDelta,
  newStockRowRequest,
  stockRowChanges,
  type StockRowDraft,
} from "../domain/stockRowEdit"

/** Set several listings active / inactive, or archive them. */
export function useBulkListingStatus() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateListing] = useUpdateListingMutation()
  const [isUpdating, setIsUpdating] = useState(false)

  const update = useCallback(
    async (
      ids: string[],
      status: "active" | "inactive" | "cancelled",
      successMessage: string,
    ): Promise<boolean> => {
      if (ids.length === 0) return false
      setIsUpdating(true)
      try {
        await Promise.all(
          ids.map((id) =>
            updateListing({ id, updateListingRequest: { status } }).unwrap(),
          ),
        )
        issueAlert({ message: successMessage, severity: "success" })
        return true
      } catch (e) {
        issueAlert(e as Error)
        return false
      } finally {
        setIsUpdating(false)
      }
    },
    [updateListing, issueAlert],
  )

  const setStatus = useCallback(
    (ids: string[], status: "active" | "inactive") =>
      update(ids, status, t("ItemStock.updated")),
    [update, t],
  )
  const archive = useCallback(
    (ids: string[]) =>
      update(
        ids,
        "cancelled",
        t("ItemStock.bulkArchivedSuccess", { count: ids.length }),
      ),
    [update, t],
  )

  return { setStatus, archive, isUpdating }
}

/** Refresh one listing (a new month; a paused one is reactivated). */
export function useRefreshListing() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [refreshListing] = useRefreshListingMutation()

  return useCallback(
    async (id: string) => {
      try {
        await refreshListing({ id }).unwrap()
        issueAlert({
          message: t("ItemStock.refreshed", "Listing refreshed"),
          severity: "success",
        })
      } catch {
        issueAlert({ message: t("marketV2.refreshFailed"), severity: "error" })
      }
    },
    [refreshListing, issueAlert, t],
  )
}

/** Renew several listings at once and say how many went through. */
export function useRenewListings() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [refreshListing] = useRefreshListingMutation()

  return useCallback(
    async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => refreshListing({ id }).unwrap()),
      )
      const ok = results.filter((r) => r.status === "fulfilled").length
      issueAlert(
        ok === ids.length
          ? {
              message: t(
                "ItemStock.renewedFromLink",
                "Renewed {{count}} listings for another month",
                { count: ok },
              ),
              severity: "success",
            }
          : {
              message: t(
                "ItemStock.renewedFromLinkPartial",
                "Renewed {{ok}} of {{total}} listings. Renew the rest below.",
                { ok, total: ids.length },
              ),
              severity: "warning",
            },
      )
    },
    [refreshListing, issueAlert, t],
  )
}

/**
 * Save a stock-manager row: create the listing for a new row, or apply the
 * status / price / quantity edit to an existing one. A quantity change goes
 * to the listing's newest listed lot in this shop. Resolves to whether the
 * row may leave edit mode.
 */
export function useSaveStockRow(shopId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createListing] = useCreateListingMutation()
  const [updateListing] = useUpdateListingMutation()
  const [updateStockLot] = useUpdateStockLotMutation()
  const [fetchStockLots] = marketV2Api.endpoints.getStockLots.useLazyQuery()

  const createRow = useCallback(
    async (draft: StockRowDraft): Promise<boolean> => {
      const request = newStockRowRequest(draft, shopId, "New Listing")
      if (!request) {
        issueAlert({
          message: t("ItemStock.selectItemError", "Select an item"),
          severity: "error",
        })
        return false
      }
      try {
        await createListing({ createListingRequest: request }).unwrap()
        issueAlert({ message: t("ItemStock.created"), severity: "success" })
        return true
      } catch (e) {
        issueAlert({
          message: listingApiError(e, t("ItemStock.createError")).message,
          severity: "error",
        })
        return false
      }
    },
    [shopId, createListing, issueAlert, t],
  )

  const saveRow = useCallback(
    async (existing: MyListingItem, draft: StockRowDraft): Promise<boolean> => {
      const { listingPatch, quantityDelta } = stockRowChanges(existing, draft)
      try {
        if (listingPatch) {
          await updateListing({
            id: existing.listing_id,
            updateListingRequest: listingPatch,
          }).unwrap()
        }
        if (quantityDelta !== 0) {
          // Scoped to this shop: unscoped, the lookup only searched your own
          // shops, so an org shop's lots were never found.
          const { lots } = await fetchStockLots({
            listingId: existing.listing_id,
            listed: true,
            pageSize: 1,
            shopId,
          }).unwrap()
          const lot = lots[0]
          const total = lotTotalAfterDelta(lot?.quantity_total, quantityDelta)
          if (!lot || total === null) {
            issueAlert({
              message: t(
                "ItemStock.quantityUseStockPage",
                "Change this listing's quantity per lot on the Stock page",
              ),
              severity: "error",
            })
            return false
          }
          await updateStockLot({
            id: lot.lot_id,
            updateStockLotRequest: { quantity_total: total },
          }).unwrap()
        }
        issueAlert({ message: t("ItemStock.updated"), severity: "success" })
        return true
      } catch {
        issueAlert({
          message: t("ItemStock.updateError", "Failed to update"),
          severity: "error",
        })
        return false
      }
    },
    [shopId, updateListing, fetchStockLots, updateStockLot, issueAlert, t],
  )

  return { createRow, saveRow }
}
