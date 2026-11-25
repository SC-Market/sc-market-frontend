import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Box, Tabs } from "@mui/material"
import {
  CreateRounded,
  InfoRounded,
  PersonAddRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { HapticTab } from "../../../components/haptic"
import { a11yProps } from "../../../components/tabs/Tabs"
import { ORG_PATHS } from "../../../routes/paths"

interface OrgTabsProps {
  spectrumId: string
  currentTab: number
  hasRecruitingPost: boolean
}

export function OrgTabs({
  spectrumId,
  currentTab,
  hasRecruitingPost,
}: OrgTabsProps) {
  const { t } = useTranslation()

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
      <Tabs
        value={currentTab}
        aria-label={t("ui.aria.orgInfoArea")}
        variant="scrollable"
        // On a phone not every tab fits: show the scroll arrows so the
        // rest (Members, Reviews) can be found. Same in OrgInfoSkeleton.
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {/* Each tab's value is its useOrgTab index: Recruiting is only
            rendered when the org has a post, and MUI's implicit (child
            order) values would shift Reviews to 4 without it. */}
        <HapticTab
          label={t("orgInfo.store")}
          component={Link}
          to={ORG_PATHS.profile(spectrumId)}
          icon={<StorefrontRounded />}
          value={0}
          {...a11yProps(0)}
        />
        <HapticTab
          label={t("orgInfo.about")}
          component={Link}
          to={ORG_PATHS.profileTab(spectrumId, "about")}
          icon={<InfoRounded />}
          value={1}
          {...a11yProps(1)}
        />
        <HapticTab
          label={t("orgInfo.order")}
          component={Link}
          to={ORG_PATHS.profileTab(spectrumId, "order")}
          icon={<CreateRounded />}
          value={2}
          {...a11yProps(2)}
        />
        <HapticTab
          label={t("orgInfo.members")}
          component={Link}
          to={ORG_PATHS.profileTab(spectrumId, "members")}
          icon={<PeopleAltRoundedIcon />}
          value={3}
          {...a11yProps(3)}
        />
        {hasRecruitingPost && (
          <HapticTab
            label={t("orgInfo.recruiting")}
            component={Link}
            to={ORG_PATHS.profileTab(spectrumId, "recruiting")}
            icon={<PersonAddRounded />}
            value={4}
            {...a11yProps(4)}
          />
        )}
        <HapticTab
          label={t("orgInfo.reviews")}
          component={Link}
          to={ORG_PATHS.profileTab(spectrumId, "reviews")}
          icon={<StarRounded />}
          value={5}
          {...a11yProps(5)}
        />
      </Tabs>
    </Box>
  )
}
