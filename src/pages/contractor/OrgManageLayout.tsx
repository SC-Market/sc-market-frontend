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
  useMediaQuery,
} from "@mui/material"
import {
  InfoRounded,
  PeopleAltRounded,
  AccountBoxRounded,
  StoreRounded,
  SettingsRounded,
  Block,
  HistoryRounded,
  PaletteRounded,
  TuneRounded,
  PersonAddRounded,
} from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Discord } from "../../components/icon/DiscordIcon"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { usePageOrgManage } from "../../features/contractor/hooks/usePageOrgManage"
import { has_permission } from "../../features/contractor/domain/permissions"
import { OrgManageSkeleton } from "../../components/skeletons/OrgManageSkeleton"

interface NavItem {
  label: string
  icon: ReactElement
  value: string
}

export function OrgManageLayout() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))

  const pageData = usePageOrgManage()
  const contractor = pageData.data?.contractor
  const profile = pageData.data?.profile
  const hasWhiteLabel = contractor?.premium_tier === "white_label"

  const canManageRoles = useMemo(
    () => has_permission(contractor, profile, "manage_roles", profile?.contractors),
    [contractor, profile],
  )
  const canManageOrgDetails = useMemo(
    () => has_permission(contractor, profile, "manage_org_details", profile?.contractors),
    [contractor, profile],
  )
  const canManageTheme = useMemo(
    () => has_permission(contractor, profile, "manage_theme", profile?.contractors),
    [contractor, profile],
  )
  const canManageInvites = useMemo(
    () => has_permission(contractor, profile, "manage_invites", profile?.contractors),
    [contractor, profile],
  )
  const canManageOrders = useMemo(
    () => has_permission(contractor, profile, "manage_orders", profile?.contractors),
    [contractor, profile],
  )

  const navItems = useMemo(() => {
    const items: NavItem[] = []

    if (canManageOrgDetails) {
      items.push({ label: t("org.aboutTab"), icon: <InfoRounded />, value: "about" })
    }
    if (canManageRoles) {
      items.push({ label: t("org.rolesTab"), icon: <AccountBoxRounded />, value: "roles" })
    }
    if (canManageInvites) {
      items.push({ label: t("org.invitesTab"), icon: <PersonAddRounded />, value: "invites" })
      items.push({ label: t("org.discordTab"), icon: <Discord />, value: "discord" })
    }
    if (canManageOrgDetails) {
      items.push({ label: t("org.marketTab"), icon: <StoreRounded />, value: "market" })
      items.push({ label: t("org.settingsTab"), icon: <SettingsRounded />, value: "settings" })
    }
    if (canManageOrders) {
      items.push({ label: t("org.blocklistTab"), icon: <Block />, value: "blocklist" })
    }
    items.push({ label: t("org.auditLogsTab"), icon: <HistoryRounded />, value: "audit" })
    items.push({ label: t("org.customersTab", "Customers"), icon: <PeopleAltRounded />, value: "customers" })
    if (hasWhiteLabel && canManageTheme) {
      items.push({ label: t("org.themeTab", "Theme"), icon: <PaletteRounded />, value: "theme" })
      items.push({ label: t("org.whiteLabelTab", "White Label"), icon: <TuneRounded />, value: "whitelabel" })
    }

    return items
  }, [canManageOrgDetails, canManageRoles, canManageInvites, canManageOrders, canManageTheme, hasWhiteLabel, t])

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
              <List dense>
                {navItems.map((item) => (
                  <ListItemButton
                    key={item.value}
                    selected={activeItem === item.value}
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
