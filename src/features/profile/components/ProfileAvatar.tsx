import React, { useState } from "react"
import { Avatar, Box, IconButton } from "@mui/material"
import { AddAPhotoRounded, SaveRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

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
