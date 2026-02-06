import { SidebarItemProps } from "../types"
import { has_permission } from "../../../views/contractor/OrgRoles"
import { CURRENT_CUSTOM_ORG } from "../../../hooks/contractor/CustomDomain"

/**
 * Filter sidebar items based on permissions, org context, and visibility rules
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

    return true
  }
}
