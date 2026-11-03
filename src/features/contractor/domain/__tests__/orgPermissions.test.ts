import { describe, it, expect, vi } from "vitest"
import type { Contractor, ContractorRole } from "../types"
import {
  canManageOrgDetails,
  canManageOrgOrders,
  canManageOrgRecruiting,
  canViewOrgArea,
  type OrgViewer,
} from "../orgPermissions"

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
    role("orders", { manage_orders: true }),
    role("details", { manage_org_details: true }),
    role("recruiting", { manage_recruiting: true }),
    role("member", {}),
  ],
} as Contractor

const member = (roleId: string): OrgViewer => ({
  username: "me",
  contractors: [{ spectrum_id: "ORG", role: roleId, roles: [roleId] }],
})

describe("named org rules", () => {
  it.each([
    [canManageOrgOrders, "orders"],
    [canManageOrgDetails, "details"],
    [canManageOrgRecruiting, "recruiting"],
  ] as const)("%o: its role and the owner, nobody else", (rule, roleId) => {
    expect(rule(org, member(roleId))).toBe(true)
    expect(rule(org, member("owner"))).toBe(true)
    expect(rule(org, member("member"))).toBe(false)
    expect(rule(org, { username: "me" })).toBe(false)
    expect(rule(undefined, member(roleId))).toBe(false)
    expect(rule(org, null)).toBe(false)
  })
})

describe("canViewOrgArea", () => {
  it("checks one permission", () => {
    expect(canViewOrgArea(org, member("orders"), { permission: "manage_orders" })).toBe(true)
    expect(canViewOrgArea(org, member("details"), { permission: "manage_orders" })).toBe(false)
  })

  it("accepts any of several permissions", () => {
    const access = { anyPermission: ["manage_orders", "manage_recruiting"] as (keyof ContractorRole)[] }
    expect(canViewOrgArea(org, member("recruiting"), access)).toBe(true)
    expect(canViewOrgArea(org, member("details"), access)).toBe(false)
  })

  it("uses a custom check over the others", () => {
    const allow = vi.fn(() => true)
    expect(canViewOrgArea(org, member("member"), { allow, permission: "manage_orders" })).toBe(true)
    expect(allow).toHaveBeenCalledWith(org, member("member"))
  })

  it("needs an org, a viewer and a rule", () => {
    expect(canViewOrgArea(null, member("orders"), { permission: "manage_orders" })).toBe(false)
    expect(canViewOrgArea(org, null, { allow: () => true })).toBe(false)
    expect(canViewOrgArea(org, member("owner"), {})).toBe(false)
  })
})
