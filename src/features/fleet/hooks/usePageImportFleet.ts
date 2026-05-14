import { useState } from "react"
import { useImportShipFile } from "../api/shipsApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

export function usePageImportFleet() {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadFleetFile, { isSuccess, isLoading }] = useImportShipFile()
  const issueAlert = useAlertHook()

  const onFileUpload = async () => {
    if (!selectedFile) return

    try {
      const content = await selectedFile.text()
      const res = await uploadFleetFile(
        JSON.parse(content || "[]"),
      )

      if ("data" in res && !("error" in res)) {
        issueAlert({
          message: t("ships.import.submitted"),
          severity: "success",
        })
      } else {
        const error = "error" in res ? res.error as { error?: string; data?: { error?: string } } : undefined
        issueAlert({
          message: t("ships.import.failed", {
            error:
              error?.error || error?.data?.error || "",
          }),
          severity: "error",
        })
      }
    } catch (error) {
      issueAlert({
        message: t("ships.import.failed", {
          error: error instanceof Error ? error.message : String(error),
        }),
        severity: "error",
      })
    }
  }

  return {
    selectedFile,
    setSelectedFile,
    onFileUpload,
    isSuccess,
    isLoading,
  }
}
