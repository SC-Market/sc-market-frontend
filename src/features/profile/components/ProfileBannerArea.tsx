import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { User } from "../../../datatypes/User"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  useGetUserProfileQuery,
  useProfileUploadBannerMutation,
} from "../../../store/profile"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { DarkBannerContainer, LightBannerContainer } from "./BannerContainers"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';

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
