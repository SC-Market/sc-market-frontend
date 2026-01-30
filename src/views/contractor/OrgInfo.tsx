import { Contractor } from "../../datatypes/Contractor"
import React, { useMemo } from "react"
import { Helmet } from "react-helmet"
import { FRONTEND_URL } from "../../util/constants"
import {
  Avatar,
  Box,
  Chip,
  Container,
  Fab,
  Grid,
  IconButton,
  Link as MaterialLink,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { contractorKindIcons } from "./ContractorList"
import CreateIcon from "@mui/icons-material/CreateRounded"
import { CreateOrderForm } from "../orders/CreateOrderForm"
import { ContractorReviewSummary, OrgReviews } from "./OrgReviews"
import InfoIcon from "@mui/icons-material/Info"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import {
  CreateRounded,
  DesignServicesRounded,
  InfoRounded,
  LinkRounded,
  PersonAddRounded,
  RefreshRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import { MemberList } from "./OrgMembers"
import { OrgListings, OrgRecentListings } from "../market/ItemListings"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { Link, useParams } from "react-router-dom"
import { OrgRecentServices } from "../contracts/ServiceListings"
import { Section } from "../../components/paper/Section"
import { useSearchMarketQuery } from "../../features/market"
import { RecruitingPostArea } from "../../pages/recruiting/RecruitingPostPage"
import { useRecruitingGetPostByOrgQuery } from "../../store/recruiting"
import {
  DarkBannerContainer,
  LightBannerContainer,
} from "../people/ViewProfile"
import { OrgStoreView } from "../people/ProfileStoreView"
import { OrgServicesView } from "../people/ProfileServicesView"
import { OpenLayout } from "../../components/layout/ContainerGrid"
import { useGetUserProfileQuery } from "../../store/profile"
import { useRefetchContractorDetailsMutation } from "../../store/contractor"
import { useGetServicesContractorQuery } from "../../store/services"
import { useTranslation } from "react-i18next"
import { ReportButton } from "../../components/button/ReportButton"

const name_to_index = new Map([
  ["", 0],
  ["store", 0],
  ["services", 1],
  ["about", 2],
  ["order", 3],
  ["members", 4],
  ["recruiting", 5],
  ["reviews", 6],
])

export function OrgRelevantListingsArea(props: { org: string }) {
  const { org } = props

  const { data: searchResults } = useSearchMarketQuery({
    contractor_seller: org,
    quantityAvailable: 1,
    index: 0,
    page_size: 96, // Large page size to get all listings
    listing_type: undefined,
  })

  const listings = searchResults?.listings || []
  const { data: services } = useGetServicesContractorQuery(org)

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
          <OrgRecentListings org={org} key={org} />
        ) : (
          <OrgRecentServices org={org} key={org} />
        ),
      )}
    </>
  )
}

export function OrgRefetchButton(props: { org: Contractor }) {
  const { data: profile } = useGetUserProfileQuery()
  const [refetch] = useRefetchContractorDetailsMutation()
  const { t } = useTranslation()

  return (
    <>
      {profile?.role === "admin" && (
        <Fab
          color={"warning"}
          sx={{ left: 8, top: 8, position: "absolute" }}
          onClick={() => refetch(props.org.spectrum_id)}
        >
          <RefreshRounded />
        </Fab>
      )}
    </>
  )
}

export function OrgBannerArea(props: { org: Contractor }) {
  const { org } = props

  const theme = useTheme<ExtendedTheme>()

  return theme.palette.mode === "dark" ? (
    <DarkBannerContainer profile={org}>
      <OrgRefetchButton org={org} />
    </DarkBannerContainer>
  ) : (
    <LightBannerContainer profile={org} />
  )
}

export function OrgInfo(props: { contractor: Contractor }) {
  const { contractor } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const { tab } = useParams<{ tab?: string }>()
  const page = useMemo(() => name_to_index.get(tab || "") || 0, [tab])
  const { data: recruiting_post } = useRecruitingGetPostByOrgQuery(
    contractor.spectrum_id,
  )

  return (
    <OpenLayout sidebarOpen={true}>
      <Helmet>
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${FRONTEND_URL}/contractor/${contractor.spectrum_id}`}
        />
        <meta property="og:title" content={`${contractor.name} - SC Market`} />
        <meta
          property="og:description"
          content={contractor.description || `${contractor.name} on SC Market`}
        />
        <meta
          property="og:image"
          content={contractor.banner || contractor.avatar}
        />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:url"
          content={`${FRONTEND_URL}/contractor/${contractor.spectrum_id}`}
        />
        <meta name="twitter:title" content={`${contractor.name} - SC Market`} />
        <meta
          name="twitter:description"
          content={contractor.description || `${contractor.name} on SC Market`}
        />
        <meta
          name="twitter:image"
          content={contractor.banner || contractor.avatar}
        />
      </Helmet>
      <Box sx={{ position: "relative" }}>
        <OrgBannerArea org={contractor} />
        <Container
          maxWidth={"xl"}
          sx={{
            ...(theme.palette.mode === "dark"
              ? {
                  position: "relative",
                  top: -450,
                }
              : {
                  position: "relative",
                  top: -200,
                }),
          }}
        >
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <Grid
                container
                spacing={theme.layoutSpacing.component}
                alignItems={"flex-end"}
                justifyContent={"space-between"}
                minHeight={375}
              >
                <Grid item xs={12} md={8}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    flexWrap="wrap"
                  >
                    <Avatar
                      src={contractor?.avatar}
                      aria-label={t("contractors.contractor")}
                      variant={"rounded"}
                      sx={{
                        height: theme.spacing(12),
                        width: theme.spacing(12),
                        flexShrink: 0,
                        objectFit: "cover",
                      }}
                    />
                    <Stack spacing={0.5}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          color={"text.secondary"}
                          variant={"h6"}
                          fontWeight={600}
                        >
                          {contractor.name}
                        </Typography>
                        {!contractor.spectrum_id.startsWith("~") && (
                          <MaterialLink
                            component={"a"}
                            href={`https://robertsspaceindustries.com/orgs/${contractor.spectrum_id}`}
                            target="_blank"
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            <IconButton color={"primary"} size="small">
                              <LinkRounded />
                            </IconButton>
                          </MaterialLink>
                        )}
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <PeopleAltRoundedIcon
                          style={{ color: theme.palette.text.primary }}
                        />
                        <Typography
                          color={"text.primary"}
                          fontWeight={"bold"}
                        >
                          {contractor.size}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {contractor.fields.map((field) => (
                          <Chip
                            key={field}
                            color={"primary"}
                            label={field}
                            sx={{
                              padding: 0.5,
                              textTransform: "capitalize",
                            }}
                            size={'small'}
                            variant={"outlined"}
                            icon={contractorKindIcons[field]}
                            onClick={
                              (event) =>
                                event.stopPropagation()
                            }
                          />
                        ))}
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
                <ContractorReviewSummary contractor={contractor} />
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
                <Tabs
                  value={page}
                  // onChange={handleChange}
                  aria-label={t("ui.aria.orgInfoArea")}
                  variant="scrollable"
                >
                  <Tab
                    label={t("orgInfo.store")}
                    component={Link}
                    to={`/contractor/${contractor.spectrum_id}`}
                    icon={<StorefrontRounded />}
                    {...a11yProps(0)}
                  />
                  <Tab
                    label={t("orgInfo.services")}
                    component={Link}
                    to={`/contractor/${contractor.spectrum_id}/services`}
                    icon={<DesignServicesRounded />}
                    {...a11yProps(1)}
                  />
                  <Tab
                    label={t("orgInfo.about")}
                    component={Link}
                    to={`/contractor/${contractor.spectrum_id}/about`}
                    icon={<InfoRounded />}
                    {...a11yProps(2)}
                  />
                  <Tab
                    label={t("orgInfo.order")}
                    component={Link}
                    to={`/contractor/${contractor.spectrum_id}/order`}
                    icon={<CreateRounded />}
                    {...a11yProps(3)}
                  />
                  <Tab
                    label={t("orgInfo.members")}
                    component={Link}
                    to={`/contractor/${contractor.spectrum_id}/members`}
                    icon={<PeopleAltRoundedIcon />}
                    {...a11yProps(4)}
                  />
                  {recruiting_post && (
                    <Tab
                      label={t("orgInfo.recruiting")}
                      component={Link}
                      to={`/contractor/${contractor.spectrum_id}/recruiting`}
                      icon={<PersonAddRounded />}
                      {...a11yProps(5)}
                    />
                  )}
                  <Tab
                    label={t("orgInfo.reviews")}
                    component={Link}
                    to={`/contractor/${contractor.spectrum_id}/reviews`}
                    icon={<StarRounded />}
                    {...a11yProps(6)}
                  />
                </Tabs>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TabPanel value={page} index={0}>
                <OrgStoreView org={contractor.spectrum_id} />
              </TabPanel>
              <TabPanel value={page} index={1}>
                <OrgServicesView org={contractor.spectrum_id} />
              </TabPanel>
              <TabPanel value={page} index={2}>
                <Container maxWidth={"xl"} disableGutters>
                  <Grid
                    container
                    spacing={theme.layoutSpacing.layout}
                    justifyContent={"center"}
                  >
                    <Grid item xs={12}>
                      <Paper
                        sx={{
                          padding: 2,
                          paddingTop: 1,
                          maxHeight: 400,
                          overflow: "auto",
                        }}
                      >
                        <MarkdownRender text={contractor.description} />
                        {contractor.languages &&
                          contractor.languages.length > 0 && (
                            <Box
                              sx={{
                                mt: 2,
                                display: "flex",
                                gap: 0.5,
                                flexWrap: "wrap",
                              }}
                            >
                              {contractor.languages.map((lang) => (
                                <Chip
                                  key={lang.code}
                                  label={`${lang.name} (${t(`languages.${lang.code}`, lang.name)})`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Container>
              </TabPanel>
              <TabPanel value={page} index={3}>
                <Grid container spacing={theme.layoutSpacing.layout}>
                  <CreateOrderForm contractor_id={contractor.spectrum_id} />
                </Grid>
              </TabPanel>
              <TabPanel value={page} index={4}>
                <Grid container spacing={theme.layoutSpacing.layout}>
                  <MemberList contractor={contractor} />
                </Grid>
              </TabPanel>
              <TabPanel value={page} index={5}>
                <Grid container spacing={theme.layoutSpacing.layout}>
                  <RecruitingPostArea spectrum_id={contractor.spectrum_id} />
                </Grid>
              </TabPanel>
              <TabPanel value={page} index={6}>
                <Grid container spacing={theme.layoutSpacing.layout}>
                  <Section xs={12} lg={8} disablePadding>
                    <OrgReviews contractor={contractor} />
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

export function OrgInfoSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <OpenLayout sidebarOpen={true}>
      <Box sx={{ position: "relative" }}>
        {/* Banner skeleton */}
        <Skeleton
          variant="rectangular"
          sx={{
            height: theme.palette.mode === "dark" ? 450 : 200,
            width: "100%",
            borderRadius: 0,
          }}
        />
        <Container
          maxWidth={"xl"}
          sx={{
            ...(theme.palette.mode === "dark"
              ? {
                  position: "relative",
                  top: -450,
                }
              : {
                  position: "relative",
                  top: -200,
                }),
          }}
        >
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <Grid
                container
                spacing={theme.layoutSpacing.component}
                alignItems={"flex-end"}
                minHeight={375}
              >
                <Grid item md={4}>
                  <Grid container spacing={theme.layoutSpacing.text}>
                    <Grid item sm={4}>
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          maxHeight: theme.spacing(12),
                          maxWidth: theme.spacing(12),
                          width: "100%",
                          height: "100%",
                          borderRadius: theme.spacing(theme.borderRadius.image),
                        }}
                      />
                    </Grid>
                    <Grid item sm={8}>
                      <Grid container spacing={0}>
                        <Grid item>
                          <Skeleton
                            variant="text"
                            width={200}
                            height={28}
                            sx={{ mb: 1 }}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          alignItems={"center"}
                          display={"flex"}
                        >
                          <PeopleAltRoundedIcon
                            style={{ color: theme.palette.text.primary }}
                          />
                          <Skeleton
                            variant="text"
                            width={40}
                            height={20}
                            sx={{ marginLeft: 1 }}
                          />
                        </Grid>
                        <Grid item>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                          >
                            <Skeleton
                              variant="circular"
                              width={16}
                              height={16}
                            />
                            <Skeleton variant="text" width={60} height={16} />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Box>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          <Skeleton
                            variant="rectangular"
                            width={100}
                            height={32}
                            sx={{
                              borderRadius: 1,
                              marginBottom: 0.5,
                            }}
                          />
                          <Skeleton
                            variant="rectangular"
                            width={100}
                            height={32}
                            sx={{
                              borderRadius: 1,
                              marginBottom: 0.5,
                            }}
                          />
                          <Skeleton
                            variant="rectangular"
                            width={100}
                            height={32}
                            sx={{
                              borderRadius: 1,
                              marginBottom: 0.5,
                            }}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Paper
                    sx={{ padding: 1, maxHeight: 350, overflow: "scroll" }}
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
                  aria-label={t("ui.aria.orgInfoArea")}
                  variant="scrollable"
                >
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<StorefrontRounded />}
                    {...a11yProps(0)}
                  />
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<DesignServicesRounded />}
                    {...a11yProps(1)}
                  />
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<InfoRounded />}
                    {...a11yProps(2)}
                  />
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<CreateRounded />}
                    {...a11yProps(3)}
                  />
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<PeopleAltRoundedIcon />}
                    {...a11yProps(4)}
                  />
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<PersonAddRounded />}
                    {...a11yProps(5)}
                  />
                  <Tab
                    label={<Skeleton width={60} />}
                    icon={<StarRounded />}
                    {...a11yProps(6)}
                  />
                </Tabs>
              </Box>
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
