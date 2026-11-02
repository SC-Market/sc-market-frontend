import type { ContractorRole } from "./types"

/**
 * The permissions a role can grant, in the order the role editor lists them.
 * Labels and descriptions are `manageRoles.permissions.<name>` and
 * `manageRoles.permissionDescriptions.<name>`.
 */
export const ROLE_PERMISSIONS = [
  "manage_org_details",
  "manage_roles",
  "manage_orders",
  "manage_invites",
  "manage_stock",
  "manage_market",
  "manage_recruiting",
  "manage_webhooks",
  "manage_blocklist",
  "claim_orders",
  "kick_members",
  "manage_theme",
] as const satisfies readonly (keyof ContractorRole)[]

export type RolePermission = (typeof ROLE_PERMISSIONS)[number]

/**
 * The permissions the role editor offers for an org: Manage Theme only means
 * something (and only shows) for a white-label org.
 */
export function editableRolePermissions(org: { premium_tier?: string | null } | null | undefined): RolePermission[] {
  const whiteLabel = org?.premium_tier === "white_label"
  return ROLE_PERMISSIONS.filter((p) => p !== "manage_theme" || whiteLabel)
}
