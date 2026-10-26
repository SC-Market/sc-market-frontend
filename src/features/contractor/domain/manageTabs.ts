import { has_permission } from "./permissions"
import type { Contractor, ContractorRole } from "./types"

type Permission = keyof ContractorRole

/**
 * The Manage Org tabs and the permission each one's actions need. This is the
 * one place that decides who sees what: the Manage Org nav, the manage route
 * guard and the sidebar's Manage entry all read it, so a tab only shows when
 * its page will actually work for the member.
 */
export const ORG_MANAGE_TABS = [
  // Edit the org's profile (PUT /contractors/:id).
  { value: "about", anyOf: ["manage_org_details"] },
  // Create/edit roles and assign them.
  { value: "roles", anyOf: ["manage_roles"] },
  // Invite by username and create invite codes.
  { value: "invites", anyOf: ["manage_invites"] },
  // The org's Discord settings (settings/discord) need Manage Webhooks.
  { value: "discord", anyOf: ["manage_webhooks"] },
  // Spoken languages (PUT /contractors/:id/languages).
  { value: "settings", anyOf: ["manage_org_details"] },
  // GET /contractors/:id/audit-logs.
  { value: "audit", anyOf: ["manage_org_details"] },
  // White-label orgs only: the theme editor and white-label settings.
  { value: "theme", anyOf: ["manage_theme"], whiteLabelOnly: true },
] as const satisfies readonly {
  value: string
  anyOf: readonly Permission[]
  whiteLabelOnly?: boolean
}[]

export type OrgManageTab = (typeof ORG_MANAGE_TABS)[number]["value"]

type Member = Parameters<typeof has_permission>[1] & {
  contractors?: Parameters<typeof has_permission>[3]
}

/** The Manage Org tabs this member may use, in nav order. */
export function visibleOrgManageTabs(
  contractor: Contractor | undefined | null,
  profile: Member | undefined | null,
): OrgManageTab[] {
  if (!contractor || !profile) return []
  const isWhiteLabel = contractor.premium_tier === "white_label"
  return ORG_MANAGE_TABS.filter(
    (tab) =>
      (!("whiteLabelOnly" in tab) || isWhiteLabel) &&
      tab.anyOf.some((p) => has_permission(contractor, profile, p, profile.contractors)),
  ).map((tab) => tab.value)
}

/** Whether the member can open the Manage Org area at all. */
export function canOpenOrgManage(
  contractor: Contractor | undefined | null,
  profile: Member | undefined | null,
): boolean {
  return visibleOrgManageTabs(contractor, profile).length > 0
}
