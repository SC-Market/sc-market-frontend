/**
 * Create, edit, move and delete stock lots, with alerts.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useCreateStockLotMutation,
  useDeleteStockLotMutation,
  useUpdateStockLotMutation,
  type CreateStockLotRequest,
  type StockLotDetail,
  type UpdateStockLotRequest,
} from "../../../store/api/v2/market"
import { extractErrorMessage } from "../../../store/api-utils"

/** Edit and delete lots from the stock grid. */
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

/** The API error's code, at `data.details.code` or `data.code`. */
function apiErrorCode(error: unknown): string | undefined {
  const data = (error as { data?: { details?: { code?: string }; code?: string } })?.data
  return (data?.details || data)?.code
}

/**
 * Create a stock lot from the create-lot dialog. Resolves to whether it
 * was created (both outcomes alert).
 */
export function useCreateLot() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createStockLot] = useCreateStockLotMutation()

  return useCallback(
    async (request: CreateStockLotRequest): Promise<boolean> => {
      try {
        await createStockLot({ createStockLotRequest: request }).unwrap()
        issueAlert({
          message: t("CreateLotDialogV2.createSuccess", "Lot created"),
          severity: "success",
        })
        return true
      } catch (error) {
        const reason = extractErrorMessage((error as { data?: unknown })?.data)
        issueAlert({
          message: reason
            ? t("CreateLotDialogV2.createErrorReason", "Failed to create lot: {{reason}}", { reason })
            : t("CreateLotDialogV2.createError", "Failed to create lot"),
          severity: "error",
        })
        return false
      }
    },
    [createStockLot, issueAlert, t],
  )
}

/** Save a lot from its list row's editor. Stock committed to orders is a warning. */
export function useEditLot() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateStockLot, { isLoading: isUpdating }] = useUpdateStockLotMutation()

  const save = useCallback(
    async (lotId: string, request: UpdateStockLotRequest): Promise<boolean> => {
      try {
        await updateStockLot({ id: lotId, updateStockLotRequest: request }).unwrap()
        issueAlert({
          message: t("LotListItemV2.updateSuccess", "Lot updated successfully"),
          severity: "success",
        })
        return true
      } catch (error) {
        issueAlert(
          apiErrorCode(error) === "INVALID_QUANTITY"
            ? {
                message: t(
                  "LotListItemV2.cannotReduceStock",
                  "Cannot reduce stock — units are committed to active orders",
                ),
                severity: "warning",
              }
            : {
                message: t("LotListItemV2.updateError", "Failed to update lot"),
                severity: "error",
              },
        )
        return false
      }
    },
    [updateStockLot, issueAlert, t],
  )

  return { save, isUpdating }
}

/** Move a lot to another location. */
export function useTransferLot() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateStockLot, { isLoading }] = useUpdateStockLotMutation()

  const transfer = useCallback(
    async (lotId: string, locationId: UpdateStockLotRequest["location_id"]): Promise<boolean> => {
      try {
        await updateStockLot({
          id: lotId,
          updateStockLotRequest: { location_id: locationId },
        }).unwrap()
        issueAlert({
          message: t("TransferLotDialogV2.transferSuccess", "Lot transferred successfully"),
          severity: "success",
        })
        return true
      } catch {
        issueAlert({
          message: t("TransferLotDialogV2.transferError", "Failed to transfer lot"),
          severity: "error",
        })
        return false
      }
    },
    [updateStockLot, issueAlert, t],
  )

  return { transfer, isLoading }
}
