import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Box, Fab } from "@mui/material"
import { AddAPhotoRounded, SaveRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { User } from "../../../datatypes/User"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../api/profileApi"
import { useProfileBannerUpload } from "../hooks/useProfileStatusActions"
import { DarkBannerContainer, LightBannerContainer } from "./BannerContainers"

function BannerEditArea(props: {
  profile: User
  submitUpdate: (arg: { about?: string; display_name?: string }) => void
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
  const { upload, isUploadingBanner } = useProfileBannerUpload()

  async function handleBannerUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const original = event.target.files?.[0]
    if (!original) return

    await upload(original)
    if (bannerFileInputRef) {
      bannerFileInputRef.value = ""
    }
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
  submitUpdate: (arg: { about?: string; display_name?: string }) => void
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
