/** Reporting content, and the admin's update of a report. */
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useReportContentMutation,
  useUpdateReportMutation,
  type CreateReportRequest,
  type UpdateReportRequest,
} from "../api/moderationApi"

/**
 * Report a page. Warns when no reason is picked; alerts the outcome and
 * resolves to whether the report was sent.
 */
export function useReportContent() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [reportContent] = useReportContentMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(
    async (
      reportedUrl: string,
      reason: CreateReportRequest["report_reason"] | "",
      details: string,
    ): Promise<boolean> => {
      if (!reason) {
        issueAlert({
          message: t("ReportButton.pleaseSelectReason"),
          severity: "warning",
        })
        return false
      }

      setIsSubmitting(true)
      try {
        await reportContent({
          reported_url: reportedUrl,
          report_reason: reason,
          report_details: details || undefined,
        }).unwrap()
        issueAlert({
          message: t("ReportButton.reportSubmitted"),
          severity: "success",
        })
        return true
      } catch (error) {
        console.error("Failed to submit report:", error)
        issueAlert(error as UnwrappedErrorInterface)
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [reportContent, issueAlert, t],
  )

  return { submit, isSubmitting }
}

/** Set a report's status and notes. Resolves to whether it saved. */
export function useUpdateReport() {
  const [updateReport, { isLoading: isUpdating }] = useUpdateReportMutation()

  const update = useCallback(
    async (reportId: string, data: UpdateReportRequest): Promise<boolean> => {
      try {
        await updateReport({ reportId, data }).unwrap()
        return true
      } catch (error) {
        console.error("Failed to update report:", error)
        return false
      }
    },
    [updateReport],
  )

  return { update, isUpdating }
}
