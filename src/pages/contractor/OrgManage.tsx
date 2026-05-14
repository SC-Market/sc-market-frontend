import React, { useMemo } from "react"
import { OrgDetailEdit } from "../../views/contractor/OrgManage"
import { OrgInvite } from "../../views/contractor/OrgInvite"
import { CustomerList } from "../../views/people/Customers"
import { MyWebhooks } from "../../views/notifications/ListNotificationWebhooks"
import { Box, Grid, Tab, Tabs } from "@mui/material"
import {
  AccountBoxRounded,
  InfoRounded,
  PersonAddRounded,
  StoreRounded,
  SettingsRounded,
  Block,
  HistoryRounded,
  PaletteRounded,
  PeopleAltRounded,
  TuneRounded,
} from "@mui/icons-material"
import { TabPanel } from "../../components/tabs/Tabs"
import { CreateOrgInviteCode } from "../../views/contractor/CreateOrgInviteCode"
import { ListInviteCodes } from "../../views/contractor/ListInviteCodes"
import { ManageMemberList } from "../../views/contractor/OrgMembers"
import { AddNotificationWebhook } from "../../views/notifications/AddNotificationWebhook"
import {
  AddRole,
  has_permission,
  ManageRoles,
} from "../../views/contractor/OrgRoles"
import { DiscordBotDetails } from "../../views/settings/DiscordBotDetails"
import { Discord } from "../../components/icon/DiscordIcon"
import { ConfigureDiscord } from "../../views/notifications/ConfigureDiscord"
import { MarketEditTemplate } from "../../features/market"
import { useTranslation } from "react-i18next"
import { OrgSettings } from "../../views/contractor/OrgSettings"
import { OrgBlocklistSettings } from "../../views/contractor/OrgBlocklistSettings"
import { OrgAuditLogs } from "../../views/contractor/OrgAuditLogs"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageOrgManage } from "../../features/contractor/hooks/usePageOrgManage"
import { OrgManageSkeleton } from "../../components/skeletons/OrgManageSkeleton"
import { ThemeEditor } from "../../components/theme-editor/ThemeEditor"
import {
  useGetOrgThemeQuery,
  useUpdateOrgThemeMutation,
  useDeleteOrgThemeMutation,
} from "../../store/api/contractors"
import { clearCachedOrgTheme } from "../../hooks/styles/themeCache"
import { WhiteLabelSettings } from "../../views/contractor/WhiteLabelSettings"

export function OrgManage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const pageData = usePageOrgManage()

  const canManageRoles = useMemo(
    () =>
      pageData.data &&
      has_permission(
        pageData.data.contractor,
        pageData.data.profile,
        "manage_roles",
        pageData.data.profile?.contractors,
      ),
    [pageData.data],
  )
  const canManageOrgDetails = useMemo(
    () =>
      pageData.data &&
      has_permission(
        pageData.data.contractor,
        pageData.data.profile,
        "manage_org_details",
        pageData.data.profile?.contractors,
      ),
    [pageData.data],
  )
  const canManageTheme = useMemo(
    () =>
      pageData.data &&
      has_permission(
        pageData.data.contractor,
        pageData.data.profile,
        "manage_theme",
        pageData.data.profile?.contractors,
      ),
    [pageData.data],
  )
  const canManageInvites = useMemo(
    () =>
      pageData.data &&
      has_permission(
        pageData.data.contractor,
        pageData.data.profile,
        "manage_invites",
        pageData.data.profile?.contractors,
      ),
    [pageData.data],
  )
  const canManageWebhooks = useMemo(
    () =>
      pageData.data &&
      has_permission(
        pageData.data.contractor,
        pageData.data.profile,
        "manage_invites",
        pageData.data.profile?.contractors,
      ),
    [pageData.data],
  )
  const canManageOrders = useMemo(
    () =>
      pageData.data &&
      has_permission(
        pageData.data.contractor,
        pageData.data.profile,
        "manage_orders",
        pageData.data.profile?.contractors,
      ),
    [pageData.data],
  )

  const [page, setPage] = React.useState("about")

  const handleChange = (event: React.SyntheticEvent, newPage: string) => {
    setPage(newPage)
  }

  const contractor = pageData.data?.contractor
  const hasWhiteLabel = contractor?.premium_tier === "white_label"
  const spectrumId = contractor?.spectrum_id

  const { data: orgTheme } = useGetOrgThemeQuery(spectrumId!, {
    skip: !hasWhiteLabel || !spectrumId,
  })
  const [updateOrgTheme, { isLoading: isThemeSaving }] =
    useUpdateOrgThemeMutation()
  const [deleteOrgTheme] = useDeleteOrgThemeMutation()

  return (
    <StandardPageLayout
      title={t("org.manageOrgTitle")}
      headerTitle={t("org.manageOrgTitle")}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<OrgManageSkeleton />}
    >
      <Grid item xs={12}>
        <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
          <Tabs
            value={page}
            onChange={handleChange}
            aria-label={t("ui.aria.orgInfoArea")}
            variant="scrollable"
          >
            {canManageOrgDetails && (
              <Tab label={t("org.aboutTab")} icon={<InfoRounded />} value="about" iconPosition="start" sx={{ minHeight: 48 }} />
            )}
            {canManageInvites && (
              <Tab label={t("org.invitesTab")} icon={<PersonAddRounded />} value="invites" iconPosition="start" sx={{ minHeight: 48 }} />
            )}
            {canManageRoles && (
              <Tab label={t("org.rolesTab")} icon={<AccountBoxRounded />} value="roles" iconPosition="start" sx={{ minHeight: 48 }} />
            )}
            {canManageWebhooks && (
              <Tab label={t("org.discordTab")} icon={<Discord />} value="discord" iconPosition="start" sx={{ minHeight: 48 }} />
            )}
            {canManageOrgDetails && (
              <Tab label={t("org.marketTab")} icon={<StoreRounded />} value="market" iconPosition="start" sx={{ minHeight: 48 }} />
            )}
            {canManageOrgDetails && (
              <Tab label={t("org.settingsTab")} icon={<SettingsRounded />} value="settings" iconPosition="start" sx={{ minHeight: 48 }} />
            )}
            {canManageOrders && (
              <Tab label={t("org.blocklistTab")} icon={<Block />} value="blocklist" iconPosition="start" sx={{ minHeight: 48 }} />
            )}
            <Tab label={t("org.auditLogsTab")} icon={<HistoryRounded />} value="audit" iconPosition="start" sx={{ minHeight: 48 }} />
            <Tab label={t("org.customersTab", "Customers")} icon={<PeopleAltRounded />} value="customers" iconPosition="start" sx={{ minHeight: 48 }} />
            {hasWhiteLabel && canManageTheme && (
              <Tab label={t("org.themeTab", "Theme")} icon={<PaletteRounded />} value="theme" iconPosition="start" sx={{ minHeight: 48 }} />
            )}
            {hasWhiteLabel && canManageTheme && (
              <Tab label={t("org.whiteLabelTab", "White Label")} icon={<TuneRounded />} value="whitelabel" iconPosition="start" sx={{ minHeight: 48 }} />
            )}
          </Tabs>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <TabPanel value={page} index={"about"}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <OrgDetailEdit />
          </Grid>
        </TabPanel>
        <TabPanel value={page} index={"invites"}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <OrgInvite />
            <CreateOrgInviteCode />
            <ListInviteCodes />
          </Grid>
        </TabPanel>
        <TabPanel value={page} index={"roles"}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <ManageRoles />
            <ManageMemberList />
            <AddRole />
          </Grid>
        </TabPanel>
        <TabPanel value={page} index={"discord"}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <DiscordBotDetails org />
            <ConfigureDiscord org />
            <AddNotificationWebhook org />
            <MyWebhooks org />
          </Grid>
        </TabPanel>
        <TabPanel value={page} index={"market"}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <MarketEditTemplate org />
          </Grid>
        </TabPanel>
        <TabPanel value={page} index={"settings"}>
          <OrgSettings />
        </TabPanel>
        <TabPanel value={page} index={"blocklist"}>
          <OrgBlocklistSettings />
        </TabPanel>
        <TabPanel value={page} index={"audit"}>
          <OrgAuditLogs />
        </TabPanel>
        <TabPanel value={page} index={"customers"}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <CustomerList />
          </Grid>
        </TabPanel>
        {hasWhiteLabel && canManageTheme && spectrumId && (
          <TabPanel value={page} index={"theme"}>
            <ThemeEditor
              initialThemeData={
                orgTheme?.data?.theme_data ?? {
                  light: {},
                  dark: {},
                }
              }
              initialFaviconUrl={
                orgTheme?.data?.favicon_url ?? null
              }
              onSave={async (data) => {
                await updateOrgTheme({
                  spectrum_id: spectrumId,
                  ...data,
                }).unwrap()
                clearCachedOrgTheme(spectrumId)
              }}
              onReset={async () => {
                await deleteOrgTheme(spectrumId).unwrap()
                clearCachedOrgTheme(spectrumId)
              }}
              isSaving={isThemeSaving}
            />
          </TabPanel>
        )}
        {hasWhiteLabel && canManageTheme && (
          <TabPanel value={page} index={"whitelabel"}>
            <WhiteLabelSettings />
          </TabPanel>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
