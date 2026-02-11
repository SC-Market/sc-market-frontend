import InfoIcon from "@mui/icons-material/Info"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { Page } from "../../components/metadata/Page"
import { PrivacySettings } from "../../views/settings/PrivacySettings"
import { Discord } from "../../components/icon/DiscordIcon"
import { ProfileSettings } from "../../views/settings/ProfileSettings"
import { DiscordIntegrationSettings } from "../../views/settings/DiscordIntegrationSettings"
import { MarketSettings } from "../../views/settings/MarketSettings"
import { ContractorsSettings } from "../../views/settings/ContractorsSettings"
import { BlocklistSettings } from "../../views/settings/BlocklistSettings"
import { ApiTokensSettings } from "../../features/api-tokens"
import { PushNotificationSettings } from "../../features/push-notifications"
import { EmailSettings } from "../../features/email"
import { MobileNavSettings } from "../../views/settings/MobileNavSettings"
import { useTranslation } from "react-i18next"

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import Block from '@mui/icons-material/Block';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidRounded from '@mui/icons-material/PhoneAndroidRounded';

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
            <Tab
              label={t("settings.tabs.blocklist")}
              icon={<Block />}
              {...a11yProps(5)}
              value={5}
            />
            <Tab
              label="API Tokens"
              icon={<SecurityRounded />}
              {...a11yProps(6)}
              value={6}
            />
            <Tab
              label={t("settings.pushNotifications.title")}
              icon={<NotificationsActiveRounded />}
              {...a11yProps(7)}
              value={7}
            />
            <Tab
              label={t("settings.email.title")}
              icon={<EmailIcon />}
              {...a11yProps(8)}
              value={8}
            />
            <Tab
              label={t("settings.mobileNav.title")}
              icon={<PhoneAndroidRounded />}
              {...a11yProps(9)}
              value={9}
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
          <TabPanel value={page} index={5}>
            <BlocklistSettings />
          </TabPanel>
          <TabPanel value={page} index={6}>
            <ApiTokensSettings />
          </TabPanel>
          <TabPanel value={page} index={7}>
            <PushNotificationSettings />
          </TabPanel>
          <TabPanel value={page} index={8}>
            <EmailSettings />
          </TabPanel>
          <TabPanel value={page} index={9}>
            <MobileNavSettings />
          </TabPanel>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
