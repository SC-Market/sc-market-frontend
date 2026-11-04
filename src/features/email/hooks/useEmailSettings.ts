import { useTranslation } from "react-i18next"
import { useCallback, useState } from "react"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useGetEmailPreferencesQuery,
  useUpdateEmailPreferencesMutation,
} from "../api/emailApi"
import type { EmailPreference } from "../domain/types"
import type { PushPreference } from "../../push-notifications/domain/types"

export function useEmailSettings() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    data: preferences,
    isLoading: preferencesLoading,
    isError: preferencesError,
    refetch: refetchPreferences,
  } = useGetEmailPreferencesQuery(undefined, {
    // Refetch when component mounts to ensure fresh data after unsubscribe
    refetchOnMountOrArgChange: true,
  })
  const [updatePreferences] = useUpdateEmailPreferencesMutation()

  // Check if user has email and if it's verified
  const hasEmail = !!preferences?.email
  const emailVerified = preferences?.email?.email_verified ?? false
  const userEmail = preferences?.email?.email || null

  // Handle preference update or creation
  const handlePreferenceChange = useCallback(
    async (
      preference:
        | EmailPreference
        | { action_type_id: number; action_name?: string },
      enabled: boolean,
      contractorId?: string | null,
    ) => {
      try {
        await updatePreferences({
          preferences: [
            {
              action_type_id: preference.action_type_id,
              enabled,
              frequency:
                (preference as EmailPreference).frequency || "immediate",
              digest_time: (preference as EmailPreference).digest_time || null,
              contractor_id: contractorId ?? null,
            },
          ],
        }).unwrap()
        issueAlert({
          message: t("settingsUi.preferenceUpdated", { name: preference.action_name || (preference as EmailPreference).action_name || t("settingsUi.notificationFallback") }),
          severity: "success",
        })
      } catch (error) {
        const err = error as { data?: { error?: { message?: string } }; message?: string }
        issueAlert({
          message:
            err?.data?.error?.message ||
            err?.message ||
            t("settingsUi.preferenceUpdateFailed"),
          severity: "error",
        })
      }
    },
    [updatePreferences, issueAlert, t],
  )

  const handleBatchPreferenceChange = useCallback(
    async (
      updates: Array<{
        preference: EmailPreference | PushPreference
        enabled: boolean
      }>,
      contractorId?: string | null,
    ) => {
      try {
        // Use contractor_id from preference if available, otherwise use parameter
        const emailPreferences = updates
          .map(({ preference, enabled }) => {
            const emailPref = preference as EmailPreference
            if (emailPref.action_type_id) {
              return {
                action_type_id: emailPref.action_type_id,
                enabled,
                frequency: emailPref.frequency || "immediate",
                digest_time: emailPref.digest_time || null,
                contractor_id: emailPref.contractor_id ?? contractorId ?? null,
              }
            }
            return null
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)

        if (emailPreferences.length > 0) {
          await updatePreferences({
            preferences: emailPreferences,
          }).unwrap()
          issueAlert({
            message: t("settingsUi.preferencesUpdated", { count: emailPreferences.length }),
            severity: "success",
          })
        }
      } catch (error) {
        const err = error as { data?: { error?: { message?: string } }; message?: string }
        issueAlert({
          message:
            err?.data?.error?.message ||
            err?.message ||
            t("settingsUi.preferencesUpdateFailed"),
          severity: "error",
        })
      }
    },
    [updatePreferences, issueAlert, t],
  )

  return {
    preferences,
    preferencesLoading,
    preferencesError,
    refetchPreferences,
    hasEmail,
    emailVerified,
    userEmail,
    handlePreferenceChange,
    handleBatchPreferenceChange,
    error,
    success,
    setError,
    setSuccess,
  }
}
