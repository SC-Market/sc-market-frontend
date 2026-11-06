/**
 * Admin feature-flag detail: saving a flag's config and its per-user
 * overrides. Each sends the request and alerts; resolves to whether it worked.
 */
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useRemoveUserOverrideMutation,
  useSetUserOverrideMutation,
  useUpdateConfigMutation,
  type MarketVersion,
  type UpdateConfigRequest,
} from "../../../store/api/v2/market"

/** The edited config fields; null leaves a field as it is. */
export interface FlagConfigEdits {
  enabled: boolean | null
  default_version: MarketVersion | null
  rollout_percentage: number | null
}

/** Save the edited fields of a flag's config. */
export function useSaveFlagConfig(flagName: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateConfig] = useUpdateConfigMutation()
  const [saving, setSaving] = useState(false)

  const save = useCallback(
    async (edits: FlagConfigEdits): Promise<boolean> => {
      setSaving(true)
      try {
        const updates: UpdateConfigRequest = { flag_name: flagName }
        if (edits.enabled !== null) updates.enabled = edits.enabled
        if (edits.default_version !== null)
          updates.default_version = edits.default_version
        if (edits.rollout_percentage !== null)
          updates.rollout_percentage = edits.rollout_percentage
        await updateConfig({ updateConfigRequest: updates }).unwrap()
        issueAlert({
          message: t("adminUi.featureFlags.configSaved"),
          severity: "success",
        })
        return true
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : t("adminUi.featureFlags.failed")
        issueAlert({ message, severity: "error" })
        return false
      } finally {
        setSaving(false)
      }
    },
    [flagName, updateConfig, issueAlert, t],
  )

  return { save, saving }
}

/** Set or remove one user's override of a flag. */
export function useFlagUserOverride(flagName: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [setUserOverride] = useSetUserOverrideMutation()
  const [removeUserOverride] = useRemoveUserOverrideMutation()

  const set = useCallback(
    async (username: string, enabled: boolean): Promise<boolean> => {
      try {
        await setUserOverride({
          setUserOverrideRequest: {
            username: username.trim(),
            flag_name: flagName,
            enabled,
          },
        }).unwrap()
        issueAlert({
          message: t("adminUi.featureFlags.overrideSet", { username }),
          severity: "success",
        })
        return true
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("adminUi.featureFlags.userNotFound")
        issueAlert({ message, severity: "error" })
        return false
      }
    },
    [flagName, setUserOverride, issueAlert, t],
  )

  const remove = useCallback(
    async (username: string): Promise<boolean> => {
      try {
        await removeUserOverride({ username, flagName }).unwrap()
        issueAlert({
          message: t("adminUi.featureFlags.overrideRemoved"),
          severity: "success",
        })
        return true
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : t("adminUi.featureFlags.failed")
        issueAlert({ message, severity: "error" })
        return false
      }
    },
    [flagName, removeUserOverride, issueAlert, t],
  )

  return { set, remove }
}
