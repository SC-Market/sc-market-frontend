/**
 * Account settings: spoken languages, privacy settings, re-syncing the RSI
 * handle and unlinking the RSI account.
 */
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import type { AccountSettingsBody } from "../../../hooks/login/UserProfile"
import {
  useProfileSetLanguagesMutation,
  useProfileSyncHandleMutation,
  useProfileUnlinkAccountMutation,
  useProfileUpdateSettingsMutation,
} from "../api/profileApi"

/** Save the languages you speak. Alerts the outcome. */
export function useSaveProfileLanguages() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [setLanguages] = useProfileSetLanguagesMutation()
  const [saving, setSaving] = useState(false)

  const save = useCallback(
    async (languageCodes: string[]) => {
      setSaving(true)
      try {
        await setLanguages({ language_codes: languageCodes }).unwrap()
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
    [setLanguages, issueAlert, t],
  )

  return { save, saving }
}

/** Update account (privacy) settings. Resolves to whether they saved. */
export function useUpdateAccountSettings() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateProfile] = useProfileUpdateSettingsMutation()

  return useCallback(
    async (body: AccountSettingsBody): Promise<boolean> => {
      try {
        await updateProfile(body).unwrap()
        issueAlert({
          message: t("privacy_settings.updated", {
            defaultValue: "Settings updated",
          }),
          severity: "success",
        })
        return true
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
        return false
      }
    },
    [updateProfile, issueAlert, t],
  )
}

/** Re-sync your handle from RSI. The view shows the returned state. */
export function useSyncRsiHandle() {
  const [syncHandle, state] = useProfileSyncHandleMutation()
  const sync = useCallback(() => {
    syncHandle()
  }, [syncHandle])
  return { sync, ...state }
}

/** Unlink your RSI account. The view shows the returned state. */
export function useUnlinkRsiAccount() {
  const [unlinkAccount, state] = useProfileUnlinkAccountMutation()
  const unlink = useCallback(() => {
    unlinkAccount()
  }, [unlinkAccount])
  return { unlink, ...state }
}
