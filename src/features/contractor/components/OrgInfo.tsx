import { Contractor } from "../../../datatypes/Contractor"
import React from "react"
import { Box, Container, Grid, Skeleton, Stack, Tabs } from "@mui/material"
import { HapticTab } from "../../../components/haptic"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ContractorReviewSummary } from "../../../views/contractor/OrgReviews"
import { a11yProps } from "../../../components/tabs/Tabs"
import {
  CreateRounded,
  DesignServicesRounded,
  InfoRounded,
  PersonAddRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import { OpenLayout } from "../../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { OrgBannerArea } from "./OrgBannerArea"
import { PageBreadcrumbs } from "../../../components/navigation"
import { OrgMetaTags } from "./OrgMetaTags"
import { OrgHeader } from "./OrgHeader"
import { OrgTabs } from "./OrgTabs"
import { OrgTabContent } from "./OrgTabContent"
import { useOrgTab } from "../hooks/useOrgTab"
import { useRecruitingGetPostByOrgQuery } from "../../../store/recruiting"

export function OrgInfo(props: { contractor: Contractor }) {
  const { contractor } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const page = useOrgTab()
  const { data: recruiting_post } = useRecruitingGetPostByOrgQuery(
    contractor.spectrum_id,
  )

  return (
    <OpenLayout sidebarOpen={true}>
      <OrgMetaTags contractor={contractor} />
      <Box sx={{ position: "relative" }}>
        <OrgBannerArea org={contractor} />
        <Container
          maxWidth="xl"
          sx={{
            ...(theme.palette.mode === "dark"
              ? { position: "relative", top: -450 }
              : { position: "relative", top: -200 }),
          }}
        >
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <PageBreadcrumbs
                items={[
                  {
                    label: t("contractors.title", "Contractors"),
                    href: "/contractors",
                  },
                  { label: contractor.name },
                ]}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid
                container
                spacing={theme.layoutSpacing.component}
                alignItems="flex-end"
                justifyContent="space-between"
                minHeight={375}
              >
                <Grid item xs={12} md={8}>
                  <OrgHeader contractor={contractor} />
                </Grid>
                <ContractorReviewSummary contractor={contractor} />
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <OrgTabs
                spectrumId={contractor.spectrum_id}
                currentTab={page}
                hasRecruitingPost={!!recruiting_post}
              />
            </Grid>
            <Grid item xs={12}>
              <OrgTabContent currentTab={page} contractor={contractor} />
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
              ? { position: "relative", top: -450 }
              : { position: "relative", top: -200 }),
          }}
        >
          <Grid container spacing={theme.layoutSpacing.layout}>
            {/* Header: left = avatar + name/size/chips (md=8), right = ratings summary (md=4) */}
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
                    <Skeleton
                      variant="rectangular"
                      sx={{
                        height: theme.spacing(12),
                        width: theme.spacing(12),
                        flexShrink: 0,
                        borderRadius: theme.spacing(theme.borderRadius.image),
                      }}
                    />
                    <Stack spacing={0.5}>
                      <Skeleton
                        variant="text"
                        width={200}
                        height={28}
                        sx={{ display: "block" }}
                      />
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ mt: 0.5 }}
                      >
                        <PeopleAltRoundedIcon
                          style={{ color: theme.palette.text.primary }}
                        />
                        <Skeleton variant="text" width={40} height={20} />
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        sx={{ mt: 0.5 }}
                      >
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={28}
                          sx={{ borderRadius: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={28}
                          sx={{ borderRadius: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={28}
                          sx={{ borderRadius: 1 }}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      height: 120,
                      width: "100%",
                      borderRadius: 1,
                      maxWidth: 320,
                      ml: "auto",
                    }}
                  />
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
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<StorefrontRounded />}
                    {...a11yProps(0)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<DesignServicesRounded />}
                    {...a11yProps(1)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<InfoRounded />}
                    {...a11yProps(2)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<CreateRounded />}
                    {...a11yProps(3)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<PeopleAltRoundedIcon />}
                    {...a11yProps(4)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<PersonAddRounded />}
                    {...a11yProps(5)}
                  />
                  <HapticTab
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
