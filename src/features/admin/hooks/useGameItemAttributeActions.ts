/**
 * Admin game item attributes: save, delete and import from game data. Each
 * sends the request and alerts; save and delete resolve to whether they
 * worked (the view closes its dialog then).
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useDeleteGameItemAttributeMutation,
  useImportGameItemAttributesMutation,
  useUpsertGameItemAttributeMutation,
  type UpsertGameItemAttributePayload,
} from "../../../store/api/attributes"

export function useGameItemAttributeActions(gameItemId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [upsertAttribute, { isLoading: isUpserting }] =
    useUpsertGameItemAttributeMutation()
  const [deleteAttribute, { isLoading: isDeleting }] =
    useDeleteGameItemAttributeMutation()
  const [importAttributes, { isLoading: isImporting }] =
    useImportGameItemAttributesMutation()

  const upsert = useCallback(
    async (data: UpsertGameItemAttributePayload): Promise<boolean> => {
      try {
        await upsertAttribute({ gameItemId, data }).unwrap()
        issueAlert({
          message: t("admin.gameItemAttributes.saved", "Attribute saved"),
          severity: "success",
        })
        return true
      } catch (error) {
        issueAlert(error as UnwrappedErrorInterface)
        return false
      }
    },
    [gameItemId, upsertAttribute, issueAlert, t],
  )

  const remove = useCallback(
    async (attributeName: string): Promise<boolean> => {
      try {
        await deleteAttribute({ gameItemId, attributeName }).unwrap()
        issueAlert({
          message: t("admin.gameItemAttributes.deleted", "Attribute deleted"),
          severity: "success",
        })
        return true
      } catch (error) {
        issueAlert(error as UnwrappedErrorInterface)
        return false
      }
    },
    [gameItemId, deleteAttribute, issueAlert, t],
  )

  const importFromGameData = useCallback(async () => {
    try {
      const result = await importAttributes(gameItemId).unwrap()
      if (result.success) {
        issueAlert({
          message: t("adminUi.gameItemAttributes.importSuccess", {
            count: result.attributesImported,
          }),
          severity: "success",
        })
      } else {
        issueAlert({
          message: t("adminUi.gameItemAttributes.importPartial", {
            count: result.attributesImported,
          }),
          severity: "warning",
        })
      }
    } catch (error) {
      issueAlert(error as UnwrappedErrorInterface)
    }
  }, [gameItemId, importAttributes, issueAlert, t])

  return {
    upsert,
    remove,
    importFromGameData,
    isUpserting,
    isDeleting,
    isImporting,
  }
}
