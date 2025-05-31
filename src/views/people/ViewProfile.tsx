import React, { useMemo, useState } from "react"
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material"
import { Section } from "../../components/paper/Section"
import { Link, useParams } from "react-router-dom"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import {
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
  useGetUserProfileQuery,
  useProfileRefetchMutation,
  useUpdateProfile,
} from "../../store/profile"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  MarkdownEditor,
  MarkdownRender,
} from "../../components/markdown/Markdown"
import { Helmet } from "react-helmet"
import {
  ServiceListings,
  UserRecentServices,
} from "../contracts/ServiceListings"
import { UserContractorList } from "../../components/list/UserContractorList"
import { useMarketGetListingByUserQuery } from "../../store/market"
import { useTheme } from "@mui/material/styles"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { OpenLayout } from "../../components/layout/ContainerGrid"
import { Contractor } from "../../datatypes/Contractor"
import { Discord } from "../../components/icon/DiscordIcon"
import { useGetServicesQuery } from "../../store/services"

const external_resource_pattern =
  /^https?:\/\/(www\.)?((((media)|(cdn)\.)?robertsspaceindustries\.com)|((media\.)?starcitizen.tools)|(i\.imgur\.com)|(media\.discordapp\.net)|(cdn\.discordapp\.com)|(cstone\.space))\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
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

  const { data: listings } = useMarketGetListingByUserQuery(user)
  const { data: services } = useGetServicesQuery(user)

  const order = useMemo(
    () =>
      [
        { name: "listings", items: listings || [] },
        { name: "services", items: services || [] },
      ]
        .filter((item) => item.items.length)
        .sort((a, b) => b.items.length - a.items.length),
    [listings, services],
  )

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
  const theme = useTheme()

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
        border: "none",
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

  const { data: myProfile } = useGetUserProfileQuery()
  const isMyProfile = useMemo(
    () => myProfile?.username === profile.username,
    [myProfile?.username, profile.username],
  )

  const [bannerEntryOpen, setBannerEntryOpen] = useState(false)
  const [newBannerURL, setNewBannerURL] = useState("")
  return (
    <Box
      sx={{
        position: "absolute",
        top: 8,
        left: 8,
        display: "flex",
      }}
    >
      <Collapse in={bannerEntryOpen} orientation={"horizontal"}>
        <Box
          sx={{
            backgroundColor: "#00000090",
            marginRight: 2,
          }}
        >
          <TextField
            variant={"filled"}
            label={"Image URL"}
            fullWidth
            focused
            multiline
            helperText={
              bannerEntryOpen &&
              "Direct URL to the image, from Imgur, RSI, or starcitizen.tools"
            }
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              setNewBannerURL(event.target.value)
            }}
            value={newBannerURL}
            error={
              !!newBannerURL && !newBannerURL.match(external_resource_regex)
            }
          />
        </Box>
      </Collapse>

      {isMyProfile && (
        <Fab
          color={bannerEntryOpen ? "primary" : "secondary"}
          aria-label="Set new banner"
          onClick={async () => {
            if (bannerEntryOpen && newBannerURL) {
              await submitUpdate({ banner_url: newBannerURL })
            }
            setBannerEntryOpen((v) => !v)
          }}
          sx={{
            transition: "0.3s",
          }}
        >
          {bannerEntryOpen ? <SaveRounded /> : <EditRounded />}
        </Fab>
      )}
    </Box>
  )
}

export function ProfileBannerArea(props: {
  profile: User
  submitUpdate: (arg: any) => void
}) {
  const { profile, submitUpdate } = props

  const { data: myProfile } = useGetUserProfileQuery()
  const isMyProfile = useMemo(
    () => myProfile?.username === profile.username,
    [myProfile?.username, profile.username],
  )

  const theme = useTheme()

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
  const { tab } = useParams<{ tab?: string }>()
  const page = useMemo(() => name_to_index.get(tab || "") || 0, [tab])

  const { data: myProfile } = useGetUserProfileQuery()
  const isMyProfile = useMemo(
    () => myProfile?.username === props.profile.username,
    [myProfile?.username, props.profile.username],
  )

  const [descriptionEditOpen, setDescriptionEditOpen] = useState(false)
  const [newDescription, setNewDescription] = useState("")

  const [showAvatarButton, setShowAvatarButton] = useState(false)
  const [avatarEntryOpen, setAvatarEntryOpen] = useState(false)
  const [newAvatarURL, setNewAvatarURL] = useState("")

  const issueAlert = useAlertHook()

  const [
    updateProfile, // This is the mutation trigger
  ] = useUpdateProfile()

  async function submitUpdate(data: {
    about?: string
    avatar_url?: string
    banner_url?: string
    display_name?: string
  }) {
    const res: { data?: any; error?: any } = await updateProfile(data)

    if (res?.data && !res?.error) {
      issueAlert({
        message: "Submitted!",
        severity: "success",
      })
    } else {
      issueAlert({
        message: `Failed to submit! ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
    return false
  }

  const theme = useTheme()

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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid
                spacing={2}
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
                  <Grid container spacing={2} alignItems={"end"}>
                    <Grid item>
                      {isMyProfile ? (
                        <Box
                          position={"relative"}
                          onMouseEnter={() => setShowAvatarButton(true)}
                          onMouseLeave={() => setShowAvatarButton(false)}
                        >
                          <IconButton
                            sx={{
                              opacity: showAvatarButton ? 1 : 0,
                              position: "absolute",
                              zIndex: 50,
                              transition: "0.3s",
                              color: "white",
                              top: 20,
                              left: 20,
                            }}
                            onClick={() => setAvatarEntryOpen((v) => !v)}
                          >
                            <EditRounded />
                          </IconButton>

                          <Avatar
                            src={props.profile.avatar}
                            sx={{
                              height: 80,
                              width: 80,
                              borderRadius: 4,
                              opacity: showAvatarButton ? 0.5 : 1,
                              transition: "0.5s",
                            }}
                            variant={"rounded"}
                          />

                          <Collapse
                            in={avatarEntryOpen}
                            orientation={"horizontal"}
                          >
                            <Box
                              sx={{
                                backgroundColor: "#000000D0",
                                position: "absolute",
                                zIndex: 50,
                                left: 96,
                                top: 0,
                                minWidth: 400,
                                display: "flex",
                              }}
                            >
                              <TextField
                                variant={"filled"}
                                label={"Image URL"}
                                fullWidth
                                focused
                                multiline
                                helperText={
                                  avatarEntryOpen &&
                                  "Direct URL to the image, from Imgur, RSI, or starcitizen.tools"
                                }
                                onChange={(
                                  event: React.ChangeEvent<{
                                    value: string
                                  }>,
                                ) => {
                                  setNewAvatarURL(event.target.value)
                                }}
                                value={newAvatarURL}
                                error={
                                  !!newAvatarURL &&
                                  !newAvatarURL.match(external_resource_regex)
                                }
                              />

                              <Button
                                onClick={async () => {
                                  if (avatarEntryOpen && newAvatarURL) {
                                    await submitUpdate({
                                      avatar_url: newAvatarURL,
                                    })
                                  }
                                  setAvatarEntryOpen(false)
                                }}
                              >
                                Save
                              </Button>
                            </Box>
                          </Collapse>
                        </Box>
                      ) : (
                        <Avatar
                          src={props.profile.avatar}
                          sx={{
                            height: 80,
                            width: 80,
                            borderRadius: 4,
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
                      >
                        {props.profile?.username}{" "}
                        <MaterialLink
                          component={"a"}
                          href={`https://robertsspaceindustries.com/citizens/${props.profile?.username}`}
                          target="_blank"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <IconButton color={"primary"}>
                            <LinkRounded />
                          </IconButton>
                        </MaterialLink>
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
                                  await submitUpdate({ about: newDescription })
                                  setDescriptionEditOpen(false)
                                }}
                              >
                                Save
                              </Button>
                            }
                          />
                        </Container>
                      </Modal>
                      <MarkdownRender
                        text={
                          props.profile.profile_description ||
                          "No user description"
                        }
                      />
                    </Typography>

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
                aria-label="org info area"
                variant="scrollable"
                textColor="secondary"
                indicatorColor="secondary"
              >
                <Tab
                  component={Link}
                  to={`/user/${props.profile?.username}`}
                  label="Profile"
                  icon={<InfoRounded />}
                  {...a11yProps(0)}
                />
                <Tab
                  label="Services"
                  component={Link}
                  to={`/user/${props.profile?.username}/services`}
                  icon={<DesignServicesRounded />}
                  {...a11yProps(1)}
                />
                <Tab
                  label="Market"
                  component={Link}
                  to={`/user/${props.profile?.username}/market`}
                  icon={<GavelRounded />}
                  {...a11yProps(2)}
                />
                <Tab
                  label="Order"
                  component={Link}
                  to={`/user/${props.profile?.username}/order`}
                  icon={<CreateRounded />}
                  {...a11yProps(3)}
                />
                <Tab
                  label="Reviews"
                  component={Link}
                  to={`/user/${props.profile?.username}/reviews`}
                  icon={<StarRounded />}
                  {...a11yProps(4)}
                />
              </Tabs>
              <Divider light />
            </Grid>
            <Grid item xs={12}>
              <TabPanel value={page} index={0}>
                <Grid container spacing={4}>
                  <UserRelevantListingsArea user={props.profile.username} />
                </Grid>
              </TabPanel>
              <TabPanel index={page} value={1}>
                <Grid container spacing={3}>
                  <ServiceListings user={props.profile?.username} />
                </Grid>
              </TabPanel>
              <TabPanel index={page} value={2}>
                <Grid container spacing={3}>
                  <ItemListings user={props.profile?.username} />
                </Grid>
              </TabPanel>
              <TabPanel index={page} value={3}>
                <Grid container spacing={3}>
                  <CreateOrderForm assigned_to={props.profile?.username} />
                </Grid>
              </TabPanel>
              <TabPanel index={page} value={4}>
                <Grid container spacing={2}>
                  {props.profile && <UserReviewSummary user={props.profile} />}
                  <Section xs={12} lg={8} disablePadding>
                    <UserReviews user={props.profile} />
                  </Section>
                </Grid>
              </TabPanel>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </OpenLayout>
  )
}

export function ProfileSkeleton() {
  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Skeleton
          variant="rectangular"
          sx={{
            height: 350,
            borderRadius: 3,
          }}
        />
      </Grid>
      <Grid item xs={12} container justifyContent={"space-between"}>
        <Grid item xs={12} lg={4} alignItems={"center"} spacing={2} container>
          <Grid item>
            <Skeleton
              sx={{ height: 80, width: 80, borderRadius: 4 }}
              variant={"rectangular"}
            />
          </Grid>
          <Grid item>
            <Typography
              color={"text.secondary"}
              variant={"h6"}
              fontWeight={600}
            >
              <Skeleton variant={"text"} width={200} />
            </Typography>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          lg={5}
          container
          spacing={2}
          alignItems={"center"}
          justifyContent={"right"}
        />
      </Grid>
    </React.Fragment>
  )
}
