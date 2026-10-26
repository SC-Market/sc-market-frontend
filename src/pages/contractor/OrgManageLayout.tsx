import { ReactElement, useMemo } from "react"
import {
  Box,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
} from "@mui/material"
import { useBreakpointUp } from "../../hooks/layout/useBreakpoint"
import {
  InfoRounded,
  AccountBoxRounded,
  SettingsRounded,
  HistoryRounded,
  PaletteRounded,
  PersonAddRounded,
} from "@mui/icons-material"
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Discord } from "../../components/icon/DiscordIcon"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageOrgManage } from "../../features/contractor/hooks/usePageOrgManage"
import { visibleOrgManageTabs, type OrgManageTab } from "../../features/contractor/domain/manageTabs"
import { OrgManageSkeleton } from "../../components/skeletons/OrgManageSkeleton"

interface NavItem {
  label: string
  icon: ReactElement
  value: string
}

export function OrgManageLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useBreakpointUp("md")

  const pageData = usePageOrgManage()
  const contractor = pageData.data?.contractor
  const profile = pageData.data?.profile
  // Which tabs show (and so who can do what) is decided in one place,
  // visibleOrgManageTabs; this only adds labels and icons.
  const navItems = useMemo<NavItem[]>(() => {
    const meta: Record<OrgManageTab, Omit<NavItem, "value">> = {
      about: { label: t("org.aboutTab"), icon: <InfoRounded /> },
      roles: { label: t("org.rolesTab"), icon: <AccountBoxRounded /> },
      invites: { label: t("org.invitesTab"), icon: <PersonAddRounded /> },
      discord: { label: t("org.discordTab"), icon: <Discord /> },
      settings: { label: t("org.settingsTab"), icon: <SettingsRounded /> },
      audit: { label: t("org.auditLogsTab"), icon: <HistoryRounded /> },
      // The theme page holds both the theme editor and the white-label
      // settings (OrgThemePage), so one item covers both.
      theme: { label: t("org.themeWhiteLabelTab", "Theme & White Label"), icon: <PaletteRounded /> },
    }
    return visibleOrgManageTabs(contractor, profile).map((value) => ({ value, ...meta[value] }))
  }, [contractor, profile, t])

  // Extract the active sub-route from the pathname
  const activeItem = useMemo(() => {
    const segments = location.pathname.split("/")
    const manageIndex = segments.indexOf("manage")
    if (manageIndex !== -1 && segments[manageIndex + 1]) {
      return segments[manageIndex + 1]
    }
    // Default to first available nav item
    return navItems[0]?.value ?? "about"
  }, [location.pathname, navItems])

  const handleNavChange = (value: string) => {
    navigate(value)
  }

  if (isDesktop) {
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
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ width: 220, flexShrink: 0 }}>
              <List
                dense
                component="nav"
                aria-label={t(
                  "org.manageSectionsNav",
                  "Organization settings sections",
                )}
              >
                {navItems.map((item) => (
                  <ListItemButton
                    key={item.value}
                    selected={activeItem === item.value}
                    aria-current={
                      activeItem === item.value ? "page" : undefined
                    }
                    onClick={() => handleNavChange(item.value)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Outlet />
            </Box>
          </Box>
        </Grid>
      </StandardPageLayout>
    )
  }

  // Mobile layout: horizontal scrollable tabs above outlet
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
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeItem}
            onChange={(_e, value: string) => handleNavChange(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label={t(
              "org.manageSectionsNav",
              "Organization settings sections",
            )}
          >
            {navItems.map((item) => (
              <Tab
                key={item.value}
                label={item.label}
                icon={item.icon}
                value={item.value}
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
            ))}
          </Tabs>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Outlet />
      </Grid>
    </StandardPageLayout>
  )
}
