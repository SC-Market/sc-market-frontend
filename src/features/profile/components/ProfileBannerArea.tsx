import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Box, Fab } from "@mui/material"
import { AddAPhotoRounded, SaveRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { User } from "../../../datatypes/User"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  useGetUserProfileQuery,
  useProfileUploadBannerMutation,
} from "../../../store/profile"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { DarkBannerContainer, LightBannerContainer } from "./BannerContainers"

function BannerEditArea(props: {
  profile: User
  submitUpdate: (arg: any) => void
}) {
  const { profile } = props
  const { t } = useTranslation()

  const { data: myProfile } = useGetUserProfileQuery()
  const isMyProfile = useMemo(
    () => myProfile?.username === profile.username,
    [myProfile?.username, profile.username],
  )

  const [bannerFileInputRef, setBannerFileInputRef] =
    useState<HTMLInputElement | null>(null)
  const issueAlert = useAlertHook()

  const [uploadBanner, { isLoading: isUploadingBanner }] =
    useProfileUploadBannerMutation()

  async function handleBannerUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2.5 * 1000 * 1000) {
      issueAlert({
        message: t("viewProfile.banner_too_large", {
          defaultValue: "Banner must be less than 2.5MB",
        }),
        severity: "error",
      })
      return
    }

    uploadBanner(file)
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("viewProfile.banner_uploaded", {
            defaultValue: "Banner uploaded successfully",
          }),
          severity: "success",
        })
      })
      .catch(issueAlert)
      .finally(() => {
        if (bannerFileInputRef) {
          bannerFileInputRef.value = ""
        }
      })
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: 8,
        left: 8,
        display: "flex",
      }}
    >
      {isMyProfile && (
        <>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleBannerUpload}
            ref={(input) => setBannerFileInputRef(input)}
            style={{ display: "none" }}
            id="banner-upload-input"
            disabled={isUploadingBanner}
          />
          <label htmlFor="banner-upload-input">
            <Fab
              component="span"
              disabled={isUploadingBanner}
              color="secondary"
              aria-label={t("orgDetailEdit.set_banner")}
              sx={{ transition: "0.3s" }}
            >
              {isUploadingBanner ? <SaveRounded /> : <AddAPhotoRounded />}
            </Fab>
          </label>
        </>
      )}
    </Box>
  )
}

export function ProfileBannerArea(props: {
  profile: User
  submitUpdate: (arg: any) => void
}) {
  const { profile, submitUpdate } = props
  const theme = useTheme<ExtendedTheme>()

  const { data: myProfile } = useGetUserProfileQuery()
  const isMyProfile = useMemo(
    () => myProfile?.username === profile.username,
    [myProfile?.username, profile.username],
  )

  return theme.palette.mode === "dark" ? (
    <DarkBannerContainer profile={profile}>
      {isMyProfile && (
        <BannerEditArea submitUpdate={submitUpdate} profile={profile} />
      )}
    </DarkBannerContainer>
  ) : (
    <LightBannerContainer profile={profile}>
      {isMyProfile && (
        <BannerEditArea submitUpdate={submitUpdate} profile={profile} />
      )}
    </LightBannerContainer>
  )
}
