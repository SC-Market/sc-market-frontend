import type { Contractor, ContractorRole } from "./types"

/**
 * Check if a user has a specific permission within a contractor org.
 */
export function has_permission(
  contractor: Contractor | undefined | null,
  user: { username: string } | undefined | null,
  permission_name: keyof ContractorRole,
  userContractors?: Array<{
    spectrum_id: string
    role: string
    role_id?: string
    roles?: string[]
  }>,
): boolean {
  if (!contractor || !user) return false

  const userContractor = userContractors?.find(
    (c) => c.spectrum_id === contractor.spectrum_id,
  )
  if (!userContractor?.roles?.length) return false

  // Org owner has all permissions
  if (contractor.owner_role && userContractor.roles.includes(contractor.owner_role)) {
    return true
  }

  const userRoles = (contractor.roles || []).filter((r) =>
    userContractor.roles!.includes(r.role_id),
  )
  if (userRoles.length === 0) return false

  return userRoles.some((role) => role[permission_name] === true)
}

/**
 * Get the lowest (most powerful) role position for a user in a contractor org.
 */
export function min_position(
  contractor: Contractor,
  user: { username: string },
  userContractors?: Array<{
    spectrum_id: string
    role: string
    role_id?: string
    roles?: string[]
  }>,
): number | undefined {
  if (!contractor || !user) return undefined

  const userContractor = userContractors?.find(
    (c) => c.spectrum_id === contractor.spectrum_id,
  )
  if (!userContractor?.roles?.length) return undefined

  const userRoles = (contractor.roles || []).filter((r) =>
    userContractor.roles!.includes(r.role_id),
  )
  if (userRoles.length === 0) return undefined

  return Math.min(...userRoles.map((role) => role.position))
}

/**
 * Get the lowest (most powerful) role position for a member given their role IDs.
 */
export function getMemberPosition(
  contractor: Contractor,
  memberRoles: string[],
): number | undefined {
  if (!contractor || !memberRoles?.length) return undefined

  const userRoles = (contractor.roles || []).filter((r) =>
    memberRoles.includes(r.role_id),
  )
  if (userRoles.length === 0) return undefined

  return Math.min(...userRoles.map((role) => role.position))
}

/**
 * Check if removing a role from yourself would leave you without manage_roles.
 * Same rules as the API when removing a role from yourself.
 */
export function self_member_role_removal_forbidden(
  memberRoles: ContractorRole[],
  roleIdToRemove: string,
): boolean {
  if (memberRoles.length === 0) return true
  const removing = memberRoles.find((r) => r.role_id === roleIdToRemove)
  if (!removing) return false
  const sorted = [...memberRoles].sort((a, b) => a.position - b.position)
  const top = sorted[0]!
  if (removing.role_id === top.role_id) return true
  if (!top.manage_roles) {
    const manageCarrier = sorted.find((r) => r.manage_roles)
    if (manageCarrier?.role_id === roleIdToRemove) return true
  }
  return false
}

/**
 * Get the user's role object in a contractor org.
 */
export function min_role(
  contractor: Contractor,
  user: { username: string },
  userContractors?: Array<{
    spectrum_id: string
    role: string
    role_id?: string
    roles?: string[]
  }>,
): ContractorRole | undefined {
  if (!contractor || !user) return undefined

  const userContractor = userContractors?.find(
    (c) => c.spectrum_id === contractor.spectrum_id,
  )
  if (!userContractor?.role_id) return undefined

  return (contractor.roles || []).find(
    (r) => r.role_id === userContractor.role_id,
  )
}
