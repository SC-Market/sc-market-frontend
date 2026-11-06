import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useStartImportMutation,
  type ImportSource,
} from "../../../store/api/v2/market"

/** Start a data import job from a source, and alert that it started. */
export function useStartImport() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [startImport, { isLoading: starting }] = useStartImportMutation()

  const start = useCallback(
    async (source: ImportSource) => {
      try {
        await startImport({ source }).unwrap()
        issueAlert({
          message: t("adminUi.importMonitoring.started", { source }),
          severity: "info",
        })
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("adminUi.importMonitoring.startFailed")
        issueAlert({
          message,
          severity: "error",
        })
      }
    },
    [startImport, issueAlert, t],
  )

  return { start, starting }
}
