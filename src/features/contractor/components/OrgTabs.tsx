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
      >
        <HapticTab
          label={t("orgInfo.store")}
          component={Link}
          to={`/contractor/${spectrumId}`}
          icon={<StorefrontRounded />}
          {...a11yProps(0)}
        />
        <HapticTab
          label={t("orgInfo.about")}
          component={Link}
          to={`/contractor/${spectrumId}/about`}
          icon={<InfoRounded />}
          {...a11yProps(1)}
        />
        <HapticTab
          label={t("orgInfo.order")}
          component={Link}
          to={`/contractor/${spectrumId}/order`}
          icon={<CreateRounded />}
          {...a11yProps(2)}
        />
        <HapticTab
          label={t("orgInfo.members")}
          component={Link}
          to={`/contractor/${spectrumId}/members`}
          icon={<PeopleAltRoundedIcon />}
          {...a11yProps(3)}
        />
        {hasRecruitingPost && (
          <HapticTab
            label={t("orgInfo.recruiting")}
            component={Link}
            to={`/contractor/${spectrumId}/recruiting`}
            icon={<PersonAddRounded />}
            {...a11yProps(4)}
          />
        )}
        <HapticTab
          label={t("orgInfo.reviews")}
          component={Link}
          to={`/contractor/${spectrumId}/reviews`}
          icon={<StarRounded />}
          {...a11yProps(5)}
        />
      </Tabs>
    </Box>
  )
}
