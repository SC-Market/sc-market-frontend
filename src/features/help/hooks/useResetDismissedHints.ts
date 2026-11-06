import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useSession } from "../../../hooks/login/useSession"
import { useClearDismissedHintsMutation } from "../../../store/api/v2/market"
import { clearLocalDismissedHints } from "../dismissedHintsStorage"

/**
 * "Show tips again": bring back every first-use hint the user dismissed.
 * Signed in, that clears the account's list (DELETE /api/v2/hints/dismissed);
 * signed out, this browser's localStorage. Alerts the outcome.
 */
export function useResetDismissedHints() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const session = useSession()
  const [clearOnAccount] = useClearDismissedHintsMutation()
  const [busy, setBusy] = useState(false)
  const signedIn = session.status === "authenticated"

  const reset = useCallback(async () => {
    setBusy(true)
    try {
      if (signedIn) {
        await clearOnAccount().unwrap()
      } else {
        clearLocalDismissedHints()
      }
      issueAlert({ message: t("settings.tips.reset"), severity: "success" })
    } catch {
      issueAlert({ message: t("settings.tips.resetError"), severity: "error" })
    } finally {
      setBusy(false)
    }
  }, [signedIn, clearOnAccount, issueAlert, t])

  return { reset, busy }
}
