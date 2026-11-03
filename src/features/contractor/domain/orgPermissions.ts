/**
 * Named org permission rules for components. Each is has_permission with
 * the viewer's own memberships (the profile's `contractors`), so callers
 * don't pick a permission key or pass the memberships themselves.
 */
import type { Contractor, ContractorRole } from "./types"
import { has_permission } from "./permissions"

/** The signed-in viewer, as the profile query returns it. */
export interface OrgViewer {
  username: string
  contractors?: Array<{
    spectrum_id: string
    role: string
    role_id?: string
    roles?: string[]
  }>
}

type OrgRule = (
  contractor: Contractor | null | undefined,
  viewer: OrgViewer | null | undefined,
) => boolean

const rule =
  (permission: keyof ContractorRole): OrgRule =>
  (contractor, viewer) =>
    has_permission(contractor, viewer, permission, viewer?.contractors)

/** Manage Orders: the org's orders, offers and order settings. */
export const canManageOrgOrders = rule("manage_orders")

/** Manage Org Details: name, description, languages, ... */
export const canManageOrgDetails = rule("manage_org_details")

/** Manage Recruiting: the org's recruiting post. */
export const canManageOrgRecruiting = rule("manage_recruiting")

/** Which permission(s) an org admin area needs, or a custom check. */
export interface OrgAreaAccess<V extends OrgViewer> {
  permission?: keyof ContractorRole
  /** Any one of these is enough. */
  anyPermission?: (keyof ContractorRole)[]
  /** Custom check, e.g. canOpenOrgManage; wins over the others. */
  allow?: (contractor: Contractor, viewer: V) => boolean
}

/** Whether the viewer may open an org admin area. No rule: nobody. */
export function canViewOrgArea<V extends OrgViewer>(
  contractor: Contractor | null | undefined,
  viewer: V | null | undefined,
  access: OrgAreaAccess<V>,
): boolean {
  if (!contractor || !viewer) return false
  if (access.allow) return access.allow(contractor, viewer)
  if (access.permission) return rule(access.permission)(contractor, viewer)
  if (access.anyPermission) {
    return access.anyPermission.some((p) => rule(p)(contractor, viewer))
  }
  return false
}
