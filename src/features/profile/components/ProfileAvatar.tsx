import React, { useState } from "react"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../hooks/styles/Theme"

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
import Avatar from '@mui/material/Avatar';
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

interface ProfileAvatarProps {
  avatar: string
  isMyProfile: boolean
  isUploadingAvatar: boolean
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  setAvatarFileInputRef: (ref: HTMLInputElement | null) => void
}

export function ProfileAvatar({
  avatar,
  isMyProfile,
  isUploadingAvatar,
  onAvatarUpload,
  setAvatarFileInputRef,
}: ProfileAvatarProps) {
  const theme = useTheme<ExtendedTheme>()
  const [showAvatarButton, setShowAvatarButton] = useState(false)

  if (!isMyProfile) {
    return (
      <Avatar
        src={avatar}
        sx={{
          height: 80,
          width: 80,
          borderRadius: theme.spacing(theme.borderRadius.image),
        }}
        variant="rounded"
      />
    )
  }

  return (
    <Box
      position="relative"
      onMouseEnter={() => setShowAvatarButton(true)}
      onMouseLeave={() => setShowAvatarButton(false)}
    >
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onAvatarUpload}
        ref={setAvatarFileInputRef}
        style={{ display: "none" }}
        id="avatar-upload-input"
        disabled={isUploadingAvatar}
      />
      <label htmlFor="avatar-upload-input">
        <IconButton
          component="span"
          disabled={isUploadingAvatar}
          sx={{
            opacity: showAvatarButton ? 1 : 0,
            position: "absolute",
            zIndex: 50,
            transition: "0.3s",
            color: theme.palette.background.light,
            top: 20,
            left: 20,
            backgroundColor: theme.palette.background.overlay,
            "&:hover": {
              backgroundColor: theme.palette.background.overlayDark,
            },
          }}
        >
          {isUploadingAvatar ? <SaveRounded /> : <AddAPhotoRounded />}
        </IconButton>
      </label>
      <Avatar
        src={avatar}
        sx={{
          height: 80,
          width: 80,
          borderRadius: theme.spacing(theme.borderRadius.image),
          opacity: showAvatarButton || isUploadingAvatar ? 0.5 : 1,
          transition: "0.5s",
        }}
        variant="rounded"
      />
    </Box>
  )
}
