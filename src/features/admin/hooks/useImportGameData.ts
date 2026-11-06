import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useImportGameDataMutation } from "../../../store/api/admin"

/**
 * Upload a game data zip to start an import job. Alerts that it started (or
 * why the upload failed); resolves to whether the job started.
 */
export function useImportGameData() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [importGameData, { isLoading: uploading }] = useImportGameDataMutation()

  const start = useCallback(
    async (
      file: File,
      gameChannel: "LIVE" | "PTU" | "EPTU",
      gameVersion: string,
    ): Promise<boolean> => {
      try {
        await importGameData({
          file,
          gameChannel,
          gameVersion: gameVersion || undefined,
        }).unwrap()
        issueAlert({
          message: t("adminUi.gameDataImport.importStarted"),
          severity: "info",
        })
        return true
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("adminUi.gameDataImport.uploadFailed")
        issueAlert({ message, severity: "error" })
        return false
      }
    },
    [importGameData, issueAlert, t],
  )

  return { start, uploading }
}
