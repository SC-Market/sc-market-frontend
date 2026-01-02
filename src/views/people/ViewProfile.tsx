import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { User } from "../../datatypes/User"
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Fab,
  Grid,
  IconButton,
  Link as MaterialLink,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  useMediaQuery,
} from "@mui/material"
import { Section } from "../../components/paper/Section"
import { Link, useParams, useNavigate } from "react-router-dom"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import {
  AddAPhotoRounded,
  CreateRounded,
  DesignServicesRounded,
  EditRounded,
  GavelRounded,
  InfoRounded,
  LinkRounded,
  RefreshRounded,
  SaveRounded,
  StarRounded,
} from "@mui/icons-material"
import { CreateOrderForm } from "../orders/CreateOrderForm"
import { UserReviews, UserReviewSummary } from "../contractor/OrgReviews"
import { ItemListings, UserRecentListings } from "../market/ItemListings"
import {
  SellerRatingCount,
  SellerRatingStars,
} from "../../components/rating/ListingRating"
import {
  useGetUserProfileQuery,
  useProfileRefetchMutation,
  useProfileUploadAvatarMutation,
  useProfileUploadBannerMutation,
  useUpdateProfile,
} from "../../store/profile"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  MarkdownEditor,
  MarkdownRender,
} from "../../components/markdown/Markdown"

import { UserActionsDropdown } from "../../components/profile/UserActionsDropdown"
import { Helmet } from "react-helmet"
import { FRONTEND_URL } from "../../util/constants"
import {
  ServiceListings,
  UserRecentServices,
} from "../contracts/ServiceListings"
import { UserContractorList } from "../../components/list/UserContractorList"
import { useSearchMarketListingsQuery } from "../../store/market"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { OpenLayout } from "../../components/layout/ContainerGrid"
import { Contractor } from "../../datatypes/Contractor"
import { Discord } from "../../components/icon/DiscordIcon"
import { EmptyListings } from "../../components/empty-states"
import { useGetServicesQuery } from "../../store/services"
import { BottomSheet } from "../../components/mobile/BottomSheet"
import { SwipeableItem } from "../../components/gestures"

const external_resource_pattern =
  /^https?:\/\/(www\.)?((((media)|(cdn)\.)?robertsspaceindustries\.com)|((media\.)?starcitizen.tools)|(i\.imgur\.com)|(cstone\.space))\b([-a-zA-Z0-9()@:%_+.~#?&\/=]*)$/
export const external_resource_regex = new RegExp(external_resource_pattern)

const name_to_index = new Map([
  ["", 0],
  ["services", 1],
  ["market", 2],
  ["order", 3],
  ["reviews", 4],
])

// const index_to_name = new Map([
//     [0, 'profile'],
//     [1, 'market'],
//     [2, 'order'],
//     [3, 'reviews'],
// ])

export function ProfileRefetchButton(props: { user: User }) {
  const { data: profile } = useGetUserProfileQuery()
  const [refetch] = useProfileRefetchMutation()

  return (
    <>
      {profile?.role === "admin" && (
        <Fab
          color={"warning"}
          sx={{ right: 8, top: 8, position: "absolute" }}
          onClick={() => refetch(props.user.username)}
        >
          <RefreshRounded />
        </Fab>
      )}
    </>
  )
}

export function UserRelevantListingsArea(props: { user: string }) {
  const { user } = props
  const { t } = useTranslation()

  const { data: listings } = useSearchMarketListingsQuery({
    user_seller: user,
  })
  const { data: services } = useGetServicesQuery(user)

  const order = useMemo(
    () =>
      [
        { name: "listings", items: listings?.listings || [] },
        { name: "services", items: services || [] },
      ]
        .filter((item) => item.items.length)
        .sort((a, b) => b.items.length - a.items.length),
    [listings, services],
  )

  // Show empty state if both listings and services are empty
  if (order.length === 0) {
    return (
      <Grid item xs={12}>
        <EmptyListings
          isSearchResult={false}
          showCreateAction={false}
          title={t("emptyStates.profile.noContent", {
            defaultValue: "No listings or services yet",
          })}
          description={t("emptyStates.profile.noContentDescription", {
            defaultValue:
              "This user hasn't created any listings or services yet",
          })}
        />
      </Grid>
    )
  }

  return (
    <>
      {order.map((item) =>
        item.name === "listings" ? (
          <UserRecentListings user={user} key={item.name} />
        ) : (
          <UserRecentServices user={user} key={item.name} />
        ),
      )}
    </>
  )
}

export function LightBannerContainer(props: {
  children?: React.ReactNode
  profile: User | Contractor
}) {
  const { profile } = props

  return (
    <Paper
      sx={{
        height: 250,
        background: `url(${profile.banner})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        borderRadius: 0,
        position: "relative",
        padding: 3,
      }}
    >
      {props.children}
    </Paper>
  )
}

export function DarkBannerContainer(props: {
  children?: React.ReactNode
  profile: User | Contractor
}) {
  const { profile } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Paper
      sx={{
        height: 500,
        background: `url(${profile.banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: 0,
        position: "relative",
        padding: 3,
      }}
    >
      <Box
        sx={{
          width: "100%",
          position: "absolute",
          height: 500,
          top: 0,
          left: 0,
          background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default}99 60%, ${theme.palette.background.default} 100%)`,
        }}
      />
      {props.children}
    </Paper>
  )
}

function BannerEditArea(props: {
  profile: User
  submitUpdate: (arg: any) => void
}) {
  const { profile, submitUpdate } = props
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

    // Validate file size (2.5MB limit for banners)
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
        // Reset file input
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
              sx={{
                transition: "0.3s",
              }}
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
  const { t } = useTranslation()

  const { data: myProfile } = useGetUserProfileQuery()
  const isMyProfile = useMemo(
    () => myProfile?.username === profile.username,
    [myProfile?.username, profile.username],
  )

  const theme = useTheme<ExtendedTheme>()

  return theme.palette.mode === "dark" ? (
    <DarkBannerContainer profile={profile}>
      {isMyProfile && (
        <BannerEditArea submitUpdate={submitUpdate} profile={profile} />
      )}
      {/*<ProfileRefetchButton user={profile}/>*/}
    </DarkBannerContainer>
  ) : (
    <LightBannerContainer profile={profile}>
      {isMyProfile && (
        <BannerEditArea submitUpdate={submitUpdate} profile={profile} />
      )}
      {/*<ProfileRefetchButton user={profile}/>*/}
    </LightBannerContainer>
  )
}

export function ViewProfile(props: { profile: User }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()
  const { tab } = useParams<{ tab?: string }>()
  const page = useMemo(() => name_to_index.get(tab || "") || 0, [tab])

  // Tab paths for navigation
  const tabPaths = useMemo(
    () => [
      `/user/${props.profile.username}`,
      `/user/${props.profile.username}/services`,
      `/user/${props.profile.username}/market`,
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

  const [
    updateProfile, // This is the mutation trigger
  ] = useUpdateProfile()

  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useProfileUploadAvatarMutation()

  async function submitUpdate(data: { about?: string; display_name?: string }) {
    const res: { data?: any; error?: any } = await updateProfile(data)

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("viewProfile.submitted"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("viewProfile.failed")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
    return false
  }

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (1MB limit for avatars)
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
        // Reset file input
        if (avatarFileInputRef) {
          avatarFileInputRef.value = ""
        }
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
          maxWidth={"lg"}
          sx={{
            ...(theme.palette.mode === "dark"
              ? {
                  position: "relative",
                  top: -500,
                }
              : {
                  position: "relative",
                  top: -250,
                }),
          }}
        >
          <Helmet>
            {/* Open Graph Meta Tags */}
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

            {/* Twitter Card Meta Tags */}
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
              <Grid
                spacing={theme.layoutSpacing.layout}
                container
                justifyContent={"space-between"}
                alignItems={"end"}
                sx={{
                  marginTop: 1,
                  [theme.breakpoints.up("lg")]: {
                    height: 400,
                  },
                }}
              >
                <Grid item lg={6}>
                  <Grid
                    container
                    spacing={theme.layoutSpacing.component}
                    alignItems={"end"}
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
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <SellerRatingStars user={props.profile} />
                        <SellerRatingCount
                          user={props.profile}
                          display_limit={undefined}
                        />
                      </Box>
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
                    <Grid item sx={{ maxHeight: 200, overflowX: "scroll" }}>
                      <UserContractorList
                        contractors={props.profile?.contractors || []}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item lg={6}>
                  <Paper
                    sx={{
                      padding: 2,
                      paddingTop: 1,
                      position: "relative",
                      maxHeight: 350,
                      overflowY: "scroll",
                    }}
                  >
                    <Typography sx={{ width: "100%" }}>
                      {isMobile ? (
                        <BottomSheet
                          open={descriptionEditOpen}
                          onClose={() => setDescriptionEditOpen(false)}
                          title={t(
                            "viewProfile.editDescription",
                            "Edit Description",
                          )}
                          maxHeight="90vh"
                          fullHeight
                        >
                          <MarkdownEditor
                            sx={{ width: "100%" }}
                            onChange={(value: string) => {
                              setNewDescription(value)
                            }}
                            value={newDescription}
                            BarItems={
                              <Button
                                variant={"contained"}
                                onClick={async () => {
                                  await submitUpdate({ about: newDescription })
                                  setDescriptionEditOpen(false)
                                }}
                              >
                                {t("ui.buttons.save")}
                              </Button>
                            }
                          />
                        </BottomSheet>
                      ) : (
                        <Modal
                          open={descriptionEditOpen}
                          onClose={() => setDescriptionEditOpen(false)}
                        >
                          <Container
                            maxWidth={"lg"}
                            sx={{
                              height: "100%",
                              alignItems: "center",
                              justifyContent: "center",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <MarkdownEditor
                              sx={{ width: "100%" }}
                              onChange={(value: string) => {
                                setNewDescription(value)
                              }}
                              value={newDescription}
                              BarItems={
                                <Button
                                  variant={"contained"}
                                  onClick={async () => {
                                    await submitUpdate({
                                      about: newDescription,
                                    })
                                    setDescriptionEditOpen(false)
                                  }}
                                >
                                  {t("ui.buttons.save")}
                                </Button>
                              }
                            />
                          </Container>
                        </Modal>
                      )}
                      <MarkdownRender
                        text={
                          props.profile.profile_description ||
                          t("viewProfile.no_user_description")
                        }
                      />
                    </Typography>
                    {props.profile.languages &&
                      props.profile.languages.length > 0 && (
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            gap: 0.5,
                            flexWrap: "wrap",
                          }}
                        >
                          {props.profile.languages.map((lang) => (
                            <Chip
                              key={lang.code}
                              label={`${lang.name} (${t(`languages.${lang.code}`, lang.name)})`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}

                    {isMyProfile && (
                      <Fab
                        color={"primary"}
                        size={"small"}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                        }}
                        onClick={() => {
                          setDescriptionEditOpen(true)
                          setNewDescription(props.profile.profile_description)
                        }}
                      >
                        <EditRounded />
                      </Fab>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            {/*<Grid item xs={12} container justifyContent={'space-between'}>*/}
            {/*<Grid item xs={12} lg={5} container spacing={2} alignItems={'center'} justifyContent={'right'}>*/}
            {/*    <Grid item>*/}
            {/*        <Button variant={'outlined'} color={'secondary'} startIcon={<LocalShippingIcon/>}>*/}
            {/*            Work Order*/}
            {/*        </Button>*/}
            {/*    </Grid>*/}
            {/*    <Grid item>*/}
            {/*        <Button variant={'contained'} color={'secondary'} startIcon={<SendIcon/>}>Send Message</Button>*/}
            {/*    </Grid>*/}
            {/*    <Grid item>*/}
            {/*        <IconButton color={'primary'} sx={{borderRadius: 2}}><MoreHorizIcon/></IconButton>*/}
            {/*    </Grid>*/}
            {/*</Grid>*/}
            {/*</Grid>*/}
            <Grid item xs={12}>
              <Tabs
                value={page}
                // onChange={handleChange}
                aria-label={t("ui.aria.orgInfoArea")}
                variant="scrollable"
                textColor="secondary"
                indicatorColor="secondary"
              >
                <Tab
                  component={Link}
                  to={`/user/${props.profile?.username}`}
                  label={t("viewProfile.profile_tab")}
                  icon={<InfoRounded />}
                  {...a11yProps(0)}
                />
                <Tab
                  label={t("viewProfile.services_tab")}
                  component={Link}
                  to={`/user/${props.profile?.username}/services`}
                  icon={<DesignServicesRounded />}
                  {...a11yProps(1)}
                />
                <Tab
                  label={t("viewProfile.market_tab")}
                  component={Link}
                  to={`/user/${props.profile?.username}/market`}
                  icon={<GavelRounded />}
                  {...a11yProps(2)}
                />
                <Tab
                  label={t("viewProfile.order_tab")}
                  component={Link}
                  to={`/user/${props.profile?.username}/order`}
                  icon={<CreateRounded />}
                  {...a11yProps(3)}
                />
                <Tab
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
                  // Swipe left = next tab
                  if (page < tabPaths.length - 1) {
                    navigate(tabPaths[page + 1])
                  }
                }}
                onSwipeRight={() => {
                  // Swipe right = previous tab
                  if (page > 0) {
                    navigate(tabPaths[page - 1])
                  }
                }}
                enabled={isMobile}
              >
                <TabPanel value={page} index={0}>
                  <Grid container spacing={theme.layoutSpacing.layout}>
                    <UserRelevantListingsArea user={props.profile.username} />
                  </Grid>
                </TabPanel>
                <TabPanel index={page} value={1}>
                  <Grid container spacing={theme.layoutSpacing.layout}>
                    <ServiceListings user={props.profile?.username} />
                  </Grid>
                </TabPanel>
                <TabPanel index={page} value={2}>
                  <Grid container spacing={theme.layoutSpacing.layout}>
                    <ItemListings user={props.profile?.username} />
                  </Grid>
                </TabPanel>
                <TabPanel index={page} value={3}>
                  <Grid container spacing={theme.layoutSpacing.layout}>
                    <CreateOrderForm assigned_to={props.profile?.username} />
                  </Grid>
                </TabPanel>
                <TabPanel index={page} value={4}>
                  <Grid container spacing={theme.layoutSpacing.layout}>
                    {props.profile && <UserReviewSummary user={props.profile} />}
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

export function ProfileSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <OpenLayout sidebarOpen={true}>
      <Box sx={{ position: "relative" }}>
        {/* Banner skeleton */}
        <Skeleton
          variant="rectangular"
          sx={{
            height: theme.palette.mode === "dark" ? 500 : 250,
            width: "100%",
            borderRadius: 0,
          }}
        />
        <Container
          maxWidth={"lg"}
          sx={{
            ...(theme.palette.mode === "dark"
              ? {
                  position: "relative",
                  top: -500,
                }
              : {
                  position: "relative",
                  top: -250,
                }),
          }}
        >
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <Grid
                spacing={theme.layoutSpacing.layout}
                container
                justifyContent={"space-between"}
                alignItems={"end"}
                sx={{
                  marginTop: 1,
                  [theme.breakpoints.up("lg")]: {
                    height: 400,
                  },
                }}
              >
                <Grid item lg={6}>
                  <Grid
                    container
                    spacing={theme.layoutSpacing.component}
                    alignItems={"end"}
                  >
                    <Grid item>
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          height: 80,
                          width: 80,
                          borderRadius: theme.spacing(theme.borderRadius.image),
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Skeleton
                        variant="text"
                        width={200}
                        height={28}
                        sx={{ mb: 1 }}
                      />
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Skeleton variant="circular" width={16} height={16} />
                        <Skeleton variant="text" width={60} height={16} />
                      </Stack>
                      <Skeleton variant="text" width={150} height={20} />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sx={{ maxHeight: 200, overflowX: "scroll" }}
                    >
                      <Stack direction="row" spacing={1}>
                        <Skeleton
                          variant="rectangular"
                          width={120}
                          height={80}
                          sx={{ borderRadius: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={120}
                          height={80}
                          sx={{ borderRadius: 1 }}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item lg={6}>
                  <Paper
                    sx={{
                      padding: 2,
                      paddingTop: 1,
                      position: "relative",
                      maxHeight: 350,
                      overflowY: "scroll",
                    }}
                  >
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={20}
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={20}
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={20}
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={20}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={24}
                        sx={{ borderRadius: 1 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={24}
                        sx={{ borderRadius: 1 }}
                      />
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
                <Tabs
                  value={0}
                  aria-label="Profile tabs"
                  variant="scrollable"
                  textColor="secondary"
                  indicatorColor="secondary"
                >
                  <Tab label={<Skeleton width={60} />} icon={<InfoRounded />} />
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<DesignServicesRounded />}
                  />
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<GavelRounded />}
                  />
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<CreateRounded />}
                  />
                  <Tab label={<Skeleton width={60} />} icon={<StarRounded />} />
                </Tabs>
              </Box>
              <Divider light />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={400}
                  sx={{
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </OpenLayout>
  )
}
