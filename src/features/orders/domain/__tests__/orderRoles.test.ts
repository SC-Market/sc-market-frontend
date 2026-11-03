import { describe, it, expect } from "vitest"
import type { Contractor, ContractorRole } from "../../../contractor/domain/types"
import { canClaimOrder, isDealOrgMember, orderViewerRoles, type Viewer } from "../orderRoles"

function role(id: string, perms: Partial<ContractorRole>): ContractorRole {
  return {
    contractor_id: "org-1", name: id, position: 1, role_id: id,
    manage_roles: false, manage_orders: false, kick_members: false, manage_invites: false,
    manage_org_details: false, manage_stock: false, manage_market: false, manage_recruiting: false,
    manage_webhooks: false, manage_blocklist: false, claim_orders: false, manage_theme: false,
    ...perms,
  }
}

const org = {
  spectrum_id: "ORG",
  owner_role: "owner",
  roles: [
    role("owner", {}),
    role("manager", { manage_orders: true }),
    role("claimer", { claim_orders: true }),
    role("member", {}),
  ],
} as Contractor

const member = (roleId: string, username = "me"): Viewer => ({
  username,
  contractors: [{ spectrum_id: "ORG", role: roleId, roles: [roleId] }],
})
const stranger: Viewer = { username: "me" }
const admin: Viewer = { username: "me", role: "admin" }
const otherOrgMember: Viewer = { username: "me", contractors: [{ spectrum_id: "OTHER", role: "x", roles: ["manager"] }] }
const customerViewer: Viewer = { username: "buyer" }

const orgOrder = { customer: "buyer", assignedTo: null, contractor: "ORG" }

describe("orderViewerRoles", () => {
  it.each([
    ["anonymous", null, orgOrder, {}],
    ["stranger", stranger, orgOrder, {}],
    ["site admin (not a party)", admin, orgOrder, { siteAdmin: true }],
    ["customer", customerViewer, orgOrder, { customer: true, related: true }],
    ["assignee", stranger, { ...orgOrder, assignedTo: "me" }, { assigned: true, related: true }],
    ["plain org member", member("member"), orgOrder, { orgMember: true, related: true }],
    ["org member with Manage Orders", member("manager"), orgOrder, { orgMember: true, orgManager: true, related: true }],
    ["org member with Claim Orders", member("claimer"), orgOrder, { orgMember: true, orgClaimer: true, related: true }],
    ["org owner (every permission)", member("owner"), orgOrder, { orgMember: true, orgManager: true, orgClaimer: true, related: true }],
    ["member of another org", otherOrgMember, orgOrder, {}],
    ["member, order without an org", member("manager"), { ...orgOrder, contractor: null }, {}],
  ] as const)("%s", (_name, viewer, order, expected) => {
    expect(orderViewerRoles(order, viewer, org)).toEqual({
      customer: false, assigned: false, orgMember: false, orgManager: false,
      orgClaimer: false, siteAdmin: false, related: false,
      ...expected,
    })
  })

  it("a member's permissions are unknown until the org has loaded", () => {
    const roles = orderViewerRoles(orgOrder, member("manager"), undefined)
    expect(roles.orgMember).toBe(true)
    expect(roles.orgManager).toBe(false)
  })

  it("no profile is never the assignee of an unassigned order", () => {
    expect(orderViewerRoles({ customer: undefined, assignedTo: undefined, contractor: null }, undefined, null))
      .toMatchObject({ customer: false, assigned: false })
  })
})

describe("isDealOrgMember", () => {
  it("is true only for members of the order's org", () => {
    expect(isDealOrgMember({ contractor: "ORG" }, member("member"))).toBe(true)
    expect(isDealOrgMember({ contractor: "ORG" }, stranger)).toBe(false)
    expect(isDealOrgMember({ contractor: null }, member("member"))).toBe(false)
    expect(isDealOrgMember({ contractor: "ORG" }, null)).toBe(false)
  })
})

describe("canClaimOrder", () => {
  const manager = { orgManager: true, orgClaimer: false }
  const claimer = { orgManager: false, orgClaimer: true }
  const neither = { orgManager: false, orgClaimer: false }
  const open = { status: "not-started", assignedTo: null, contractor: "ORG" }

  it.each([
    ["claimer, open unassigned org order", open, claimer, true],
    ["manager, open unassigned org order", open, manager, true],
    ["in-progress counts as open", { ...open, status: "in-progress" }, claimer, true],
    ["neither permission", open, neither, false],
    ["already assigned", { ...open, assignedTo: "someone" }, claimer, false],
    ["fulfilled", { ...open, status: "fulfilled" }, claimer, false],
    ["cancelled", { ...open, status: "cancelled" }, manager, false],
    ["no org", { ...open, contractor: null }, manager, false],
  ] as const)("%s", (_name, order, roles, expected) => {
    expect(canClaimOrder(order, roles)).toBe(expected)
  })
})
