import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import type {
  AdminTestNotificationResponse,
  AdminTestNotificationType,
} from "../../../store/api/v2/market"
import { usePostAdminTestNotificationMutation } from "../../../store/api/v2/admin-overrides"

/**
 * Admin notification test: trigger a notification type for a user with real
 * data. Keeps the last result or error for the page to show, and alerts.
 */
export function useTestNotification() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [testNotification, { isLoading: isTesting }] =
    usePostAdminTestNotificationMutation()
  const [testResult, setTestResult] =
    useState<AdminTestNotificationResponse | null>(null)
  const [testError, setTestError] = useState<string>("")

  const run = useCallback(
    async (
      notificationType: AdminTestNotificationType | "",
      targetUsername: string | undefined,
      contractorId: string,
    ) => {
      if (!notificationType || !targetUsername) {
        issueAlert({
          message: t(
            "admin.notificationTest.validation.fillAllFields",
            "Please fill all fields",
          ),
          severity: "error",
        })
        return
      }

      setTestResult(null)
      setTestError("")

      try {
        const result = await testNotification({
          adminTestNotificationRequest: {
            notification_type: notificationType,
            target_username: targetUsername,
            contractor_id: contractorId || null,
          },
        }).unwrap()

        setTestResult(result)
        issueAlert({
          message: t(
            "admin.notificationTest.success",
            "Notification test completed",
          ),
          severity: "success",
        })
      } catch (error: unknown) {
        // Handle error response structure: { error: { code, message } }
        let errorMessage: string
        const errData = error as
          | {
              data?: { error?: string | { message?: string } }
              message?: string
            }
          | undefined
        if (errData?.data?.error) {
          if (typeof errData.data.error === "string") {
            errorMessage = errData.data.error
          } else if (errData.data.error?.message) {
            errorMessage = errData.data.error.message
          } else {
            errorMessage = JSON.stringify(errData.data.error)
          }
        } else if (errData?.message) {
          errorMessage = errData.message
        } else {
          errorMessage = t(
            "admin.notificationTest.error",
            "Failed to test notification",
          )
        }
        setTestError(errorMessage)
        issueAlert({
          message: errorMessage,
          severity: "error",
        })
      }
    },
    [testNotification, issueAlert, t],
  )

  return { run, isTesting, testResult, testError }
}
