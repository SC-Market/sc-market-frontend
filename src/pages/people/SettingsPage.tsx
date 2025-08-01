import { Grid, Tab, Tabs } from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { useGetUserProfileQuery } from "../../store/profile"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { AuthenticateRSI } from "../../views/authentication/AuthenticateRSI"
import { MyWebhooks } from "../../views/notifications/ListNotificationWebhooks"
import { Page } from "../../components/metadata/Page"
import { AddNotificationWebhook } from "../../views/notifications/AddNotificationWebhook"
import {
  PeopleAltRounded,
  PrivacyTipRounded,
  StoreRounded,
} from "@mui/icons-material"
import { PrivacySettings } from "../../views/settings/PrivacySettings"
import { DiscordBotDetails } from "../../views/settings/DiscordBotDetails"
import { Discord } from "../../components/icon/DiscordIcon"
import { ConfigureDiscord } from "../../views/notifications/ConfigureDiscord"
import { MarketEditTemplate } from "../../views/market/MarketEditTemplate"
import { SettingsManageContractors } from "../../views/contractor/SettingsManageContractors"

import { useTranslation } from "react-i18next" // added

export function SettingsPage() {
  const { data: profile } = useGetUserProfileQuery()
  const { t } = useTranslation()

  const [page, setPage] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newPage: number) => {
    setPage(newPage)
  }

  return (
    <Page title={t("settings.title")}>
      <ContainerGrid sidebarOpen={true} maxWidth={"md"}>
        <Grid item xs={12}>
          <Tabs
            value={page}
            onChange={handleChange}
            aria-label="org info area"
            variant="scrollable"
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab
              label={t("settings.tabs.profile")}
              icon={<InfoIcon />}
              {...a11yProps(0)}
              value={0}
            />
            <Tab
              label={t("settings.tabs.privacy")}
              icon={<PrivacyTipRounded />}
              {...a11yProps(1)}
              value={1}
            />
            <Tab
              label={t("settings.tabs.discordIntegration")}
              icon={<Discord sx={{ marginRight: 1 }} />}
              {...a11yProps(2)}
              value={2}
            />
            <Tab
              label={t("settings.tabs.market")}
              icon={<StoreRounded />}
              {...a11yProps(3)}
              value={3}
            />
            <Tab
              label={t("settings.tabs.contractors")}
              icon={<PeopleAltRounded />}
              {...a11yProps(4)}
              value={4}
            />
          </Tabs>
        </Grid>

        <Grid item xs={12}>
          <TabPanel value={page} index={0}>
            <Grid container spacing={4} alignItems={"flex-start"}>
              <HeaderTitle>
                {profile?.rsi_confirmed
                  ? t("settings.profile.updateAndVerify")
                  : t("settings.profile.authenticateWithRSI")}
              </HeaderTitle>
              <AuthenticateRSI />
            </Grid>
          </TabPanel>
          <TabPanel value={page} index={1}>
            <Grid container spacing={4} alignItems={"flex-start"}>
              <PrivacySettings />
              {/*<AvailabilitySelector/>*/}
            </Grid>
          </TabPanel>
          <TabPanel value={page} index={2}>
            <Grid container spacing={4} alignItems={"flex-start"}>
              <DiscordBotDetails />
              <ConfigureDiscord />
              <AddNotificationWebhook />
              <MyWebhooks />
            </Grid>
          </TabPanel>
          <TabPanel value={page} index={3}>
            <Grid container spacing={4} alignItems={"flex-start"}>
              <MarketEditTemplate />
            </Grid>
          </TabPanel>
          <TabPanel value={page} index={4}>
            <Grid container spacing={4}>
              <SettingsManageContractors />
            </Grid>
          </TabPanel>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
