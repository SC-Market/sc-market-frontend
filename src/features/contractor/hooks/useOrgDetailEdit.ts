import { useState, useCallback } from "react"
import type { Contractor, ContractorKindIconKey } from "../domain/types"
import {
  useUpdateContractorMutation,
  useContractorUploadAvatarMutation,
  useContractorUploadBannerMutation,
} from "../api/contractorApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

export function useOrgDetailEdit(contractor: Contractor) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [editingTags, setEditingTags] = useState(false)
  const [newName, setNewName] = useState(contractor?.name || "")
  const [newDesc, setNewDesc] = useState(contractor?.description || "")
  const [newTags, setNewTags] = useState<ContractorKindIconKey[]>(contractor?.fields || [])
  const [showAvatarButton, setShowAvatarButton] = useState(false)
  const [avatarFileInputRef, setAvatarFileInputRef] = useState<HTMLInputElement | null>(null)
  const [bannerFileInputRef, setBannerFileInputRef] = useState<HTMLInputElement | null>(null)

  const [updateContractor] = useUpdateContractorMutation()
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useContractorUploadAvatarMutation()
  const [uploadBanner, { isLoading: isUploadingBanner }] = useContractorUploadBannerMutation()

  const submitUpdate = useCallback(async (data: { description?: string; tags?: string[]; site_url?: string; name?: string }) => {
    const res = await updateContractor({ contractor: contractor.spectrum_id, body: data })
    if ("data" in res && !("error" in res)) {
      issueAlert({ message: t("orgDetailEdit.submitted"), severity: "success" })
    } else {
      const error = "error" in res ? res.error as { error?: string; data?: { error?: string } } : undefined
      issueAlert({ message: t("orgDetailEdit.failed_submit", { reason: error?.error || error?.data?.error || "" }), severity: "error" })
    }
  }, [updateContractor, contractor.spectrum_id, issueAlert, t])

  const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1 * 1000 * 1000) {
      issueAlert({ message: t("orgDetailEdit.avatar_too_large", { defaultValue: "Avatar must be less than 1MB" }), severity: "error" }); return
    }
    uploadAvatar({ contractor: contractor.spectrum_id, file }).unwrap()
      .then(() => issueAlert({ message: t("orgDetailEdit.avatar_uploaded", { defaultValue: "Avatar uploaded successfully" }), severity: "success" }))
      .catch(issueAlert)
      .finally(() => { if (avatarFileInputRef) avatarFileInputRef.value = "" })
  }, [uploadAvatar, contractor.spectrum_id, issueAlert, avatarFileInputRef, t])

  const handleBannerUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2.5 * 1000 * 1000) {
      issueAlert({ message: t("orgDetailEdit.banner_too_large", { defaultValue: "Banner must be less than 2.5MB" }), severity: "error" }); return
    }
    uploadBanner({ contractor: contractor.spectrum_id, file }).unwrap()
      .then(() => issueAlert({ message: t("orgDetailEdit.banner_uploaded", { defaultValue: "Banner uploaded successfully" }), severity: "success" }))
      .catch(issueAlert)
      .finally(() => { if (bannerFileInputRef) bannerFileInputRef.value = "" })
  }, [uploadBanner, contractor.spectrum_id, issueAlert, bannerFileInputRef, t])

  return {
    editingName, setEditingName, editingDesc, setEditingDesc, editingTags, setEditingTags,
    newName, setNewName, newDesc, setNewDesc, newTags, setNewTags,
    showAvatarButton, setShowAvatarButton,
    avatarFileInputRef, setAvatarFileInputRef,
    bannerFileInputRef, setBannerFileInputRef,
    isUploadingAvatar, isUploadingBanner,
    submitUpdate, handleAvatarUpload, handleBannerUpload,
  }
}
