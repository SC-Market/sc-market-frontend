import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Box, Container, Grid, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { User } from "../../../datatypes/User"
import { UserReviewSummary } from "../../../views/contractor/OrgReviews"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { SwipeableItem } from "../../../components/gestures"
import { ProfileBannerArea } from "./ProfileBannerArea"
import { ProfileMetaTags } from "./ProfileMetaTags"
import { ProfileHeader } from "./ProfileHeader"
import { ProfileTabs } from "./ProfileTabs"
import { ProfileTabContent } from "./ProfileTabContent"
import { useProfileData } from "../hooks/useProfileData"
import { useProfileActions } from "../hooks/useProfileActions"
import { useProfileTab } from "../hooks/useProfileTab"
import { Stack } from "@mui/system"

export function ViewProfile(props: { profile: User }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()

  const page = useProfileTab()
  const { isMyProfile, tabPaths } = useProfileData(props.profile)
  const {
    submitUpdate,
    handleAvatarUpload,
    isUploadingAvatar,
    setAvatarFileInputRef,
  } = useProfileActions()

  return (
    <Box sx={{ position: "relative" }}>
      <ProfileBannerArea profile={props.profile} submitUpdate={submitUpdate} />
      <Box
        sx={{
          ...(theme.palette.mode === "dark"
            ? { position: "relative", top: -500 }
            : { position: "relative", top: -250 }),
        }}
      >
        <ProfileMetaTags profile={props.profile} />
        <Container maxWidth={"xl"}>
          <Stack spacing={theme.layoutSpacing.layout}>
            <Grid
              spacing={theme.layoutSpacing.layout}
              container
              justifyContent="space-between"
              alignItems="end"
              sx={{
                marginTop: 1,
                [theme.breakpoints.up("lg")]: { height: 400 },
              }}
            >
              <Grid item xs={12} lg={8}>
                <ProfileHeader
                  profile={props.profile}
                  isMyProfile={isMyProfile}
                  isUploadingAvatar={isUploadingAvatar}
                  onAvatarUpload={handleAvatarUpload}
                  setAvatarFileInputRef={setAvatarFileInputRef}
                />
              </Grid>
              <UserReviewSummary user={props.profile} />
            </Grid>
            <ProfileTabs username={props.profile.username} currentTab={page} />
          </Stack>
        </Container>

        <SwipeableItem
          onSwipeLeft={() => {
            if (page < tabPaths.length - 1) {
              navigate(tabPaths[page + 1])
            }
          }}
          onSwipeRight={() => {
            if (page > 0) navigate(tabPaths[page - 1])
          }}
          enabled={isMobile}
        >
          <ProfileTabContent
            currentTab={page}
            profile={props.profile}
            isMyProfile={isMyProfile}
            submitUpdate={submitUpdate}
          />
        </SwipeableItem>
      </Box>
    </Box>
  )
}

export default ViewProfile
