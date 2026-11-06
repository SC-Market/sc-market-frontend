/**
 * Allocating an order's units to stock lots: set one lot's units for a line,
 * auto-allocate everything, or release everything. Each alerts the outcome.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useAutoAllocateOrderStockMutation,
  useManualAllocateOrderStockMutation,
  useReleaseOrderStockMutation,
  type OrderAllocationLine,
} from "../../../store/api/v2/market"

/** The message of a failed V2 request ({ error: { message } }). */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { error?: { message?: unknown } } }).data
    if (typeof data?.error?.message === "string") return data.error.message
  }
  return fallback
}

export function useOrderAllocationActions(orderId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [manualAllocate] = useManualAllocateOrderStockMutation()
  const [autoAllocate, { isLoading: autoLoading }] =
    useAutoAllocateOrderStockMutation()
  const [release, { isLoading: releaseLoading }] =
    useReleaseOrderStockMutation()

  /** Sets the units `lotId` holds for the line (absolute, 0 releases). */
  const setLotAllocation = useCallback(
    async (
      line: OrderAllocationLine,
      lotId: string,
      quantity: number,
      success: string,
    ) => {
      try {
        await manualAllocate({
          orderId,
          manualOrderAllocationRequest: {
            allocations: [
              { lot_id: lotId, quantity, order_item_id: line.order_item_id },
            ],
          },
        }).unwrap()
        issueAlert({ severity: "success", message: success })
      } catch (e) {
        issueAlert({
          severity: "error",
          message: apiErrorMessage(e, t("allocationUi.updateFailed")),
        })
      }
    },
    [orderId, manualAllocate, issueAlert, t],
  )

  const autoAllocateAll = useCallback(async () => {
    try {
      const res = await autoAllocate({ orderId }).unwrap()
      issueAlert({
        severity:
          res.total_allocated < res.total_requested ? "warning" : "success",
        message: t("allocationUi.unitsAllocated", {
          allocated: res.total_allocated,
          count: res.total_requested,
        }),
      })
    } catch (e) {
      issueAlert({
        severity: "error",
        message: apiErrorMessage(e, t("allocationUi.allocateFailed")),
      })
    }
  }, [orderId, autoAllocate, issueAlert, t])

  const releaseAll = useCallback(async () => {
    try {
      await release({ orderId, releaseOrderAllocationsRequest: {} }).unwrap()
      issueAlert({
        severity: "success",
        message: t("allocationUi.releasedSuccess"),
      })
    } catch (e) {
      issueAlert({
        severity: "error",
        message: apiErrorMessage(e, t("allocationUi.releaseFailed")),
      })
    }
  }, [orderId, release, issueAlert, t])

  return {
    setLotAllocation,
    autoAllocateAll,
    releaseAll,
    autoLoading,
    releaseLoading,
  }
}
