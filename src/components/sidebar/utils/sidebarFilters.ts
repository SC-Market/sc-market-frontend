import { SidebarItemProps } from "../types"
import { has_permission } from "../../../views/contractor/OrgRoles"
import { CURRENT_CUSTOM_ORG, getWhiteLabelConfig } from "../../../hooks/contractor/CustomDomain"

// Sidebar config cache — populated by HookProvider after fetching from API
let sidebarConfigCache: Array<{
  standard_tab_key: string | null
  enabled: boolean
  sort_order: number
}> = []

export function setSidebarConfig(config: typeof sidebarConfigCache) {
  sidebarConfigCache = config
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
