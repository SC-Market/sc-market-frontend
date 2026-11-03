import { describe, it, expect } from "vitest"
import { availableOrderActions, type OrderActions } from "../orderActions"
import type { OrderViewerRoles } from "../orderRoles"

const nobody: OrderViewerRoles = {
  customer: false, assigned: false, orgMember: false, orgManager: false,
  orgClaimer: false, siteAdmin: false, related: false,
}
const R = {
  stranger: nobody,
  customer: { ...nobody, customer: true, related: true },
  assignee: { ...nobody, assigned: true, related: true },
  member: { ...nobody, orgMember: true, related: true },
  claimer: { ...nobody, orgMember: true, orgClaimer: true, related: true },
  manager: { ...nobody, orgMember: true, orgManager: true, related: true },
  admin: { ...nobody, siteAdmin: true },
}
const none: OrderActions = {
  canSetStatus: false, canComplete: false, canStart: false, canResetToNotStarted: false,
  canCancel: false, canAssign: false, canClaim: false,
}
const all = { canSetStatus: true, canComplete: true, canStart: true, canResetToNotStarted: true, canCancel: true }

function order(status: string, assignedTo: string | null = null) {
  return { status, assignedTo, contractor: "ORG" }
}

describe("availableOrderActions: status × role", () => {
  it.each([
    // not-started
    ["not-started", "stranger", {}],
    ["not-started", "customer", { canCancel: true }],
    ["not-started", "member", {}],
    ["not-started", "claimer", { canClaim: true }],
    ["not-started", "assignee", { canSetStatus: true, canComplete: true, canStart: true, canCancel: true }],
    ["not-started", "manager", { canSetStatus: true, canComplete: true, canStart: true, canCancel: true, canAssign: true, canClaim: true }],
    ["not-started", "admin", all],
    // in-progress: no more Begin work
    ["in-progress", "customer", { canCancel: true }],
    ["in-progress", "assignee", { canSetStatus: true, canComplete: true, canCancel: true }],
    ["in-progress", "manager", { canSetStatus: true, canComplete: true, canCancel: true, canAssign: true, canClaim: true }],
    ["in-progress", "admin", all],
    // closed: locked except for site admins
    ["fulfilled", "customer", {}],
    ["fulfilled", "claimer", {}],
    ["fulfilled", "assignee", { canSetStatus: true }],
    ["fulfilled", "manager", { canSetStatus: true }],
    ["fulfilled", "admin", all],
    ["cancelled", "assignee", { canSetStatus: true }],
    ["cancelled", "admin", all],
  ] as const)("%s, %s", (status, who, expected) => {
    expect(availableOrderActions(order(status), R[who])).toEqual({ ...none, ...expected })
  })

  it("nobody can claim an assigned order; managers can still reassign it", () => {
    const a = availableOrderActions(order("not-started", "someone"), R.manager)
    expect(a.canClaim).toBe(false)
    expect(a.canAssign).toBe(true)
  })

  it("an order without an org can't be claimed or assigned", () => {
    const a = availableOrderActions({ status: "not-started", assignedTo: null, contractor: null }, { ...R.claimer, orgManager: true })
    expect(a.canClaim).toBe(false)
  })
})
