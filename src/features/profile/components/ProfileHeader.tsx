import React from "react"
import { useTranslation } from "react-i18next"
import { User } from "../../../datatypes/User"
import { UserActionsDropdown } from "../../../components/profile/UserActionsDropdown"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { Discord } from "../../../components/icon/DiscordIcon"
import { ProfileAvatar } from "./ProfileAvatar"
import { ShareButton } from "../../../components/buttons/ShareButton"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import MaterialLink from '@mui/material/Link';
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
import EditRounded from '@mui/icons-material/EditRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';

interface ProfileHeaderProps {
  profile: User
  isMyProfile: boolean
  isUploadingAvatar: boolean
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  setAvatarFileInputRef: (ref: HTMLInputElement | null) => void
}

export function ProfileHeader({
  profile,
  isMyProfile,
  isUploadingAvatar,
  onAvatarUpload,
  setAvatarFileInputRef,
}: ProfileHeaderProps) {
  const { t } = useTranslation()

  return (
    <Grid container spacing={2} alignItems="end" justifyContent="flex-start">
      <Grid item>
        <ProfileAvatar
          avatar={profile.avatar}
          isMyProfile={isMyProfile}
          isUploadingAvatar={isUploadingAvatar}
          onAvatarUpload={onAvatarUpload}
          setAvatarFileInputRef={setAvatarFileInputRef}
        />
      </Grid>
      <Grid item>
        <Typography
          color="text.secondary"
          variant="h6"
          fontWeight={600}
          sx={{ display: "flex", alignItems: "center" }}
        >
          {profile.username} <UserActionsDropdown user={profile} />
          <ShareButton title={`${profile.display_name} - SC Market`} />
        </Typography>
        {profile.discord_profile && (
          <MaterialLink
            component="a"
            href={`https://discordapp.com/users/${profile.discord_profile.id}`}
            target="_blank"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <UnderlineLink
              color="text.primary"
              variant="subtitle2"
              fontWeight={600}
            >
              @{profile.discord_profile.username}
              {+profile.discord_profile.discriminator!
                ? `#${profile.discord_profile.discriminator}`
                : ""}
            </UnderlineLink>
            <IconButton color="primary">
              <Discord />
            </IconButton>
          </MaterialLink>
        )}
      </Grid>
    </Grid>
  )
}
