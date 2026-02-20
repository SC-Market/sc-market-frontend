import { useState } from "react"
import { useImportShipFile } from "../../../store/ships"
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
      const res: { data?: any; error?: any } = await uploadFleetFile(
        JSON.parse(content || "[]"),
      )

      if (res?.data && !res?.error) {
        issueAlert({
          message: t("ships.import.submitted"),
          severity: "success",
        })
      } else {
        issueAlert({
          message: t("ships.import.failed", {
            error:
              res.error?.error || res.error?.data?.error || res.error || "",
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
