import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import {
  Avatar,
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  Link as MaterialLink,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { HapticTab } from "../../../components/haptic"
import {
  AddAPhotoRounded,
  CreateRounded,
  DesignServicesRounded,
  InfoRounded,
  SaveRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { User } from "../../../datatypes/User"
import { Section } from "../../../components/paper/Section"
import { a11yProps, TabPanel } from "../../../components/tabs/Tabs"
import { CreateOrderForm } from "../../../views/orders/CreateOrderForm"
import {
  UserReviews,
  UserReviewSummary,
} from "../../../views/contractor/OrgReviews"
import {
  useGetUserProfileQuery,
  useUpdateProfile,
  useProfileUploadAvatarMutation,
} from "../../../store/profile"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { UserActionsDropdown } from "../../../components/profile/UserActionsDropdown"
import { FRONTEND_URL } from "../../../util/constants"
import { useTheme as useThemeHook } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { OpenLayout } from "../../../components/layout/ContainerGrid"
import { Discord } from "../../../components/icon/DiscordIcon"
import { SwipeableItem } from "../../../components/gestures"
import { ProfileBannerArea } from "./ProfileBannerArea"
import { ProfileStoreView } from "./ProfileStoreView"
import { ProfileServicesView } from "./ProfileServicesView"
import { ProfileAboutTab } from "./ProfileAboutTab"
import { PageBreadcrumbs } from "../../../components/navigation"

const name_to_index = new Map([
  ["", 0],
  ["store", 0],
  ["services", 1],
  ["about", 2],
  ["order", 3],
  ["reviews", 4],
])

export function ViewProfile(props: { profile: User }) {
  const { t } = useTranslation()
  const theme = useThemeHook<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()
  const { tab } = useParams<{ tab?: string }>()
  const page = useMemo(() => name_to_index.get(tab || "") ?? 0, [tab])

  const tabPaths = useMemo(
    () => [
      `/user/${props.profile.username}`,
      `/user/${props.profile.username}/services`,
      `/user/${props.profile.username}/about`,
      `/user/${props.profile.username}/order`,
      `/user/${props.profile.username}/reviews`,
    ],
    [props.profile.username],
  )

  const { data: myProfile } = useGetUserProfileQuery()
  const isMyProfile = useMemo(
    () => myProfile?.username === props.profile.username,
    [myProfile?.username, props.profile.username],
  )

  const [descriptionEditOpen, setDescriptionEditOpen] = useState(false)
  const [newDescription, setNewDescription] = useState("")
  const [showAvatarButton, setShowAvatarButton] = useState(false)
  const [avatarFileInputRef, setAvatarFileInputRef] =
    useState<HTMLInputElement | null>(null)
  const issueAlert = useAlertHook()
  const [updateProfile] = useUpdateProfile()
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useProfileUploadAvatarMutation()

  async function submitUpdate(data: { about?: string; display_name?: string }) {
    const res: { data?: unknown; error?: unknown } = await updateProfile(data)
    if (res?.data && !res?.error) {
      issueAlert({ message: t("viewProfile.submitted"), severity: "success" })
    } else {
      issueAlert({
        message: `${t("viewProfile.failed")} ${
          (res?.error as { error?: string; data?: { error?: string } })
            ?.error ||
          (res?.error as { error?: string; data?: { error?: string } })?.data
            ?.error ||
          res?.error
        }`,
        severity: "error",
      })
    }
    return false
  }

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1 * 1000 * 1000) {
      issueAlert({
        message: t("viewProfile.avatar_too_large", {
          defaultValue: "Avatar must be less than 1MB",
        }),
        severity: "error",
      })
      return
    }
    uploadAvatar(file)
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("viewProfile.avatar_uploaded", {
            defaultValue: "Avatar uploaded successfully",
          }),
          severity: "success",
        })
      })
      .catch(issueAlert)
      .finally(() => {
        if (avatarFileInputRef) avatarFileInputRef.value = ""
      })
  }

  return (
    <OpenLayout sidebarOpen={true}>
      <Box sx={{ position: "relative" }}>
        <ProfileBannerArea
          profile={props.profile}
          submitUpdate={submitUpdate}
        />
        <Container
          maxWidth={"xl"}
          sx={{
            ...(theme.palette.mode === "dark"
              ? { position: "relative", top: -500 }
              : { position: "relative", top: -250 }),
          }}
        >
          <Helmet>
            <meta property="og:type" content="profile" />
            <meta
              property="og:url"
              content={`${FRONTEND_URL}/people/${props.profile.username}`}
            />
            <meta
              property="og:title"
              content={`${props.profile.display_name} - SC Market`}
            />
            <meta
              property="og:description"
              content={
                props.profile.profile_description ||
                `${props.profile.display_name}'s profile on SC Market`
              }
            />
            <meta
              property="og:image"
              content={props.profile.banner || props.profile.avatar}
            />
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              name="twitter:url"
              content={`${FRONTEND_URL}/people/${props.profile.username}`}
            />
            <meta
              name="twitter:title"
              content={`${props.profile.display_name} - SC Market`}
            />
            <meta
              name="twitter:description"
              content={
                props.profile.profile_description ||
                `${props.profile.display_name}'s profile on SC Market`
              }
            />
            <meta
              name="twitter:image"
              content={props.profile.banner || props.profile.avatar}
            />
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Contractor",
                description: props.profile.profile_description,
                name: props.profile.display_name,
                username: props.profile.username,
                avatar_url: props.profile.avatar,
                banner_url: props.profile.banner,
              })}
            </script>
          </Helmet>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <PageBreadcrumbs
                items={[
                  { label: t("people.title", "People"), href: "/people" },
                  { label: props.profile.display_name },
                ]}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid
                spacing={theme.layoutSpacing.layout}
                container
                justifyContent={"space-between"}
                alignItems={"end"}
                sx={{
                  marginTop: 1,
                  [theme.breakpoints.up("lg")]: { height: 400 },
                }}
              >
                <Grid item xs={12} lg={8}>
                  <Grid
                    container
                    spacing={theme.layoutSpacing.component}
                    alignItems={"end"}
                    justifyContent={"flex-start"}
                  >
                    <Grid item>
                      {isMyProfile ? (
                        <Box
                          position={"relative"}
                          onMouseEnter={() => setShowAvatarButton(true)}
                          onMouseLeave={() => setShowAvatarButton(false)}
                        >
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleAvatarUpload}
                            ref={(input) => setAvatarFileInputRef(input)}
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
                                backgroundColor:
                                  theme.palette.background.overlay,
                                "&:hover": {
                                  backgroundColor:
                                    theme.palette.background.overlayDark,
                                },
                              }}
                            >
                              {isUploadingAvatar ? (
                                <SaveRounded />
                              ) : (
                                <AddAPhotoRounded />
                              )}
                            </IconButton>
                          </label>
                          <Avatar
                            src={props.profile.avatar}
                            sx={{
                              height: 80,
                              width: 80,
                              borderRadius: theme.spacing(
                                theme.borderRadius.image,
                              ),
                              opacity:
                                showAvatarButton || isUploadingAvatar ? 0.5 : 1,
                              transition: "0.5s",
                            }}
                            variant={"rounded"}
                          />
                        </Box>
                      ) : (
                        <Avatar
                          src={props.profile.avatar}
                          sx={{
                            height: 80,
                            width: 80,
                            borderRadius: theme.spacing(
                              theme.borderRadius.image,
                            ),
                          }}
                          variant={"rounded"}
                        />
                      )}
                    </Grid>
                    <Grid item>
                      <Typography
                        color={"text.secondary"}
                        variant={"h6"}
                        fontWeight={600}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {props.profile?.username}{" "}
                        <UserActionsDropdown user={props.profile} />
                      </Typography>
                      {props.profile?.discord_profile && (
                        <MaterialLink
                          component={"a"}
                          href={`https://discordapp.com/users/${props.profile?.discord_profile.id}`}
                          target="_blank"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <UnderlineLink
                            color={"text.primary"}
                            variant={"subtitle2"}
                            fontWeight={600}
                          >
                            @{props.profile?.discord_profile?.username}
                            {+props.profile.discord_profile.discriminator!
                              ? `#${props.profile.discord_profile.discriminator}`
                              : ""}
                          </UnderlineLink>
                          <IconButton color={"primary"}>
                            <Discord />
                          </IconButton>
                        </MaterialLink>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                <UserReviewSummary user={props.profile} />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Tabs
                value={page}
                aria-label={t("ui.aria.orgInfoArea")}
                variant="scrollable"
                textColor="secondary"
                indicatorColor="secondary"
              >
                <HapticTab
                  component={Link}
                  to={`/user/${props.profile?.username}`}
                  label={t("viewProfile.store_tab")}
                  icon={<StorefrontRounded />}
                  {...a11yProps(0)}
                />
                <HapticTab
                  label={t("viewProfile.services_tab")}
                  component={Link}
                  to={`/user/${props.profile?.username}/services`}
                  icon={<DesignServicesRounded />}
                  {...a11yProps(1)}
                />
                <HapticTab
                  label={t("viewProfile.about_tab")}
                  component={Link}
                  to={`/user/${props.profile?.username}/about`}
                  icon={<InfoRounded />}
                  {...a11yProps(2)}
                />
                <HapticTab
                  label={t("viewProfile.order_tab")}
                  component={Link}
                  to={`/user/${props.profile?.username}/order`}
                  icon={<CreateRounded />}
                  {...a11yProps(3)}
                />
                <HapticTab
                  label={t("viewProfile.reviews_tab")}
                  component={Link}
                  to={`/user/${props.profile?.username}/reviews`}
                  icon={<StarRounded />}
                  {...a11yProps(4)}
                />
              </Tabs>
              <Divider light />
            </Grid>
            <Grid item xs={12}>
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
                <TabPanel value={page} index={0}>
                  <ProfileStoreView user={props.profile.username} />
                </TabPanel>
                <TabPanel index={page} value={1}>
                  <ProfileServicesView user={props.profile?.username ?? ""} />
                </TabPanel>
                <TabPanel index={page} value={2}>
                  <ProfileAboutTab
                    profile={props.profile}
                    submitUpdate={submitUpdate}
                    isMyProfile={isMyProfile}
                  />
                </TabPanel>
                <TabPanel index={page} value={3}>
                  <Grid container spacing={theme.layoutSpacing.layout}>
                    <CreateOrderForm assigned_to={props.profile?.username} />
                  </Grid>
                </TabPanel>
                <TabPanel index={page} value={4}>
                  <Grid container spacing={theme.layoutSpacing.layout}>
                    <Section xs={12} lg={8} disablePadding>
                      <UserReviews user={props.profile} />
                    </Section>
                  </Grid>
                </TabPanel>
              </SwipeableItem>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </OpenLayout>
  )
}
