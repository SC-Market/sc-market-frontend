import { describe, it, expect } from "vitest"
import { availableOfferActions, canClaimOffer, isOfferOpen } from "../status"

describe("isOfferOpen", () => {
  it.each([
    ["Waiting for Seller", true],
    ["Waiting for Customer", true],
    ["Accepted", false],
    ["Rejected", false],
    // A closed session whose last offer was neither accepted nor rejected (withdrawn)
    ["Counter Offered", false],
  ])("%s → %s", (status, open) => {
    expect(isOfferOpen(status)).toBe(open)
  })
})

describe("canClaimOffer / availableOfferActions", () => {
  const manager = { orgManager: true, orgClaimer: false }
  const claimer = { orgManager: false, orgClaimer: true }
  const neither = { orgManager: false, orgClaimer: false }
  const open = { status: "Waiting for Seller", assignedTo: null, contractor: "ORG" }

  it.each([
    ["claimer, active unassigned", open, claimer, true],
    ["manager, active unassigned", open, manager, true],
    ["waiting for the customer is active too", { ...open, status: "Waiting for Customer" }, claimer, true],
    ["plain member", open, neither, false],
    ["already assigned", { ...open, assignedTo: "someone" }, claimer, false],
    ["accepted", { ...open, status: "Accepted" }, manager, false],
    ["rejected", { ...open, status: "Rejected" }, claimer, false],
    ["withdrawn", { ...open, status: "Counter Offered" }, claimer, false],
    ["no org", { ...open, contractor: null }, manager, false],
  ] as const)("%s", (_name, session, roles, expected) => {
    expect(canClaimOffer(session, roles)).toBe(expected)
    expect(availableOfferActions(session, roles).canClaim).toBe(expected)
  })

  it("managers may reassign an active session, not a closed one", () => {
    expect(availableOfferActions({ ...open, assignedTo: "someone" }, manager).canAssign).toBe(true)
    expect(availableOfferActions({ ...open, status: "Accepted" }, manager).canAssign).toBe(false)
    expect(availableOfferActions(open, claimer).canAssign).toBe(false)
  })
})
