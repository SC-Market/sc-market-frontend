import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useUpdateProfile,
  useProfileUploadAvatarMutation,
} from "../api/profileApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { resizeImageFile, AVATAR_RESIZE } from "../../../util/imageResize"

export function useProfileActions() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateProfile] = useUpdateProfile()
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useProfileUploadAvatarMutation()

  const [avatarFileInputRef, setAvatarFileInputRef] =
    useState<HTMLInputElement | null>(null)

  async function submitUpdate(data: { about?: string; display_name?: string }) {
    const res: { data?: unknown; error?: unknown } = await updateProfile(data)
    if (res?.data && !res?.error) {
      issueAlert({ message: t("viewProfile.submitted"), severity: "success" })
    } else {
      issueAlert({
        message: `${t("viewProfile.failed")} ${
          (res?.error as { error?: string; data?: { error?: string } })
            ?.error ||
          (res?.error as { error?: string; data?: { error?: string } })?.data
            ?.error ||
          res?.error
        }`,
        severity: "error",
      })
    }
    return false
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const original = event.target.files?.[0]
    if (!original) return
    const file = await resizeImageFile(original, AVATAR_RESIZE)
    uploadAvatar(file)
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("viewProfile.avatar_uploaded", {
            defaultValue: "Avatar uploaded successfully",
          }),
          severity: "success",
        })
      })
      .catch(issueAlert)
      .finally(() => {
        if (avatarFileInputRef) avatarFileInputRef.value = ""
      })
  }

  return {
    submitUpdate,
    handleAvatarUpload,
    isUploadingAvatar,
    avatarFileInputRef,
    setAvatarFileInputRef,
  }
}
