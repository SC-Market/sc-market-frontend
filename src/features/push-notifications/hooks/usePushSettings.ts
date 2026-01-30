import { useCallback, useState, useEffect } from "react"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useGetPushPreferencesQuery,
  useUpdatePushPreferenceMutation,
} from "../api/pushApi"
import type { PushPreference } from "../domain/types"
import type { EmailPreference } from "../../email/domain/types"

export function usePushSettings() {
  const issueAlert = useAlertHook()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    data: preferences,
    isLoading: preferencesLoading,
    refetch: refetchPreferences,
  } = useGetPushPreferencesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [updatePreference] = useUpdatePushPreferenceMutation()

  // Handle preference update
  const handlePreferenceChange = useCallback(
    async (
      preference: PushPreference | { action: string },
      enabled: boolean,
      contractorId?: string | null,
    ) => {
      const action =
        (preference as PushPreference).action ||
        (preference as { action: string }).action
      try {
        await updatePreference({
          action,
          enabled,
          contractor_id: contractorId ?? null,
        }).unwrap()
        issueAlert({
          message: `Preference updated for ${action}`,
          severity: "success",
        })
      } catch (error) {
        issueAlert({
          message:
            error instanceof Error
              ? error.message
              : "Failed to update preference",
          severity: "error",
        })
      }
    },
    [updatePreference, issueAlert],
  )

  // Handle batch preference update
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
        const pushPreferences = updates
          .map(({ preference, enabled }) => {
            const pushPref = preference as PushPreference & {
              contractor_id?: string | null
            }
            if (pushPref.action) {
              return {
                action: pushPref.action,
                enabled,
                contractor_id: pushPref.contractor_id ?? contractorId ?? null,
              }
            }
            return null
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)

        if (pushPreferences.length > 0) {
          await updatePreference({
            preferences: pushPreferences,
          } as any).unwrap()
          issueAlert({
            message: `Updated ${pushPreferences.length} notification preference${pushPreferences.length !== 1 ? "s" : ""}`,
            severity: "success",
          })
        }
      } catch (error) {
        issueAlert({
          message:
            error instanceof Error
              ? error.message
              : "Failed to update preferences",
          severity: "error",
        })
      }
    },
    [updatePreference, issueAlert],
  )

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return {
    preferences,
    preferencesLoading,
    refetchPreferences,
    handlePreferenceChange,
    handleBatchPreferenceChange,
    error,
    success,
    setError,
    setSuccess,
  }
}
