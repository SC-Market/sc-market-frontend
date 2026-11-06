/**
 * Game data actions: mark a blueprint owned or not, rate a mission, and
 * remember the selected game version on the account.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import type { RateMissionApiArg } from "../../../store/api/v2/market"
import {
  useAddBlueprintToInventoryMutation,
  useRateMissionMutation,
  useRemoveBlueprintFromInventoryMutation,
  useSelectVersionMutation,
} from "../api/gameDataApi"

/** Toggle whether you own a blueprint. Failures are ignored. */
export function useBlueprintOwnership(blueprintId: string | null | undefined) {
  const [addToInventory] = useAddBlueprintToInventoryMutation()
  const [removeFromInventory] = useRemoveBlueprintFromInventoryMutation()

  return useCallback(
    async (owned: boolean) => {
      if (!blueprintId) return
      if (owned) {
        await removeFromInventory({ blueprintId })
          .unwrap()
          .catch(() => {})
      } else {
        await addToInventory({ blueprintId, body: {} })
          .unwrap()
          .catch(() => {})
      }
    },
    [blueprintId, addToInventory, removeFromInventory],
  )
}

/** Rate a mission. Resolves to null when saved, else the message to show. */
export function useRateMission(missionId: string) {
  const { t } = useTranslation()
  const [rateMission, { isLoading }] = useRateMissionMutation()

  const rate = useCallback(
    async (body: RateMissionApiArg["body"]): Promise<string | null> => {
      try {
        await rateMission({ missionId, body }).unwrap()
        return null
      } catch (err: unknown) {
        return (
          (err instanceof Error ? err.message : undefined) ||
          t("missionToolsUi.errorSubmitFailed")
        )
      }
    },
    [missionId, rateMission, t],
  )

  return { rate, isLoading }
}

/**
 * Remember the selected game version on the account. Guests can't: that
 * failure is ignored.
 */
export function useSelectGameVersion() {
  const [selectVersion] = useSelectVersionMutation()
  return useCallback(
    async (versionId: string) => {
      try {
        await selectVersion({
          selectVersionRequest: { version_id: versionId },
        }).unwrap()
      } catch {
        // Ignore auth errors for guest users
        console.debug("Version selection not persisted (guest user)")
      }
    },
    [selectVersion],
  )
}
