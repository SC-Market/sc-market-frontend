import {
  Box,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import InfoIcon from "@mui/icons-material/Info"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import React from "react"
import {
  PeopleAltRounded,
  PrivacyTipRounded,
  StoreRounded,
  Block,
  SecurityRounded,
  NotificationsActiveRounded,
  Email as EmailIcon,
  PhoneAndroidRounded,
  SyncRounded,
  LockRounded,
  PriceChangeRounded,
} from "@mui/icons-material"
import { useSearchParams } from "react-router-dom"
import { useSession } from "../../hooks/login/useSession"
import { isSiteAdmin } from "../../util/siteRole"
import { isMfaLockedAdmin } from "../../features/mfa/adminLock"

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
import { PriceAlertSettings } from "../../features/price-alerts"
import { MobileNavSettings } from "../../views/settings/MobileNavSettings"
import { ScmdbSyncSettings } from "../../features/scmdb-sync"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { PageBusy } from "../../components/metadata/PageReady"
import { SETTINGS_TABS, settingsTabFromQuery, settingsTabKey } from "./settingsTabs"
import { lazyWithRetry } from "../../util/lazyWithRetry"

// Admin-only; loaded only when the tab is shown.
const MfaSettings = lazyWithRetry(() =>
  import("../../features/mfa/components/MfaSettings").then((m) => ({ default: m.MfaSettings })),
)

const MOBILE_NAV_TAB_INDEX = SETTINGS_TABS["mobile-nav"]
const MFA_TAB_INDEX = SETTINGS_TABS.mfa
const PRICE_ALERTS_TAB_INDEX = SETTINGS_TABS["price-alerts"]

interface NavItem {
  index: number
  label: string
  icon: React.ReactNode
}

interface NavGroup {
  key: string
  label: string
  items: NavItem[]
}

export function SettingsPage() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  const session = useSession()
  const profile = session.status === "authenticated" ? session.profile : undefined
  // Two-factor is admin-only for now (also for an admin still held back by it).
  const showMfa = !!profile && (isSiteAdmin(profile) || isMfaLockedAdmin(profile))
  const [searchParams, setSearchParams] = useSearchParams()
  const queryTab = settingsTabFromQuery(searchParams)
  const [page, setPage] = React.useState(() => queryTab ?? 0)

  // Follow ?tab= when it changes while the page is open (in-app links).
  React.useEffect(() => {
    if (queryTab !== null) setPage(queryTab)
  }, [queryTab])

  React.useEffect(() => {
    if (!isMobile && page === MOBILE_NAV_TAB_INDEX) {
      setPage(9)
    }
  }, [isMobile, page])

  const selectTab = (newPage: number) => {
    setPage(newPage)
    const key = settingsTabKey(newPage)
    if (key) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set("tab", key)
          next.delete("mfa")
          return next
        },
        { replace: true },
      )
    }
  }
  const handleChange = (_event: React.SyntheticEvent, newPage: number) =>
    selectTab(newPage)

  const navGroups: NavGroup[] = [
    {
      key: "account",
      label: t("settings.groups.account", "Account"),
      items: [
        { index: 0, label: t("settings.tabs.profile"), icon: <InfoIcon /> },
        {
          index: 1,
          label: t("settings.tabs.privacy"),
          icon: <PrivacyTipRounded />,
        },
        ...(showMfa
          ? [
              {
                index: MFA_TAB_INDEX,
                label: t("mfa.settings.title", "Two-factor authentication"),
                icon: <LockRounded />,
              },
            ]
          : []),
      ],
    },
    {
      key: "integrations",
      label: t("settings.groups.integrations", "Integrations"),
      items: [
        {
          index: 2,
          label: t("settings.tabs.discordIntegration"),
          icon: <Discord sx={{ marginRight: 0 }} />,
        },
        { index: 6, label: "API Tokens", icon: <SecurityRounded /> },
        { index: 9, label: "SCMDB", icon: <SyncRounded /> },
      ],
    },
    {
      key: "notifications",
      label: t("settings.groups.notifications", "Notifications"),
      items: [
        {
          index: 7,
          label: t("settings.pushNotifications.title"),
          icon: <NotificationsActiveRounded />,
        },
        { index: 8, label: t("settings.email.title"), icon: <EmailIcon /> },
        {
          index: PRICE_ALERTS_TAB_INDEX,
          label: t("settings.priceAlerts.title", "Price Alerts"),
          icon: <PriceChangeRounded />,
        },
      ],
    },
    {
      key: "marketplace",
      label: t("settings.groups.marketplace", "Marketplace"),
      items: [
        { index: 3, label: t("settings.tabs.market"), icon: <StoreRounded /> },
        {
          index: 4,
          label: t("settings.tabs.contractors"),
          icon: <PeopleAltRounded />,
        },
        { index: 5, label: t("settings.tabs.blocklist"), icon: <Block /> },
      ],
    },
  ]

  const renderContent = () => (
    <>
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
        <ScmdbSyncSettings />
      </TabPanel>
      {showMfa && (
        <TabPanel value={page} index={MFA_TAB_INDEX}>
          <React.Suspense fallback={<PageBusy />}>
            <MfaSettings />
          </React.Suspense>
        </TabPanel>
      )}
      <TabPanel value={page} index={PRICE_ALERTS_TAB_INDEX}>
        <PriceAlertSettings />
      </TabPanel>
      {isMobile && (
        <TabPanel value={page} index={10}>
          <MobileNavSettings />
        </TabPanel>
      )}
    </>
  )

  return (
    <StandardPageLayout
      title={t("settings.title")}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {isMobile ? (
        <>
          <Grid item xs={12}>
            <Tabs
              value={page}
              onChange={handleChange}
              aria-label={t("settings.sectionsNav", "Settings sections")}
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
              {showMfa && (
                <Tab
                  label={t("mfa.settings.title", "Two-factor authentication")}
                  icon={<LockRounded />}
                  {...a11yProps(MFA_TAB_INDEX)}
                  value={MFA_TAB_INDEX}
                />
              )}
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
                label={t("settings.priceAlerts.title", "Price Alerts")}
                icon={<PriceChangeRounded />}
                {...a11yProps(PRICE_ALERTS_TAB_INDEX)}
                value={PRICE_ALERTS_TAB_INDEX}
              />
              <Tab
                label="SCMDB"
                icon={<SyncRounded />}
                {...a11yProps(9)}
                value={9}
              />
              <Tab
                label={t("settings.mobileNav.title")}
                icon={<PhoneAndroidRounded />}
                {...a11yProps(10)}
                value={10}
              />
            </Tabs>
          </Grid>
          <Grid item xs={12}>
            {renderContent()}
          </Grid>
        </>
      ) : (
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box
              sx={{
                width: 220,
                flexShrink: 0,
              }}
            >
              <List
                component="nav"
                disablePadding
                aria-label={t("settings.sectionsNav", "Settings sections")}
              >
                {navGroups.map((group) => (
                  <React.Fragment key={group.key}>
                    <Typography
                      variant="overline"
                      sx={{
                        px: 2,
                        pt: 2,
                        pb: 0.5,
                        display: "block",
                        color: "text.secondary",
                      }}
                    >
                      {group.label}
                    </Typography>
                    {group.items.map((item) => (
                      <ListItemButton
                        key={item.index}
                        selected={page === item.index}
                        onClick={() => selectTab(item.index)}
                        sx={{ borderRadius: 1, mx: 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    ))}
                  </React.Fragment>
                ))}
              </List>
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {renderContent()}
            </Box>
          </Box>
        </Grid>
      )}
    </StandardPageLayout>
  )
}
