import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useExpireAllListingsMutation } from "../../../store/api/v2/market"

/** Admin: expire every active listing. Alerts; resolves to whether it did. */
export function useExpireAllListings() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [expireAllMutation, { isLoading }] = useExpireAllListingsMutation()

  const expireAll = useCallback(async (): Promise<boolean> => {
    try {
      const result = await expireAllMutation().unwrap()
      issueAlert({
        message: t("adminUi.expireListings.expired", {
          count: result.affected,
        }),
        severity: "success",
      })
      return true
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("adminUi.expireListings.failed")
      issueAlert({ message, severity: "error" })
      return false
    }
  }, [expireAllMutation, issueAlert, t])

  return { expireAll, isLoading }
}
