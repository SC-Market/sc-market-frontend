import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useUpdateProfile,
  useProfileUploadAvatarMutation,
} from "../../../store/profile"
import { useAlertHook } from "../../../hooks/alert/AlertHook"

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

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1 * 1000 * 1000) {
      issueAlert({
        message: t("viewProfile.avatar_too_large", {
          defaultValue: "Avatar must be less than 1MB",
        }),
        severity: "error",
      })
      return
    }
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
