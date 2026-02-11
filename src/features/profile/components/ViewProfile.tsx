import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { User } from "../../../datatypes/User"
import { UserReviewSummary } from "../../../views/contractor/OrgReviews"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { OpenLayout } from "../../../components/layout/ContainerGrid"
import { SwipeableItem } from "../../../components/gestures"
import { PageBreadcrumbs } from "../../../components/navigation"
import { ProfileBannerArea } from "./ProfileBannerArea"
import { ProfileMetaTags } from "./ProfileMetaTags"
import { ProfileHeader } from "./ProfileHeader"
import { ProfileTabs } from "./ProfileTabs"
import { ProfileTabContent } from "./ProfileTabContent"
import { useProfileData } from "../hooks/useProfileData"
import { useProfileActions } from "../hooks/useProfileActions"
import { useProfileTab } from "../hooks/useProfileTab"
import { Stack } from "@mui/system"

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
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import Skeleton from '@mui/material/Skeleton';
import Stack1 from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import useTheme1 from '@mui/material/styles';
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
    <OpenLayout sidebarOpen={true}>
      <PageBreadcrumbs
        items={[
          { label: t("people.title", "People"), href: "/people" },
          { label: props.profile.display_name },
        ]}
        MuiBreadcrumbsProps={{
          sx: {
            mb: 1,
          },
        }}
      />
      <Box sx={{ position: "relative" }}>
        <ProfileBannerArea
          profile={props.profile}
          submitUpdate={submitUpdate}
        />
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
              <ProfileTabs
                username={props.profile.username}
                currentTab={page}
              />
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
    </OpenLayout>
  )
}
