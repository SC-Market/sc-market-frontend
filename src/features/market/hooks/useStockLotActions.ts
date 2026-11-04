/**
 * Edit and delete stock lots from the stock grid, with alerts.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useDeleteStockLotMutation,
  useUpdateStockLotMutation,
  type StockLotDetail,
  type UpdateStockLotRequest,
} from "../../../store/api/v2/market"

export function useStockLotActions() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateStockLot] = useUpdateStockLotMutation()
  const [deleteStockLot] = useDeleteStockLotMutation()

  const failed = useCallback(
    (err: unknown) =>
      issueAlert({
        message:
          (err as Error)?.message || t("marketUi.bulkStock.operationFailed"),
        severity: "error",
      }),
    [issueAlert, t],
  )

  /** Delete a lot. */
  const deleteLot = useCallback(
    async (lotId: string) => {
      try {
        await deleteStockLot({ id: lotId }).unwrap()
        issueAlert({
          message: t("AllStockLots.deleted", "Lot deleted"),
          severity: "success",
        })
      } catch (err) {
        failed(err)
      }
    },
    [deleteStockLot, issueAlert, failed, t],
  )

  /** Update a lot: the saved lot, or null when it failed. */
  const updateLot = useCallback(
    async (
      lotId: string,
      request: UpdateStockLotRequest,
    ): Promise<StockLotDetail | null> => {
      try {
        const { lot } = await updateStockLot({
          id: lotId,
          updateStockLotRequest: request,
        }).unwrap()
        issueAlert({
          message: t("AllStockLots.updated", "Lot updated"),
          severity: "success",
        })
        return lot
      } catch (err) {
        failed(err)
        return null
      }
    },
    [updateStockLot, issueAlert, failed, t],
  )

  return { deleteLot, updateLot }
}
