import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Divider, Tabs } from "@mui/material"
import {
  CreateRounded,
  DesignServicesRounded,
  InfoRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import { HapticTab } from "../../../components/haptic"
import { a11yProps } from "../../../components/tabs/Tabs"

interface ProfileTabsProps {
  username: string
  currentTab: number
}

export function ProfileTabs({ username, currentTab }: ProfileTabsProps) {
  const { t } = useTranslation()

  return (
    <>
      <Tabs
        value={currentTab}
        aria-label={t("ui.aria.orgInfoArea")}
        variant="scrollable"
        textColor="secondary"
        indicatorColor="secondary"
      >
        <HapticTab
          component={Link}
          to={`/user/${username}`}
          label={t("viewProfile.store_tab")}
          icon={<StorefrontRounded />}
          {...a11yProps(0)}
        />
        <HapticTab
          label={t("viewProfile.services_tab")}
          component={Link}
          to={`/user/${username}/services`}
          icon={<DesignServicesRounded />}
          {...a11yProps(1)}
        />
        <HapticTab
          label={t("viewProfile.about_tab")}
          component={Link}
          to={`/user/${username}/about`}
          icon={<InfoRounded />}
          {...a11yProps(2)}
        />
        <HapticTab
          label={t("viewProfile.order_tab")}
          component={Link}
          to={`/user/${username}/order`}
          icon={<CreateRounded />}
          {...a11yProps(3)}
        />
        <HapticTab
          label={t("viewProfile.reviews_tab")}
          component={Link}
          to={`/user/${username}/reviews`}
          icon={<StarRounded />}
          {...a11yProps(4)}
        />
      </Tabs>
      <Divider light />
    </>
  )
}
