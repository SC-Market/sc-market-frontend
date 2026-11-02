import React from "react"
import { useTranslation } from "react-i18next"
import {
  Box,
  Grid,
  IconButton,
  Link as MaterialLink,
  Typography,
} from "@mui/material"
import { User } from "../../../datatypes/User"
import { UserActionsDropdown } from "../../../components/profile/UserActionsDropdown"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { Discord } from "../../../components/icon/DiscordIcon"
import { ProfileAvatar } from "./ProfileAvatar"
import { ShareButton } from "../../../components/buttons/ShareButton"

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
          username={profile.username}
          isMyProfile={isMyProfile}
          isUploadingAvatar={isUploadingAvatar}
          onAvatarUpload={onAvatarUpload}
          setAvatarFileInputRef={setAvatarFileInputRef}
        />
      </Grid>
      <Grid item>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* The page's one <h1>: the user's display name (crawlers and
              screen readers; looks like the old username line). */}
          <Typography
            component="h1"
            color="text.secondary"
            variant="h6"
            fontWeight={600}
          >
            {profile.display_name || profile.username}
          </Typography>
          <UserActionsDropdown user={profile} />
          <ShareButton title={`${profile.display_name} - SC Market`} />
        </Box>
        {profile.display_name && profile.display_name !== profile.username && (
          <Typography color="text.primary" variant="subtitle2" fontWeight={600}>
            {profile.username}
          </Typography>
        )}
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
            <IconButton
              aria-label={t("profile.discordProfile", "Discord profile")}
              color="primary"
            >
              <Discord />
            </IconButton>
          </MaterialLink>
        )}
      </Grid>
    </Grid>
  )
}
