/**
 * Your profile's status settings and banner: hide your online status, show
 * yourself as in game, and upload a profile banner.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import { useUpdateAccountPrivacyMutation } from "../../../store/api/v2/market"
import { resizeImageFile, BANNER_RESIZE } from "../../../util/imageResize"
import {
  useProfileUpdateInGameStatusMutation,
  useProfileUploadBannerMutation,
} from "../api/profileApi"

/** "Hide my online status". Alerts only when it fails to save. */
export function useHideOnlineStatus() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [update, { isLoading: saving }] = useUpdateAccountPrivacyMutation()

  const setHidden = useCallback(
    async (hidden: boolean) => {
      try {
        await update({
          updateAccountPrivacyRequest: { hide_online_status: hidden },
        }).unwrap()
      } catch {
        issueAlert({
          message: t(
            "settings.profile.hideOnlineStatusError",
            "Couldn't save your online status setting",
          ),
          severity: "error",
        })
      }
    },
    [update, issueAlert, t],
  )

  return { setHidden, saving }
}

/** "Show as in game". */
export function useSetInGameStatus() {
  const [updateStatus] = useProfileUpdateInGameStatusMutation()
  return useCallback(
    (inGame: boolean) => {
      updateStatus({ in_game: inGame })
    },
    [updateStatus],
  )
}

/** Resize and upload a profile banner, and alert the outcome. */
export function useProfileBannerUpload() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [uploadBanner, { isLoading: isUploadingBanner }] =
    useProfileUploadBannerMutation()

  const upload = useCallback(
    async (original: File) => {
      const file = await resizeImageFile(original, BANNER_RESIZE)
      try {
        await uploadBanner(file).unwrap()
        issueAlert({
          message: t("viewProfile.banner_uploaded", {
            defaultValue: "Banner uploaded",
          }),
          severity: "success",
        })
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
      }
    },
    [uploadBanner, issueAlert, t],
  )

  return { upload, isUploadingBanner }
}
