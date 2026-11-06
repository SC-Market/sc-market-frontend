/**
 * Org page and settings actions: answer an invite to the org, save its
 * supported languages, and (site admins) refresh its details from RSI.
 */
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useAcceptContractorInviteMutation,
  useDeclineContractorInviteMutation,
  useRefetchContractorDetailsMutation,
  useSetContractorLanguagesMutation,
} from "../api/contractorApi"

/** Accept or decline your pending invite to an org. Alerts the outcome. */
export function useOrgInviteResponse(spectrumId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [acceptInvite, { isLoading: isAccepting }] =
    useAcceptContractorInviteMutation()
  const [declineInvite, { isLoading: isDeclining }] =
    useDeclineContractorInviteMutation()

  const accept = useCallback(async () => {
    try {
      await acceptInvite({ contractor: spectrumId }).unwrap()
      issueAlert({
        message: t("org.invite.accepted", "Invite accepted"),
        severity: "success",
      })
    } catch {
      issueAlert({
        message: t("org.invite.acceptFailed", "Failed to join"),
        severity: "error",
      })
    }
  }, [acceptInvite, spectrumId, issueAlert, t])

  const decline = useCallback(async () => {
    try {
      await declineInvite({ contractor: spectrumId }).unwrap()
      issueAlert({
        message: t("org.invite.declined", "Invite declined"),
        severity: "success",
      })
    } catch {
      issueAlert({
        message: t("org.invite.declineFailed", "Failed to decline the invite"),
        severity: "error",
      })
    }
  }, [declineInvite, spectrumId, issueAlert, t])

  return { accept, decline, isAccepting, isDeclining }
}

/** Save the languages an org supports. Alerts the outcome. */
export function useSaveOrgLanguages(spectrumId: string | undefined) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [setLanguages] = useSetContractorLanguagesMutation()
  const [saving, setSaving] = useState(false)

  const save = useCallback(
    async (languageCodes: string[]) => {
      if (!spectrumId) return

      setSaving(true)

      try {
        await setLanguages({
          spectrum_id: spectrumId,
          language_codes: languageCodes,
        }).unwrap()
        issueAlert({
          message: t("settings.languages.saveSuccess", "Languages updated"),
          severity: "success",
        })
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("settings.languages.saveError", "Failed to update languages")
        issueAlert({
          message,
          severity: "error",
        })
      } finally {
        setSaving(false)
      }
    },
    [spectrumId, setLanguages, issueAlert, t],
  )

  return { save, saving }
}

/** Site admins: refresh an org's details from RSI. */
export function useRefetchOrgDetails() {
  const [refetch] = useRefetchContractorDetailsMutation()
  return useCallback(
    (spectrumId: string) => {
      refetch(spectrumId)
    },
    [refetch],
  )
}
