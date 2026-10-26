import { Contractor } from "../domain/types"
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
import { useTranslation } from "react-i18next"
import { OrgBannerArea } from "./OrgBannerArea"
import {
  BANNER_HEIGHT,
  BANNER_OVERLAP,
} from "../../profile/components/BannerContainers"
import { ShopListSkeleton } from "../../../components/skeletons/ShopCardSkeleton"
import { OrgMetaTags } from "./OrgMetaTags"
import { OrgHeader } from "./OrgHeader"
import { OrgTabs } from "./OrgTabs"
import { OrgTabContent } from "./OrgTabContent"
import { useOrgTab } from "../hooks/useOrgTab"
import { useRecruitingGetPostByOrgQuery } from "../../recruiting/api/recruitingApi"

export function OrgInfo(props: { contractor: Contractor }) {
  const { contractor } = props
  const theme = useTheme<ExtendedTheme>()

  const page = useOrgTab()
  const { data: recruiting_post } = useRecruitingGetPostByOrgQuery(
    contractor.spectrum_id,
  )

  return (
    <Box sx={{ position: "relative" }}>
      <OrgMetaTags contractor={contractor} />
      <OrgBannerArea org={contractor} />
      <Box
        sx={{
          position: "relative",
          top: -BANNER_OVERLAP[theme.palette.mode],
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={theme.layoutSpacing.layout}>
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
          </Grid>
        </Container>
        <OrgTabContent currentTab={page} contractor={contractor} />
      </Box>
    </Box>
  )
}

export function OrgInfoSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
      <Box sx={{ position: "relative" }}>
        <Skeleton
          variant="rectangular"
          sx={{
            height: BANNER_HEIGHT[theme.palette.mode],
            width: "100%",
            borderRadius: 0,
          }}
        />
        <Container
          maxWidth={"xl"}
          sx={{
            position: "relative",
            top: -BANNER_OVERLAP[theme.palette.mode],
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
                  {/* OrgTabs' always-present tabs (Recruiting only shows
                      when the org has a post) */}
                  <HapticTab
                    label={t("orgInfo.store")}
                    icon={<StorefrontRounded />}
                    {...a11yProps(0)}
                  />
                  <HapticTab
                    label={t("orgInfo.about")}
                    icon={<InfoRounded />}
                    {...a11yProps(1)}
                  />
                  <HapticTab
                    label={t("orgInfo.order")}
                    icon={<CreateRounded />}
                    {...a11yProps(2)}
                  />
                  <HapticTab
                    label={t("orgInfo.members")}
                    icon={<PeopleAltRoundedIcon />}
                    {...a11yProps(3)}
                  />
                  <HapticTab
                    label={t("orgInfo.reviews")}
                    icon={<StarRounded />}
                    {...a11yProps(5)}
                  />
                </Tabs>
              </Box>
            </Grid>
          </Grid>
        </Container>
        {/* OrgTabContent: the store tab's shop cards */}
        <Container
          maxWidth="xl"
          sx={{
            pt: 3,
            position: "relative",
            top: -BANNER_OVERLAP[theme.palette.mode],
          }}
        >
          <ShopListSkeleton />
        </Container>
      </Box>
  
  )
}
