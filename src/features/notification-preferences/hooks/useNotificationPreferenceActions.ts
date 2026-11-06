/**
 * Notification settings: save channel preferences, mute an org's
 * notifications, and the opt-in new public contract alert. The settings show
 * failures from the returned isError flags.
 */
import { useCallback } from "react"
import {
  useUpdateContractAlertMutation,
  useUpdateNotificationOrgMuteMutation,
  useUpdateNotificationPreferencesMutation,
  type ContractKind,
  type NotificationPreferenceUpdate,
} from "../../../store/api/v2/market"

/** Save preference changes, personally (scope null) or for an org. */
export function useSaveNotificationPreferences(scope: string | null) {
  const [update, { isLoading: isSaving, isError: saveFailed }] =
    useUpdateNotificationPreferencesMutation()
  const save = useCallback(
    (updates: NotificationPreferenceUpdate[]) =>
      update({
        updateNotificationPreferencesRequest: { contractor_id: scope, updates },
      }),
    [update, scope],
  )
  return { save, isSaving, saveFailed }
}

const MUTE_HOURS = { "8h": 8, "1w": 24 * 7 } as const
export type OrgMuteChoice = "off" | "8h" | "1w" | "on"

/** Mute an org's notifications for 8 hours, a week, or until unmuted. */
export function useMuteOrgNotifications(scope: string | null) {
  const [updateMute, { isLoading: isMuting, isError: muteFailed }] =
    useUpdateNotificationOrgMuteMutation()
  const setMute = useCallback(
    (choice: OrgMuteChoice) => {
      if (!scope) return
      updateMute({
        updateNotificationOrgMuteRequest: {
          contractor_id: scope,
          muted: choice !== "off",
          until:
            choice === "8h" || choice === "1w"
              ? new Date(
                  Date.now() + MUTE_HOURS[choice] * 3600_000,
                ).toISOString()
              : null,
        },
      })
    },
    [updateMute, scope],
  )
  return { setMute, isMuting, muteFailed }
}

/** Turn the new public contract alert on or off for a scope, with kinds. */
export function useSaveContractAlert() {
  const [update, { isLoading: isSaving, isError: saveFailed }] =
    useUpdateContractAlertMutation()
  const save = useCallback(
    (
      contractor_id: string | null,
      enabled: boolean,
      kinds: ContractKind[] | null,
    ) =>
      update({ updateContractAlertRequest: { contractor_id, enabled, kinds } }),
    [update],
  )
  return { save, isSaving, saveFailed }
}
