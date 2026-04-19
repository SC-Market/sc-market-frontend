import { SidebarItemProps } from "../types"
import { has_permission } from "../../../views/contractor/OrgRoles"
import { CURRENT_CUSTOM_ORG, getWhiteLabelConfig } from "../../../hooks/contractor/CustomDomain"
import React from "react"
import {
  AssignmentRounded,
  AttachMoneyRounded,
  BookRounded,
  BusinessRounded,
  CalendarMonthRounded,
  CreateRounded,
  DashboardCustomizeRounded,
  DashboardRounded,
  DesignServicesRounded,
  FolderOpenRounded,
  ForumRounded,
  GavelRounded,
  HelpRounded,
  HomeRounded,
  InfoRounded,
  InventoryRounded,
  LinkRounded,
  ListAltRounded,
  LocalShipping,
  ManageAccountsRounded,
  MapRounded,
  NotificationsRounded,
  PaidRounded,
  PersonAddRounded,
  PhotoCameraRounded,
  PublicRounded,
  RequestQuoteRounded,
  RocketLaunchRounded,
  ScienceRounded,
  SecurityRounded,
  SettingsRounded,
  ShieldRounded,
  StarRounded,
  StoreRounded,
  ToggleOnRounded,
  WarehouseRounded,
  WorkRounded,
} from "@mui/icons-material"

const SIDEBAR_ICON_MAP: Record<string, React.ReactElement> = {
  home: <HomeRounded />, store: <StoreRounded />, dashboard: <DashboardRounded />,
  customize: <DashboardCustomizeRounded />, forum: <ForumRounded />, gavel: <GavelRounded />,
  assignment: <AssignmentRounded />, paid: <PaidRounded />, create: <CreateRounded />,
  business: <BusinessRounded />, settings: <SettingsRounded />, money: <AttachMoneyRounded />,
  folder: <FolderOpenRounded />, shipping: <LocalShipping />, calendar: <CalendarMonthRounded />,
  design: <DesignServicesRounded />, inventory: <InventoryRounded />, list: <ListAltRounded />,
  accounts: <ManageAccountsRounded />, recruit: <PersonAddRounded />, quote: <RequestQuoteRounded />,
  shield: <ShieldRounded />, warehouse: <WarehouseRounded />, security: <SecurityRounded />,
  star: <StarRounded />, toggle: <ToggleOnRounded />, link: <LinkRounded />,
  info: <InfoRounded />, public: <PublicRounded />, book: <BookRounded />,
  help: <HelpRounded />, map: <MapRounded />, notifications: <NotificationsRounded />,
  camera: <PhotoCameraRounded />, rocket: <RocketLaunchRounded />, science: <ScienceRounded />,
  work: <WorkRounded />,
}

// Sidebar config cache — populated by HookProvider after fetching from API
let sidebarConfigCache: Array<{
  standard_tab_key: string | null
  custom_label: string | null
  custom_path: string | null
  custom_icon: string | null
  is_external: boolean
  enabled: boolean
  sort_order: number
}> = []

export function setSidebarConfig(config: typeof sidebarConfigCache) {
  sidebarConfigCache = config
}

/**
 * Get the set of standard tab keys that are disabled in the sidebar config.
 * Used by MobileBottomNav to hide disabled tabs.
 */
export function getDisabledTabs(): Set<string> {
  const disabled = new Set<string>()
  for (const item of sidebarConfigCache) {
    if (item.standard_tab_key && !item.enabled) {
      disabled.add(item.standard_tab_key)
    }
  }
  return disabled
}

/**
 * Get custom tabs from the sidebar config (non-standard entries with a custom_path).
 */
export function getCustomTabs(): SidebarItemProps[] {
  return sidebarConfigCache
    .filter((c) => !c.standard_tab_key && c.custom_path && c.enabled)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({
      to: c.custom_path!,
      text: c.custom_label || c.custom_path!,
      icon: SIDEBAR_ICON_MAP[c.custom_icon || "link"] || SIDEBAR_ICON_MAP.link,
      external: c.is_external,
    }))
}

/**
 * Filter sidebar items based on permissions, org context, and visibility rules.
 * On white-label domains, also applies the org's sidebar config.
 */
export function createItemFilter(
  profile: any,
  profileError: any,
  currentOrgObj: any,
) {
  return (item: SidebarItemProps): boolean => {
    if (item.hidden) {
      return false
    }

    // Check login requirements
    if (
      (item.logged_in || item.org || item.org_admin || item.site_admin) &&
      (profileError || !profile)
    ) {
      return false
    }

    // Check org context requirements
    if (item.org === false && (currentOrgObj !== null || CURRENT_CUSTOM_ORG)) {
      return false
    }

    if ((item.org || item.org_admin) && !currentOrgObj) {
      return false
    }

    if (item.toOrgPublic && !currentOrgObj) {
      return false
    }

    // Check org admin permissions
    if (item.org_admin) {
      if (
        !(
          [
            "manage_org_details",
            "manage_invites",
            "manage_roles",
            "manage_webhooks",
            "manage_orders",
            "manage_theme",
          ] as const
        ).some((perm) =>
          has_permission(currentOrgObj, profile, perm, profile?.contractors),
        )
      ) {
        return false
      }
    }

    // Check custom org requirements
    if (CURRENT_CUSTOM_ORG && item.custom === false) {
      return false
    }

    if (!CURRENT_CUSTOM_ORG && item.custom) {
      return false
    }

    // Check site admin requirements
    if (item.site_admin && profile?.role !== "admin") {
      return false
    }

    // Apply org sidebar config on white-label domains
    if (CURRENT_CUSTOM_ORG && sidebarConfigCache.length > 0 && item.tab_key) {
      const tabConfig = sidebarConfigCache.find(
        (c) => c.standard_tab_key === item.tab_key,
      )
      if (tabConfig && !tabConfig.enabled) {
        return false
      }
    }

    return true
  }
}
