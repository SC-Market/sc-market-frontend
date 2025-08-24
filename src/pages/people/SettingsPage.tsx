import { Grid, Tab, Tabs } from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { Page } from "../../components/metadata/Page"
import {
  PeopleAltRounded,
  PrivacyTipRounded,
  StoreRounded,
} from "@mui/icons-material"
import { PrivacySettings } from "../../views/settings/PrivacySettings"
import { Discord } from "../../components/icon/DiscordIcon"
import { ProfileSettings } from "../../views/settings/ProfileSettings"
import { DiscordIntegrationSettings } from "../../views/settings/DiscordIntegrationSettings"
import { MarketSettings } from "../../views/settings/MarketSettings"
import { ContractorsSettings } from "../../views/settings/ContractorsSettings"

import { useTranslation } from "react-i18next"

export function SettingsPage() {
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
            aria-label={t("ui.aria.orgInfoArea")}
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
            <ProfileSettings />
          </TabPanel>
          <TabPanel value={page} index={1}>
            <PrivacySettings />
            {/*<AvailabilitySelector/>*/}
          </TabPanel>
          <TabPanel value={page} index={2}>
            <DiscordIntegrationSettings />
          </TabPanel>
          <TabPanel value={page} index={3}>
            <MarketSettings />
          </TabPanel>
          <TabPanel value={page} index={4}>
            <ContractorsSettings />
          </TabPanel>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
