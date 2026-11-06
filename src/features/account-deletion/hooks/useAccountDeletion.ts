/** Scheduling your account for deletion, and cancelling that. */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useAccountCancelDeletionMutation,
  useAccountRequestDeletionMutation,
  useLogoutMutation,
} from "../../profile/api/profileApi"

/**
 * Schedule the deletion, log out and reload at the home page. A failed
 * request leaves you where you are (the dialog shows it from RTK state).
 */
export function useRequestAccountDeletion() {
  const [requestDeletion, { isLoading: deleting }] =
    useAccountRequestDeletionMutation()
  const [logout] = useLogoutMutation()

  const request = useCallback(
    async (reason: string) => {
      try {
        await requestDeletion({ reason: reason || undefined }).unwrap()
        await logout()
          .unwrap()
          .catch(() => {})
        window.location.href = "/"
      } catch {
        // Error is shown via RTK Query state
      }
    },
    [requestDeletion, logout],
  )

  return { request, deleting }
}

/** Cancel a scheduled deletion. Alerts the outcome. */
export function useCancelAccountDeletion() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [cancelDeletion, { isLoading }] = useAccountCancelDeletionMutation()

  const cancel = useCallback(async () => {
    try {
      const result = await cancelDeletion().unwrap()
      issueAlert({ message: result.message, severity: "success" })
    } catch {
      issueAlert({
        message: t("account_deletion.cancel_error", {
          defaultValue: "Failed to cancel deletion. Please try again.",
        }),
        severity: "error",
      })
    }
  }, [cancelDeletion, issueAlert, t])

  return { cancel, isLoading }
}
